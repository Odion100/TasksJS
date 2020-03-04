const { expect } = require("chai");
const AppFactory = require("../App");
const HttpClient = require("../../HttpClient/HttpClient")();
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

describe("App", () => {
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
  it("should be able to use App.startService to start as TasksJSService", async () => {
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
});
describe("App LifeCycle Events", () => {
  it('should be able to use App.on("init_complete") to catch this event', () => {});
});

//should be able to load and use services with the app scope
// should be able to use onLoad when loading a service
//should call onload when service reconnects

//should be able to launch ServerModules and use SystemObjects

//should be able to setup a config module before app initialization

//should fire life cycle events during app initialztion
