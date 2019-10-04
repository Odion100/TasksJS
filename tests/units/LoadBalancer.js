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
    const lifecycleEvents = {
      clone_removed_count: 0,
      new_clone_count: 0,
      new_service_count: 0
    };
    //should call new_clone event
    clones.on("new_clone", data => {
      lifecycleEvents.new_clone_count++;
    });
    clones.on("new_service", data => {
      lifecycleEvents.new_service_count++;
    });
    clones.on("location_removed", data => {
      lifecycleEvents.clone_removed_count++;
    });

    //register some fake routes
    clones.register(
      { route: app_route, port: 1111, host: "localhost" },
      err => {
        if (err) console.log(err);
      }
    );
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
            loadBalancer.clones.assignHandler({ id: 1234 }, err => {
              //loadBalancer.clones.shareEvent("test", { testPassed: true });
            });
          })
          .on("init_complete", () => {
            init_count++;
            if (init_count >= 3) done();
          })
      );

      //add another app and route
      App()
        .startService({ route: "test/app/2", port: 4322 })
        .loadService("loadBalancer", {
          route: "loadbalancer",
          port: lb_port
        })
        .onLoad(loadBalancer => {
          loadBalancer.clones.register(
            {
              route: "test/app/2",
              port: 4322,
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
        .ServerModule("Mod2", {
          testFn: (data, cb) => {
            cb({ ...data, testPassed: true });
          }
        });
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

      it("should remove connection data of unreachable services from the queue", () => {
        const { locations } = clones.serviceQueue.find(
          service => (service.route = "/my/app")
        );
        expect(locations)
          .to.be.an("array")
          .that.has.a.lengthOf(3)
          .that.has.members(
            ports.map(port => `http://localhost:${port}/my/app`)
          );
      });

      it("should handle multiple different routes (Service Discovery Test)", () =>
        expect(Service(`http://localhost:${lb_port}/test/app/2`))
          .to.eventually.be.an("object")
          .that.has.all.keys("on", "emit", "Mod2", "TasksJSService")).timeout(
        3000
      );

      it("should emit expected lifecycle events", () => {
        expect(lifecycleEvents).to.deep.equal({
          clone_removed_count: 1,
          new_clone_count: 5,
          new_service_count: 2
        });
      });
      // it("should be able to use shareEvent method to fire events from the LoadBalancer to registered clones", () => {});
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
