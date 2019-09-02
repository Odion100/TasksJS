const { expect } = require("chai");

module.exports = (TasksJSServerModule, TasksJSService, Client) => {
  return () => {
    const ServerModule = TasksJSServerModule("mod1");
    const ServerModule2 = TasksJSServerModule("mod2");
    const port = 6542;
    const route = "test/service";
    const method = "GET";
    const url = `http://localhost:${port}/${route}`;

    const testModule = function() {
      this.testMethod = (data, cb, req, res) => {
        data.testPassed = true;
        data.method = req.method;
        //send a success response with the second parameter
        cb(null, data);
      };

      this.testMethod2 = (data, cb, req, res) => {
        data.testPassed = true;
        data.method = req.method;
        //respond with an error with the first parameter
        cb(data);
      };
    };

    describe("ServerModule", () => {
      it("should be able to start as TasksJSServer via TasksJSServerManager", async () => {
        ServerModule.startServer({ port, route });
        const connectionData = await Client.request({ method, url });

        expect(connectionData)
          .to.be.an("object")
          .has.property("mods")
          .that.is.an("array").that.is.empty;
      });

      it("Should retrun a TasksJSServerModule instance with methods added in the constructor", () => {
        const testMod = ServerModule("testModx", testModule);

        expect(testMod)
          .to.be.an("Object")
          .that.has.all.keys(
            "on",
            "emit",
            "config",
            "useModule",
            "useService",
            "useConfig",
            "testMethod",
            "testMethod2"
          )
          .that.respondsTo("on")
          .that.respondsTo("emit")
          .that.respondsTo("useModule")
          .that.respondsTo("useService")
          .that.respondsTo("useConfig")
          .that.respondsTo("testMethod")
          .that.respondsTo("testMethod");
      });

      it("should add connection data to the TasksJSServerManager with every new instance", async () => {
        const connectionData = await Client.request({ method, url });
        console.log(connectionData);
        expect(connectionData)
          .to.be.an("object")
          .has.property("mods")
          .that.is.an("array")
          .that.has.a.lengthOf(1);
      });

      it("should be able to configure methods during the construction phase", () => {
        //test something
      });
    });
    return;
    describe("Service", () => {
      it("Should be able to load and recreate ServerModules on the client end", () => {});
      it("should be able to call methods on backend ServerModules it loaded", () => {});
      it("should be able to recieve WebSocket Events emitted from the ServerModule", () => {});
    });
  };
};
