const { expect } = require("chai");
const TasksJSServerManager = require("./ServerManager");
const request = require("request");

describe("TasksJSServerManager function", () => {
  it("should return an ServerManager instance", () => {
    const ServerManager = TasksJSServerManager();
    expect(ServerManager)
      .to.be.an("Object")
      .that.respondsTo("startServer")
      .that.respondsTo("addModule")
      .that.has.property("io");
  });
});
describe("ServerManager", () => {
  it("should be able use ServerManager.startServer to start a server that will accept requests for ServerModule Connection Data on the given route", async () => {
    const ServerManager = TasksJSServerManager();
    const route = "/testService";
    const port = 4400;
    const url = `http://localhost:${port}${route}`;

    await ServerManager.startServer({ route, port });
    const results = await new Promise(resolve => {
      request({ url, json: true }, (err, res, body) => {
        resolve(body);
      });
    });

    expect(results)
      .to.be.an("Object")
      .that.has.all.keys("TasksJSService", "host", "port", "modules")
      .that.has.property("modules")
      .that.is.an("array").that.is.empty;
  });

  it("should be able to use the ServerManager.addModule method to add data to the ServerManager instance that can be accessed via a GET request", async () => {
    const ServerManager = TasksJSServerManager();
    const route = "/testService";
    const port = 4634;
    const url = `http://localhost:${port}${route}`;

    await ServerManager.startServer({ route, port });

    const options = {
      name: "TestModule",
      namespace: "TestNamespace",
      methods: [],
      inferRoutes: false,
      ServerModule: {}
    };

    ServerManager.addModule(options);
    ServerManager.addModule(options);
    const results = await new Promise(resolve => {
      request({ url, json: true }, (err, res, body) => {
        resolve(body);
      });
    });

    expect(results)
      .to.be.an("object")
      .that.has.all.keys("TasksJSService", "host", "port", "modules")
      .that.has.property("modules")
      .that.is.an("array")
      .that.has.a.lengthOf(2);
    expect(results.modules[0])
      .to.be.an("object")
      .that.has.all.keys("name", "namespace", "methods", "route");
  });

  it("should be able call ServerManager.addModule method before or after calling ServerManager.startServer", async () => {
    const ServerManager = TasksJSServerManager();
    const route = "/testService";
    const port = 4500;
    const url = `http://localhost:${port}${route}`;
    const options = {
      name: "TestModule",
      namespace: "TestNamespace",
      methods: [],
      inferRoutes: false,
      ServerModule: {}
    };

    ServerManager.addModule(options);
    ServerManager.addModule(options);

    await ServerManager.startServer({ route, port });

    const results = await new Promise(resolve => {
      request({ url, json: true }, (err, res, body) => {
        resolve(body);
      });
    });

    expect(results)
      .to.be.an("object")
      .that.has.all.keys("TasksJSService", "host", "port", "modules")
      .that.has.property("modules")
      .that.is.an("array")
      .that.has.a.lengthOf(2);
    expect(results.modules[0])
      .to.be.an("object")
      .that.has.all.keys("name", "namespace", "methods", "route");
  });
});

describe("ServerManager.startServer(ServerConfiguration)", () => {
  it("should be able to use the useREST property to create a REST API route for any method with the name 'get', 'put', 'post' or 'delete'", async () => {
    const ServerManager = TasksJSServerManager();
    const route = "/testService";
    const port = 8372;
    const url = `http://localhost:${port}${route}`;
    const options = {
      name: "TestModule",
      namespace: "TestNamespace",
      methods: [
        { name: "get", method: "put" },
        { name: "put", method: "put" },
        { name: "post", method: "put" },
        { name: "delete", method: "put" }
      ],
      inferRoutes: false,
      ServerModule: {}
    };

    ServerManager.startServer({
      route,
      port,
      useREST: true
    });

    ServerManager.addModule(options);

    const results = await new Promise(resolve => {
      request({ url, json: true }, (err, res, body) => {
        resolve(body);
      });
    });
  });
});
