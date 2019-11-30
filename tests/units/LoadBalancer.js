const chai = require("chai");
const chaiAsPromise = require("chai-as-promised");
chai.use(chaiAsPromise);
const { expect } = chai;

module.exports = (TasksJSLoadBalancer, TasksJSApp, Service, Client) => {
  describe("TasksJSLoadBalancer && TasksJSService Reconnection Process Test", () => {
    //spin up a loadblancer
    const lb_route = "loadbalancer";
    const lb_port = "5200";
    const LaodBalancer = TasksJSLoadBalancer({
      route: lb_route,
      port: lb_port
    });
    const app_route = "my/app";
    const app4_route = "next/app";
    //register some fack routes
    LaodBalancer.register({ route: app_route, port: 9090 });
    LaodBalancer.register({ route: app_route, port: 9001 });
    LaodBalancer.register({ route: app_route, port: 9092 });
    //spin up an app, connect and register the connection with loadbalancer service
    const appInitializer = new Promise(resolve => {
      //initialize four apps, 3 being clones from the same route
      const app1 = TasksJSApp();
      const app2 = TasksJSApp();
      const app3 = TasksJSApp();
      const app4 = TasksJSApp();

      let port = 1234;

      const moduleConstructor = function() {
        this.testMethod = (data, cb) => {
          data.testPassed = true;
          cb(null, data);
        };
      };

      [app1, app2, app3].forEach(app => {
        port++;
        app
          .initService({ route: app_route, port })
          .loadService("loadBalancer", {
            route: lb_route,
            port: lb_port,
            wait: 1000
          })
          .onLoad(loadBalancer => {
            loadBalancer.clones.register({
              route: app_route,
              port
            });
          })
          .ServerModule("testServerModule", moduleConstructor);
      });

      app4
        .initService({ route: app4_route, port: 5555 })
        .loadService("loadBalancer", {
          route: lb_route,
          port: lb_port,
          wait: 1000
        })
        .onLoad(loadBalancer =>
          loadBalancer.clones.register({
            route: app4_route,
            port: 5555
          })
        )
        .ServerModule("testServerModule", moduleConstructor);
    });

    describe("LoadBalancer", () => {
      it("should act as a relay for connection data for registered Services", async () => {
        const url = `http://localhost:${lb_port}/${app_route}`;
        const service = await Service(url);

        expect(service)
          .to.be.an("object")
          .that.has.all.keys("TasksJSService", "host", "port", "mods")
          .that.has.property("mods")
          .that.is.an("array")
          .that.has.a.lengthOf(1);
      });

      /* it("should remove connection data of unreachable services from the queue", () => {});

      it("should be able to use shareEvent method to share event with registered clones", () => {});

      it("should be able to use assignEvent method to assign just one handler to an event", () => {}); */
    });

    /*   describe("Service", () => {
      it("should automatically reconnect to a new clone instance when the connection is lost", () => {});
      it("should automatically reconnect to a new clone instance and resend origianlly request when calling a method on a Service with a lost connection", () => {});
    }); */
  });
};
