const { expect } = require("chai");

module.exports = (TasksJSServerManager, Client) => {
  describe("TasksJSServerManager", () => {
    describe("ServerManager", () => {
      const ServerManager = TasksJSServerManager();

      const route = "/testService";
      const port = 4400;
      const method = "GET";
      const url = `http://localhost:${port}${route}`;
      ServerManager.startServer({ route, port });

      it("should accepts requests for connectionData on given route", async () => {
        //make a request expecting to recieve an empty mods array in the response
        const connectionData = await Client.request({ method, url });
        expect(connectionData)
          .to.be.an("object")
          .that.has.all.keys("TasksJSService", "host", "port", "mods")
          .that.has.property("mods")
          .that.is.an("array").that.is.empty;
      });

      //just confirming that modules and be added and retrieved remotely
      it("should be able to add ServerModule data that can be accessed on the give route", async () => {
        const options = {
          name: "TestModule",
          namespace: "TestNamespace",
          methods: [],
          inferRoutes: false,
          ServerModule: {}
        };
        ServerManager.addModule(options);
        const connectionData1 = await Client.request({ method, url });
        expect(connectionData1)
          .to.be.an("object")
          .that.has.all.keys("TasksJSService", "host", "port", "mods")
          .that.has.property("mods")
          .that.is.an("array")
          .that.has.a.lengthOf(1);
        expect(connectionData1.mods[0])
          .to.be.an("object")
          .that.has.all.keys("name", "namespace", "methods", "route");
        ServerManager.addModule(options);
        const connectionData2 = await Client.request({ method, url });

        expect(connectionData2)
          .to.be.an("object")
          .that.has.all.keys("TasksJSService", "host", "port", "mods")
          .that.has.property("mods")
          .that.is.an("array")
          .that.has.a.lengthOf(2);
        expect(connectionData2.mods[1])
          .to.be.an("object")
          .that.has.all.keys("name", "namespace", "methods", "route");
      });
    });
  });
};
