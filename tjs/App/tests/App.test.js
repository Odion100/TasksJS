const { expect } = require("chai");
const AppFactory = require("../App");
const HttpClient = require("../../HttpClient/HttpClient")();
const ServiceFactory = require("../../Service/Service");

describe("App Factory", () => {
  it("should return a TasksJS App", () => {
    const App = AppFactory();

    expect(App)
      .to.be.an("object")
      .that.has.all.keys(
        "module",
        "ServerModule",
        "on",
        "emit",
        "startService",
        "loadService",
        "onLoad",
        "config"
      )
      .that.respondsTo("module")
      .that.respondsTo("ServerModule")
      .that.respondsTo("on")
      .that.respondsTo("emit")
      .that.respondsTo("startService")
      .that.respondsTo("loadService")
      .that.respondsTo("onLoad")
      .that.respondsTo("config");
  });
});

describe("App: Initializing Modules and ServerModules", () => {
  it("should be able to use App.module to initialize a module", async () => {
    const App = AppFactory();
    return new Promise(resolve =>
      App.module("test", function() {
        expect(this)
          .to.be.an("object")
          .that.has.all.keys("useModule", "useService", "useConfig", "on", "emit")
          .that.respondsTo("useModule")
          .that.respondsTo("useService")
          .that.respondsTo("useConfig")
          .that.respondsTo("on")
          .that.respondsTo("emit");
      }).module("test2", function() {
        expect(this)
          .to.be.an("object")
          .that.has.all.keys("useModule", "useService", "useConfig", "on", "emit")
          .that.respondsTo("useModule")
          .that.respondsTo("useService")
          .that.respondsTo("useConfig")
          .that.respondsTo("on")
          .that.respondsTo("emit");
        resolve();
      })
    );
  });
  it("should be able to use App.startService to start as Service", async () => {
    const App = AppFactory();
    const route = "test-service";
    const port = "8493";
    const url = `http://localhost:${port}/${route}`;
    App.startService({ route, port });

    const connData = await HttpClient.request({ url });

    expect(connData)
      .to.be.an("Object")
      .that.has.all.keys(
        "TasksJSService",
        "host",
        "port",
        "modules",
        "route",
        "namespace",
        "serviceUrl"
      )
      .that.has.property("modules")
      .that.is.an("array").that.is.empty;
    expect(connData.serviceUrl).to.equal(url);
  });
  it("should be able to use App.ServerModule to add a hosted ServerModule to the Service", async () => {
    const App = AppFactory();
    const route = "test-service";
    const port = "8494";
    const url = `http://localhost:${port}/${route}`;

    App.startService({ route, port })
      .ServerModule("mod", function() {
        this.test = () => {};
        this.test2 = () => {};
      })
      .ServerModule("mod2", function() {
        this.test = () => {};
        this.test2 = () => {};
      });

    const connData = await HttpClient.request({ url });

    expect(connData)
      .to.be.an("Object")
      .that.has.all.keys(
        "TasksJSService",
        "host",
        "port",
        "modules",
        "route",
        "namespace",
        "serviceUrl"
      )
      .that.has.property("modules")
      .that.is.an("array");
    expect(connData.modules).to.have.a.lengthOf(2);
    expect(connData.modules[0])
      .to.be.an("Object")
      .that.has.all.keys("namespace", "route", "name", "methods")
      .that.has.property("methods")
      .that.is.an("array");
    expect(connData.modules[0].methods, [
      { method: "PUT", name: "action" },
      { method: "PUT", name: "action2" }
    ]);
  });

  it('should be able to user App.on("init_complete", callback) fire a callback when App initialization is complete', async () => {
    const App = AppFactory();
    const route = "test-service";
    const port = "8497";

    App.startService({ route, port })
      .ServerModule("mod", function() {
        this.test = () => {};
        this.test2 = () => {};
      })
      .module("mod", function() {
        this.test = () => {};
        this.test2 = () => {};
      });

    await new Promise(resolve =>
      App.on("init_complete", system => {
        console.log(system);
        resolve();
      })
    );
  });

  it("should be a SystemObject", () => {});
});

describe("App: Loading Services", () => {
  it("should be able to use App.loadService to load as hosted Service", () => {});

  it("should be able to use App.loadService(...).onLoad(handler) to fire a callback when the Service connects", () => {});

  it('should use App.on("service_loaded[:name]", callback) to fire when a Service has loaded', () => {});

  it("should be accessible to SystemObjects via the module.useService method", () => {});
});

describe("App: configurations", () => {
  it("should be able to use App.config(constructor) to construct a configuartion module", () => {});

  it("should throw an Error if continuation function is not called during construction", () => {});

  it("should be a SystemObject", () => {});
});
