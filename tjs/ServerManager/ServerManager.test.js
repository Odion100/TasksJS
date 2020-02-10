const { expect } = require("chai");
const TasksJSServerManager = require("./ServerManager");
const request = require("request");

describe("TasksJSServerManager function", () => {
  it("should return an ServerManager instance", () => {
    const ServerManager = TasksJSServerManager();

    expect(ServerManager)
      .to.be.an("Object")
      .that.has.all.keys(["startService", "addModule", "Server", "WebSocket"])
      .that.respondsTo("startService")
      .that.respondsTo("addModule")
      .that.respondsTo("Server")
      .that.respondsTo("WebSocket");
  });
});
describe("ServerManager", () => {
  it("should be able use ServerManager.startService to start a server that will accept requests for ServerModule Connection Data on the given route", async () => {
    const ServerManager = TasksJSServerManager();
    const route = "/testService";
    const port = 4400;
    const url = `http://localhost:${port}${route}`;

    await ServerManager.startService({ route, port });
    const results = await new Promise(resolve => {
      request({ url, json: true }, (err, res, body) => {
        resolve(body);
      });
    });

    expect(results)
      .to.be.an("Object")
      .that.has.all.keys(
        "TasksJSService",
        "serviceUrl",
        "route",
        "host",
        "port",
        "modules",
        "namespace"
      )
      .that.has.property("modules")
      .that.is.an("array").that.is.empty;
  });

  it("should be able to use the ServerManager.addModule method to add data to the ServerManager instance that can be accessed via a GET request", async () => {
    const ServerManager = TasksJSServerManager();
    const route = "/testService";
    const port = 4634;
    const url = `http://localhost:${port}${route}`;
    const name = "TestModule";
    await ServerManager.startService({ route, port });

    ServerManager.addModule(name, {});
    ServerManager.addModule(name + 1, {});
    const results = await new Promise(resolve => {
      request({ url, json: true }, (err, res, body) => {
        resolve(body);
      });
    });

    expect(results)
      .to.be.an("object")
      .that.has.all.keys(
        "TasksJSService",
        "serviceUrl",
        "route",
        "host",
        "port",
        "modules",
        "namespace"
      )
      .that.has.property("modules")
      .that.is.an("array")
      .that.has.a.lengthOf(2);
    expect(results.modules[0])
      .to.be.an("object")
      .that.has.all.keys("name", "methods", "route", "namespace");
  });

  it("should be able call ServerManager.addModule method before or after calling ServerManager.startService", async () => {
    const ServerManager = TasksJSServerManager();
    const route = "/testService";
    const port = 4500;
    const url = `http://localhost:${port}${route}`;
    const name = "TestModule";

    ServerManager.addModule(name, {});
    ServerManager.addModule(name + 1, {});

    await ServerManager.startService({ route, port });

    const results = await new Promise(resolve => {
      request({ url, json: true }, (err, res, body) => {
        resolve(body);
      });
    });

    expect(results)
      .to.be.an("object")
      .that.has.all.keys(
        "TasksJSService",
        "serviceUrl",
        "route",
        "host",
        "port",
        "modules",
        "namespace"
      )
      .that.has.property("modules")
      .that.is.an("array")
      .that.has.a.lengthOf(2);
    expect(results.modules[0])
      .to.be.an("object")
      .that.has.all.keys("name", "methods", "route", "namespace");
  });
});

describe("ServerManager.startService(ServerConfiguration)", () => {
  it("should be able to use the useREST=true property to create a REST API route for any method with the name 'get', 'put', 'post' or 'delete'", async () => {
    const ServerManager = TasksJSServerManager();
    const route = "/testAPI";
    const port = 8372;
    const url = `http://localhost:${port}${route}`;
    const name = "testObject";
    const object = {
      get: (data, cb) => cb(null, { REST_TEST_PASSED: true }),
      put: () => {},
      post: () => {},
      delete: () => {}
    };

    ServerManager.addModule(name, object);

    await ServerManager.startService({
      route,
      port,
      useREST: true
    });

    const results = await new Promise(resolve => {
      request({ url: `${url}/${name}/id/resource`, json: true }, (err, res, body) => {
        resolve(body);
      });
    });

    expect(results).to.deep.equal({ REST_TEST_PASSED: true });
  });

  it("should be able to use the staticRouting=true property to create static routes to the ServerModules", async () => {
    const ServerManager = TasksJSServerManager();
    const route = "/testAPI";
    const port = 2233;
    const url = `http://localhost:${port}${route}`;
    const name = "testObject";
    const object = {
      get: (data, cb) => cb(null, { SERVICE_TEST_PASSED: true }),
      put: (data, cb) => cb(null, { SERVICE_TEST_PASSED: true }),
      post: () => {},
      delete: () => {}
    };

    ServerManager.addModule(name, object);

    await ServerManager.startService({
      route,
      port,
      staticRouting: true,
      useREST: true
    });

    const results = await new Promise(resolve => {
      request({ url: `${url}/${name}/get`, json: true }, (err, res, body) => {
        resolve(body);
      });
    });

    expect(results).to.deep.equal({ SERVICE_TEST_PASSED: true });
  });
});
