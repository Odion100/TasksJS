module.exports = (LoadBalancer, App, Service) => {
  describe("LoadBalancer && TasksJSService Reconnection Process Test", () => {
    //spin up a loadblancer
    const lb_port = "5200";
    const clones = LoadBalancer({ port: lb_port });
    const app_route = "my/app";

    clones.on("new_clone", data => console.log(data, `<<<------new_clone`));
    clones.on("new_service", data => console.log(data, `<<<------new_service`));
    clones.on("location_removed", data =>
      console.log(data, `<<<------location_removed`)
    );

    //register some fack routes
    clones.register(
      { route: app_route, port: 9090, host: "localhost" },
      (data, results) => console.log(data, results)
    );
    clones.register(
      { route: app_route, port: 9001, host: "localhost" },
      (data, results) => console.log(data, results)
    );
    clones.register(
      { route: app_route, port: 9092, host: "localhost" },
      (data, results) => console.log(data, results)
    );

    //spin up an app, connect and register the connection with loadbalancer service
    const initApps = new Promise(resolve => {
      //create three clones that register to the loadbalancer
      let init_count = 0;
      [4001, 4002, 4003].forEach(port =>
        App()
          .startService({ route: app_route, port })
          .loadService("loadBalancer", {
            route: "loadbalancer",
            port: lb_port
          })
          .onLoad(loadBalancer => {
            loadBalancer.clones.register({
              route: app_route,
              port,
              host: "localhost"
            });
          })
          .ServerModule("testModule", {
            testMethod: (data, cb) => cb({ testPassed: true, ...data })
          })
          .on("init_complete", () => {
            init_count++;
            if (init_count >= 3) resolve();
          })
      );
    });

    describe("LoadBalancer", () => {
      it("should accept request for connection data on routes of services that have registered thier connection data", () => {});

      it("should remove connection data of unreachable services from the queue", () => {});

      it("should be able to use shareEvent method to fire events from the LoadBalancer to registered clones", () => {});

      it("should be able to use assignEvent method to assign just one handler to an event", () => {});
      it("should emit events:", () => {});
      it("should handle multiple different routes (Service Discovery)", () => {});
    });

    describe("Service", () => {
      it("should automatically reconnect to a new clone instance when the connection is lost", () => {});
      it("should automatically reconnect to a new clone instance and resend origianlly request when calling a method on a Service with a lost connection", () => {});
    });
  });
};
