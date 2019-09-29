const chai = require("chai");
const chaiAsPromise = require("chai-as-promised");
chai.use(chaiAsPromise);
const { expect } = chai;

module.exports = (LoadBalancer, App, Service) => {
  describe("LoadBalancer && TasksJSService Reconnection Process Test", () => {
    //spin up a loadblancer
    const lb_port = "5200";
    const clones = LoadBalancer({ port: lb_port });
    const app_route = "my/app";
    //test values
    let sharedEventCount = 0;
    let fakeClonesRemoved = true;
    clones.on("new_clone", data => console.log(data, `<<<------new_clone`));
    clones.on("new_service", data => console.log(data, `<<<------new_service`));
    clones.on("location_removed", ({ url, locations }) =>
      console.log(locations, "<<<---------------------removed--->", url)
    );
    //register some fake routes
    clones.register({ route: app_route, port: 1111, host: "localhost" }, err =>
      console.log(err)
    );
    //spin up an app, connect and register the connection with loadbalancer service
    const LoadBalancerClonesTest = new Promise(resolve => {
      //create three clones that register to the loadbalancer
      [4001, 4002, 4003].forEach(port =>
        App()
          .startService({ route: app_route, port })
          .loadService("loadBalancer", {
            route: "loadbalancer",
            port: lb_port
          })
          .onLoad(loadBalancer => {
            loadBalancer.clones.register(
              {
                route: app_route,
                port,
                host: "localhost"
              },
              err => {
                if (err) throw err;
              }
            );

            loadBalancer.clones.on("test", () => {
              sharedEventCount++;

              if (sharedEventCount >= 3) resolve({ sharedEventCount });
            });
          })
          .ServerModule("testModule", function() {
            const loadBalancer = this.useService("loadBalancer");
            this.testMethod = (data, cb) => cb({ testPassed: true, ...data });

            //use clones.assignHandler to ensure only one
            loadBalancer.clones.assignHandler({ id: 1234 }, () =>
              loadBalancer.clones.shareEvent("test", { testPassed: true })
            );
          })
      );
    });

    describe("LoadBalancer", () => {
      it("should accept request for connection data on routes of registered services", () =>
        expect(Service(`http://localhost:${lb_port}/${app_route}`))
          .to.eventually.be.an("object")
          .that.has.all.keys(
            "on",
            "emit",
            "testModule",
            "TasksJSService"
          )).timeout(3000);
      //make a request for the same service three times throug the loadbalancer with forceReload option
      //expect each clone to originate from a different location
      // it("should roundrobin each clone location when recieve a request for connection data", () =>
      //   expect(
      //     Promise.all(
      //       [1, 2, 3].map(() =>
      //         Service(`http://localhost:${lb_port}/${app_route}`, {
      //           forceReload: true
      //         })
      //       )
      //     )
      //   ).to.eventually.be.an("array"));

      Promise.all(
        [1, 2, 3].map(
          () =>
            new Promise(async resolve => {
              console.log(
                clones.serviceQueue[0].locations,
                "<<<---locations-------------"
              );
              const service = await Service(
                `http://localhost:${lb_port}/${app_route}`,
                {
                  forceReload: true,
                  wait: 0
                }
              );
              resolve(service);
            })
        )
      ).then(results => {
        console.log(results, "<<<<-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=");
        console.log(
          clones.serviceQueue[0].locations,
          "<<<---locations-------------1"
        );
      });

      // it("should remove connection data of unreachable services from the queue", () => {});

      // it("should be able to use shareEvent method to fire events from the LoadBalancer to registered clones", () => {});

      // it("should handle multiple different routes (Service Discovery)", () => {});
    });

    // describe("Service", () => {
    //   it("should automatically reconnect to a new clone instance when the connection is lost", () => {});
    //   it("should automatically reconnect to a new clone instance and resend origianlly request when calling a method on a Service with a lost connection", () => {});
    //   it("should call onload event when the on reconnection to a Service", () => {});
    // });
  });
};
