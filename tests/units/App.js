const chai = require("chai");
const chaiAsPromise = require("chai-as-promised");
chai.use(chaiAsPromise);
const { expect } = chai;

module.exports = (TasksJSApp, ServerModule, Service) => {
  return () => {
    //spin up a new ServerModule
    const smPort = 5643;
    const smRoute = "sm/route";
    ServerModule.startServer({ route: smRoute, port: smPort });
    ServerModule("testServerModule", function() {
      const serverMod = this;
      serverMod.smTestMethod = (data, cb) => {
        data.testPassed = true;
        cb(null, data);
      };
    });

    //initialize an app and load the ServerModule into the app
    const appPort = 5498;
    const appRoute = "app";
    const appInitializer = new Promise(resolve => {
      let init_complete = false;
      let service_loaded = false;
      let targeted_service = false;
      let failed_connection = false;
      let onload_called = false;
      let use_config = false;
      let use_module = false;
      let use_service = false;
      const app = TasksJSApp();

      const serverMod = async function() {
        use_config = this.useConfig().testPassed;
        use_module = this.useModule("localMod").testPassed;
        const service = this.useService("myService");
        const results = await service.testServerModule.smTestMethod({
          service_method_called: true
        });
        use_service = results.testPassed;

        this.testMethod = (data, cb) => {
          data.testPassed = true;
          cb(null, data);
        };
      };

      app
        .initService({ route: appRoute, port: appPort })
        //load the service launched by the ServerModule
        .loadService("fakeService", {
          route: "fakeRoute",
          port: smPort,
          limit: 2,
          wait: 0
        })
        .loadService("myService", { route: smRoute, port: smPort })
        .onLoad(service => {
          onload_called = true;
          service.onload_called = true;
        })
        .ServerModule("appServerMod", serverMod)
        .ServerModule("appModule2", serverMod)
        .module("localMod", function() {
          this.testPassed = true;
        })
        .config(function(loadModules) {
          this.testPassed = true;
          loadModules();
        }) //confirm that this was called
        .on("init_complete", systemObjects => {
          init_complete = true;
        })
        .on("service_loaded", service => (service_loaded = true))
        .on("service_loaded:myService", service => (targeted_service = true))
        .on(
          "service_loaded:myService",
          service => (service.targeted_services = true)
        )
        .on(
          "failed_connection",
          err => (failed_connection = err.connection_attempts === 2)
        )
        .on("init_complete", () =>
          resolve({
            lifeCicleEventsTest: {
              init_complete,
              service_loaded,
              targeted_service,
              failed_connection,
              onload_called
            },
            systemObjectsTest: {
              use_config,
              use_module,
              use_service
            }
          })
        );
    });

    it("should emit lifecycle events during app initialization", () =>
      expect(appInitializer)
        .eventually.to.be.an("object")
        .that.has.property("lifeCicleEventsTest")
        .that.deep.equals({
          init_complete: true,
          service_loaded: true,
          targeted_service: true,
          failed_connection: true,
          onload_called: true
        }));

    /* it("should correctly load other service systemObjects within Modules and ServerModules", () => {});

    it("should be able loaded and recreated on the  client end by a TasksJSService instance", async () => {
      const url = `http://localhost:${appPort}/${appRoute}`;
      const service = await Service(url);
      expect(service)
        .to.be.an("object")
        .that.has.property("appMod")
        .that.respondTo("testMethod");
    }); */
  };
};
