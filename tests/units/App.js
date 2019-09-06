module.exports = (TasksJSApp, ServerModule, Service) => {
  return () => {
    const app = TasksJSApp();
    //spin up a new ServerModule
    const smPort = 5643;
    const smRoute = "sm/route";
    const testModule = function() {
      const serverMod = this;
      const { confTestPassed } = this.useConfig();
      const { modTestPassed } = this.useModule("localMod");
      const { testMethod } = this.useService("loadedService");
      serverMod.testMethod = (data, cb) => {
        //do some stuff
        cb(null, { testPassed: true, modTestPassed, confTestPassed });
      };
    };
    ServerModule.startServer({ route: smRoute, port: smPort }, testModule);
    ServerModule("testServerModule", testModule);

    //initialize an app and load the ServerModule into the app
    const appPort = 5498;
    const appRoute = "app";
    let init_complete = false;
    let service_loaded = false;
    let targeted_service_loaded = false;
    let failed_connection = false;
    app
      .initService({ route: appRoute, port: appPort })
      //load the service launched by the ServerModule
      .loadService("loadedService", { route: smRoute, port: smPort })
      .onLoad(function() {
        //the this object should be the loaded service
      })
      .ServerModule("appMod", testModule)
      .module("localMod", function() {
        this.modTestPassed = true;
      })
      .config(function() {
        this.confTestPassed = true;
      })
      .on("init_complete", systemObjects => {
        //confirm that this was called
        init_complete = true;
      })
      .on("service_loaded", service => {
        service_loaded = true;
      })
      .on("service_loaded:loadedService", service => {
        targeted_service_loaded = true;
      })
      .on("failed_connection", err => {
        failed_connection = true;
      });

    //user Service to laod the app

    it("should emit events lifecycle events during app initialization", () => {});

    it("should start a server for retrieving connection data to the app", () => {});

    it("should be able to load and use systemObjects within Modules and ServerModules", () => {});

    it("should be loadable by a TasksJSService instance", async () => {
      //load the service that was launched by the app
      const service = await Service(`http://localhost:${appPort}/${appRoute}`);
    });
  };
};
