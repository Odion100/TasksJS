const { expect } = require("chai");
const AppFactory = require("../App");
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
//should be an tasksjs app

//should be able to initialize modules

//should be able to load and use services with the app scope
// should be able to use onLoad when loading a service
//should call onload when service reconnects

//should be able to launch ServerModules and use SystemObjects

//should be able to setup a config module before app initialization

//should fire life cycle events during app initialztion
