module.exports = () => {
  return () => {
    const ServerModule = TasksJSServerModule();
    const mockServerModule = ServerModule("testMod", function() {
      this.testMethod = (data, cb) => {
        data.testPassed = true;
        cb(data);
      };

      this.testMethod2 = (data, cb) => {
        data.testPassed = true;
        cb(data);
      };
    });

    describe("ServerModule", () => {
      it("should be able to start as TasksJSServer via TasksJSServerManager", () => {});
      describe("...instance without systemObjects", () => {
        it("should be a valid TasksJSServerModule instance", () => {});
        it("should add connection data to the TasksJSServerManager", () => {});
      });
    });
    describe("Service", () => {
      it("Should be able to load and recreate ServerModules on the client end", () => {});

      it("should be able to call methods on backend ServerModules it loaded", () => {});

      it("Service should be able to call ServerModule Methods", () => {});

      it(
        "should be able to recieve WebSocket Events emitted from the ServerModule"
      );
    });

    describe("Service && ServerModule interactions", () => {
      describe("TasksJSService", () => {});
    });
  };
};
