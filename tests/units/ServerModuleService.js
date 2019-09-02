const { expect } = require("chai");

module.exports = (TasksJSServerModule, TasksJSService, Client) => {
  return () => {
    const ServerModule = TasksJSServerModule();
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

    const ServerModule2 = TasksJSServerModule();
    const port2 = 6565;
    const route2 = "test/service";
    const url2 = `http://localhost:${port2}/${route2}`;
    const testModule2 = function() {
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
      this.config({
        methods: { testMethod: "post", testMethod2: "delete" },
        inferRoute: true
      });
    };
    ServerModule2.startServer({ port: port2, route: route2 });
    const testMod2 = ServerModule2("testMod2", testModule2);
    //add another module
    ServerModule2("testMod3", testModule);
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
        const testMod = ServerModule("testMod", testModule);

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

        expect(connectionData)
          .to.be.an("object")
          .has.property("mods")
          .that.is.an("array")
          .that.has.a.lengthOf(1);
      });

      it("should be able to configure methods during the construction phase", async () => {
        const connectionData = await Client.request({
          method,
          url: url2
        });

        expect(connectionData)
          .to.be.an("object")
          .has.property("mods")
          .that.is.an("array")
          .that.has.a.lengthOf(2);
        expect(connectionData.mods[0])
          .to.be.an("object")
          .that.has.all.keys("namespace", "route", "name", "methods")
          .that.has.property("route", `${route2}/testMod2`);
        expect(connectionData.mods[0])
          .to.have.property("methods")
          .that.is.an("array")
          .that.has.a.lengthOf(2);
        expect(connectionData.mods[0].methods[0])
          .to.be.an("object")
          .that.has.property("name", "testMethod");
        expect(connectionData.mods[0].methods[0])
          .to.be.an("object")
          .that.has.property("method", "POST");
        expect(connectionData.mods[0].methods[1])
          .to.be.an("object")
          .that.has.property("name", "testMethod2");
        expect(connectionData.mods[0].methods[1])
          .to.be.an("object")
          .that.has.property("method", "DELETE");
      });

      it("should be able to emit local events", () => {
        let eventWasHandled = false;
        let eventWasHandled2 = false;
        //ensuring the ability to set multiple event handlers
        testMod2.on("test", event => (eventWasHandled = event.data.test));
        testMod2.on("test", event => (eventWasHandled2 = event.data.test));

        testMod2.emit("test", { test: true });
        expect(eventWasHandled).to.be.true;
        expect(eventWasHandled2).to.be.true;
      });
    });

    describe("Service", () => {
      it("should be able to load and recreate ServerModules on the client end", async () => {
        const service = await TasksJSService(url);
        expect(service.testMod)
          .to.be.an("object")
          .that.has.all.keys(
            "on",
            "testMethod",
            "testMethod2",
            "__setConnection"
          )
          .that.respondsTo("on")
          .that.respondsTo("testMethod")
          .that.respondsTo("testMethod2")
          .that.respondsTo("__setConnection");
      });

      it("should be able to call methods on backend ServerModules it loaded", async () => {
        const service = await TasksJSService(url);
        const testResults = await service.testMod.testMethod({
          testPassed: false
        });
        expect(testResults)
          .to.be.an("object")
          .that.has.property("testPassed", true);

        let test2Results;
        try {
          test2Results = await service.testMod.testMethod2({
            testPassed: false
          });
        } catch (err) {
          test2Results = err;
        }
        expect(test2Results)
          .to.be.an("object")
          .that.has.property("TasksJSServerError");
        expect(test2Results).to.have.property("testPassed", true);
      });

      it("should be able to upload one are more files to the ServerModule", () => {
        //
      });
      it("should be able to recieve WebSocket Events emitted from the ServerModule", () => {
        //
      });
    });
  };
};
