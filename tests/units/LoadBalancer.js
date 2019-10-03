const chai = require("chai");
const chaiAsPromise = require("chai-as-promised");
chai.use(chaiAsPromise);
const { expect } = chai;
const obj = require("obj-handler");
module.exports = (LoadBalancer, App, Service) => {
  describe("LoadBalancer && TasksJSService Reconnection Process Test", () => {
    //spin up a loadblancer
    const lb_port = "5200";
    const clones = LoadBalancer({ port: lb_port });
    const app_route = "my/app";
    const ports = [4001, 4002, 4003];
    //test values
    let sharedEventCount = 0;
    let fakeClonesRemoved = true;
    // clones.on("new_clone", data => console.log(data, `<<<------new_clone`));
    // clones.on("new_service", data => console.log(data, `<<<------new_service`));
    // clones.on("location_removed", ({ url, locations }) =>
    //   console.log(locations, "<<<---------------------removed--->", url)
    // );
    // //register some fake routes
    // clones.register({ route: app_route, port: 1111, host: "localhost" }, err =>
    //   console.log(err)
    // );
    //spin up an app, connect and register the connection with loadbalancer service
    before(done => {
      //create three clones that register to the loadbalancer
      let init_count = 0;
      ports.forEach(port =>
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
            // loadBalancer.clones.assignHandler({ id: 1234 }, () => {
            //   console.log(
            //     "assignHandler callback-------------    -o-o-    ---->",
            //     port
            //   );
            //   loadBalancer.clones.shareEvent("test", { testPassed: true });
            // });
          })
          .on("init_complete", () => {
            init_count++;
            if (init_count >= 3) done();
          })
      );
    });

    describe("LoadBalancer", () => {
      it("should accept request for connection data on routes of registered services", () =>
        expect(Service(`http://localhost:${lb_port}/${app_route}`))
          .to.eventually.be.an("object")
          .that.has.all.keys("on", "emit", "testModule", "TasksJSService"));
      //make a request for the same service three times throug the loadbalancer with forceReload option
      //expect each clone to originate from a different location
      it("should roundrobin each clone location when recieve a request for connection data", () =>
        expect(
          new Promise(resolve => {
            const results = [];
            obj(ports).forEachSync(async (port, index, next, last) => {
              const service = await Service(
                `http://localhost:${lb_port}/${app_route}`,
                {
                  forceReload: true
                }
              );

              results.push(service.TasksJSService.serviceUrl);
              if (last) resolve(results);
              else next();
            });
          })
        )
          .to.eventually.be.an("array")
          .that.has.a.lengthOf(3)
          .that.has.members(ports.map(port => `localhost:${port}/my/app`)));

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
// ()=> {
//   const service = await Service(
//     `http://localhost:${lb_port}/${app_route}`,
//     {
//       forceReload: true
//     }
//   );
//   console.log(
//     service.TasksJSService.serviceUrl,
//     "uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu"
//   );
//   resolve(service.TasksJSService.serviceUrl);
// }
