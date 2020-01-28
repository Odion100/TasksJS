const { expect } = require("chai");
const request = require("request");
const TasksJSServerModule = require("./ServerModule");

describe("TasksJSServerModule", () => {
  it("should return a new instance of a ServerModule (fn)", () => {
    const ServerModule = TasksJSServerModule();
    expect(typeof ServerModule).to.equal("function");
    expect(typeof ServerModule.startService).to.equal("function");
  });
});

describe("ServerModule function", () => {
  it("should be able to use ServerModule.startServer to initiate a ServerManager instance that hosts the ServerModule Connection Data", async () => {
    const ServerModule = TasksJSServerModule();
    const route = "/testService";
    const port = 5500;
    const url = `http://localhost:${port}${route}`;

    await ServerModule.startService({ route, port });
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

  it("should throw an Error if the first parameter (the constructor function) is not a normal function or object", () => {});
  it("should throw an Error if ServerModule.startService(options) is called twice", () => {});
});

describe("ServerModule(constructor)", () => {
  const ServerModule = TasksJSServerModule();
  const port = 6542;
  const route = "test/service";
  const url = `http://localhost:${port}/${route}`;

  it("should be able to return a ServerModule instance constructed using the 'this' value in the constructor function", () => {
    const mod = ServerModule("mod", function() {
      this.test = () => {};
      this.test2 = () => {};
    });

    expect(mod)
      .to.be.an("Object")
      .that.has.all.keys("on", "emit", "config", "test", "test2")
      .that.respondsTo("on")
      .that.respondsTo("emit")
      .that.respondsTo("config")
      .that.respondsTo("test")
      .that.respondsTo("test2");
  });
  it("should 'Serve' ServerModule connection data created using the 'this' value of the constructor function", async () => {
    await ServerModule.startService({ route, port });

    const results = await new Promise(resolve =>
      request({ url, json: true }, (err, res, body) => resolve(body))
    );

    expect(results)
      .to.be.an("Object")
      .that.has.all.keys("TasksJSService", "host", "port", "modules")
      .that.has.property("modules")
      .that.is.an("array");
    expect(results.modules[0])
      .to.be.an("Object")
      .that.has.all.keys("namespace", "route", "name", "methods")
      .that.has.property("methods")
      .that.is.an("Array");
    expect(results.modules[0].methods, [
      { method: "PUT", name: "test" },
      { method: "PUT", name: "test2" }
    ]);
    expect(results.modules[0].name, "mod");
    expect(results.modules[0].route).to.be.a("String");
    expect(results.modules[0].namespace).to.match(
      new RegExp("https?://localhost:\\d+/.+")
    );
    expect(results.TasksJSServerService, {
      serviceUrl: "localhost:6542/test/service"
    });
    expect(results.host, "localhost");
    expect(results.port, port);
  });
});

describe("ServerModule(object)", () => {
  const ServerModule = TasksJSServerModule();
  const port = 6543;
  const route = "test/service2";
  const url = `http://localhost:${port}/${route}`;
  it("should be able to return a ServerModule instance created using an object as the constructor", () => {
    const mod = ServerModule("mod", {
      action1: () => {},
      action2: () => {}
    });

    expect(mod)
      .to.be.an("Object")
      .that.has.all.keys("on", "emit", "action1", "action2")
      .that.respondsTo("on")
      .that.respondsTo("emit")
      .that.respondsTo("action1")
      .that.respondsTo("action2");
  });
  it("should 'Serve' ServerModule connection data created using an object as the constructor", async () => {
    await ServerModule.startService({ route, port });

    const results = await new Promise(resolve =>
      request({ url, json: true }, (err, res, body) => resolve(body))
    );

    expect(results)
      .to.be.an("Object")
      .that.has.all.keys("TasksJSService", "host", "port", "modules")
      .that.has.property("modules")
      .that.is.an("array");
    expect(results.modules[0])
      .to.be.an("Object")
      .that.has.all.keys("namespace", "route", "name", "methods")
      .that.has.property("methods")
      .that.is.an("Array");
    expect(results.modules[0].methods, [
      { method: "PUT", name: "test" },
      { method: "PUT", name: "test2" }
    ]);
    expect(results.modules[0].name, "mod");
    expect(results.modules[0].route).to.be.a("String");
    expect(results.modules[0].namespace).to.match(
      new RegExp("https?://localhost:\\d+/.+")
    );
    expect(results.TasksJSServerService, {
      serviceUrl: "localhost:6542/test/service"
    });
    expect(results.host, "localhost");
    expect(results.port, port);
  });
});

describe("ServerModule Configurations", () => {});
