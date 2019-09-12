module.exports = (TasksJSLoadBalancer, TasksJSApp, Service) => {
  describe("TasksJSLoadBalancer && TasksJSService Reconnection Process Test", () => {
    //spin up a loadblancer
    const lb_route = "loadbalancer";
    const lb_port = "5200";
    const LaodBalancer = TasksJSLoadBalancer({
      route: lb_route,
      port: lb_port
    });
    //register some fack routes
    LaodBalancer.register({ route: app_route, port: 9090 });
    LaodBalancer.register({ route: app_route, port: 9001 });
    LaodBalancer.register({ route: app_route, port: 9092 });
    //spin up an app, connect and register the connection with loadbalancer service
    const app_route = "my/app";
    const app_port = "3234";
    const serverMod = function() {
      this.testMethod = (data, cb) => {
        data.testPassed = true;
        cb(null, data);
      };
    };
    App.initService({ route: app_route, port: app_port })
      .loadService({
        route: lb_route,
        port: lb_port
      })
      .onLoad(service => {
        service.register({
          route: app_route,
          port: app_port
        });
      })
      .ServerModule("testServerModule", serverMod);

    describe("LoadBalancer", () => {
      it("should accept request for connection data on routes of services that have registered thier connection data", () => {});

      it("should remove connection data of unreachable services from the queue", () => {});

      it("should be able to use shareEvent method to share event with registered clones", () => {});

      it("should be able to use assignEvent method to assign just one handler to an event", () => {});
    });

    describe("Service", () => {
      it("should automatically reconnect to a new clone instance when the connection is lost", () => {});
      it("should automatically reconnect to a new clone instance and resend origianlly request when calling a method on a Service with a lost connection", () => {});
    });
  });
};
