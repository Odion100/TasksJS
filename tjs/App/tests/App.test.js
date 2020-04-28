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
describe("App: Loading Services", () => {
  it("should be able to use App.loadService to load as hosted Service", async () => {
    const Service = ServiceFactory();
    const route = "test-service";
    const port = "8499";

    Service.ServerModule("mod", function () {
      this.test = () => {};
      this.test2 = () => {};
    });

    await Service.startService({ route, port });

    await new Promise((resolve) => {
      const App = AppFactory();
      App.loadService("test", { route, port }).on("init_complete", (system) => {
        expect(system.Services[0]).to.be.an("object");

        expect(system.Services[0].client)
          .to.be.an("object")
          .that.has.all.keys("emit", "on", "resetConnection", "disconnect", "mod")
          .that.respondsTo("emit")
          .that.respondsTo("on")
          .that.respondsTo("resetConnection")
          .that.respondsTo("disconnect");
        resolve();
      });
    });
  });

  it("should be able to use App.loadService(...).onLoad(handler) to fire a callback when the Service connects", async () => {
    const Service = ServiceFactory();
    const route = "test-service";
    const port = "8422";

    Service.ServerModule("mod", function () {
      this.test = () => {};
      this.test2 = () => {};
    });

    await Service.startService({ route, port });

    await new Promise((resolve) => {
      const App = AppFactory();
      App.loadService("test", { route, port }).onLoad((test) => {
        expect(test)
          .to.be.an("object")
          .that.has.all.keys("emit", "on", "resetConnection", "disconnect", "mod")
          .that.respondsTo("emit")
          .that.respondsTo("on")
          .that.respondsTo("resetConnection")
          .that.respondsTo("disconnect");
        resolve();
      });
    });
  });

  it('should use App.on("service_loaded[:name]", callback) to fire when a Service has loaded', async () => {
    const Service = ServiceFactory();
    const route = "test-service";
    const port = "8423";

    Service.ServerModule("mod", function () {
      this.test = () => {};
      this.test2 = () => {};
    });

    await Service.startService({ route, port });

    await new Promise((resolve) => {
      const App = AppFactory();
      App.loadService("test", { route, port })
        .on("service_loaded", (test) => {
          expect(test)
            .to.be.an("object")
            .that.has.all.keys("emit", "on", "resetConnection", "disconnect", "mod")
            .that.respondsTo("emit")
            .that.respondsTo("on")
            .that.respondsTo("resetConnection");
        })
        .on("service_loaded:test", (test) => {
          expect(test)
            .to.be.an("object")
            .that.has.all.keys("emit", "on", "resetConnection", "disconnect", "mod")
            .that.respondsTo("emit")
            .that.respondsTo("on")
            .that.respondsTo("resetConnection");
          resolve();
        });
    });
  });

  it("should be accessible to SystemObjects via the module.useService method", async () => {
    const Service = ServiceFactory();
    const route = "test-service";
    const port = "8442";

    Service.ServerModule("mod", function () {
      this.test = () => {};
      this.test2 = () => {};
    });

    await Service.startService({ route, port });

    await new Promise((resolve) => {
      const App = AppFactory();
      App.loadService("test", { route, port })
        .module("module_name", function () {
          const test = this.useService("test");
          expect(test)
            .to.be.an("object")
            .that.has.all.keys("emit", "on", "resetConnection", "disconnect", "mod")
            .that.respondsTo("emit")
            .that.respondsTo("on")
            .that.respondsTo("resetConnection");
          resolve();
        })
        .on("init_complete", resolve);
    });
  });
});

describe("App SystemObjects: Initializing Modules,  ServerModules and configurations", () => {
  it("should be able to use App.module to initialize a module", async () => {
    const App = AppFactory();
    return new Promise((resolve) =>
      App.module("test", function () {
        expect(this)
          .to.be.an("object")
          .that.has.all.keys("useModule", "useService", "useConfig", "on", "emit")
          .that.respondsTo("useModule")
          .that.respondsTo("useService")
          .that.respondsTo("useConfig")
          .that.respondsTo("on")
          .that.respondsTo("emit");
      }).module("test2", function () {
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
      .ServerModule("mod", function () {
        this.test = () => {};
        this.test2 = () => {};
      })
      .ServerModule("mod2", function () {
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
      { method: "PUT", name: "test" },
      { method: "PUT", name: "test2" },
    ]);
  });

  it('should be able to use App.on("init_complete", callback) fire a callback when App initialization is complete', async () => {
    const App = AppFactory();

    App.ServerModule("mod", function () {
      this.test = () => {};
      this.test2 = () => {};
    }).module("mod", function () {
      this.test = () => {};
      this.test2 = () => {};
    });

    await new Promise((resolve) =>
      App.on("init_complete", (system) => {
        expect(system)
          .to.be.an("object")
          .that.has.all.keys(
            "Services",
            "Service",
            "Modules",
            "ServerModules",
            "configurations",
            "App",
            "routing"
          );
        resolve();
      })
    );
  });

  it("should be able to use App.config(constructor) to construct a configuartion module", async () => {
    const App = AppFactory();

    App.ServerModule("mod", function () {
      this.test = () => {};
      this.test2 = () => {};
    })
      .module("mod", function () {
        this.test = () => {};
        this.test2 = () => {};
      })
      .config(function (next) {
        this.test = () => {};
        this.test2 = () => {};
        next();
      });

    await new Promise((resolve) =>
      App.on("init_complete", ({ configurations }) => {
        expect(configurations)
          .to.be.an("object")
          .that.has.all.keys("module", "__constructor")
          .that.has.property("module")
          .that.is.an("object")
          .that.has.all.keys("useService", "useModule", "useConfig", "test", "test2");

        resolve();
      })
    );
  });
});

describe("SystemObjects", () => {
  it("should be able to use this.useModule and this.useService within modules and ServerModule", () => {
    const App = AppFactory();
    App.module("mod1", function () {
      expect(this)
        .to.be.an("object")
        .that.respondsTo("useService")
        .that.respondsTo("useModule")
        .that.respondsTo("useConfig");

      this.testPassed = true;
    })
      .module("mod2", function () {
        expect(this)
          .to.be.an("object")
          .that.respondsTo("useService")
          .that.respondsTo("useModule")
          .that.respondsTo("useConfig");
        const mod1 = this.useModule("mod1");
        const config = this.useConfig();
        expect(mod1.testPassed).to.equal(true);
        expect(config.configPassed).to.equal(true);
      })
      .config(function (next) {
        expect(this)
          .to.be.an("object")
          .that.respondsTo("useService")
          .that.respondsTo("useModule")
          .that.respondsTo("useConfig");
        this.configPassed = true;
        next();
      });
    return new Promise((resolve) => App.on("init_complete", () => resolve()));
  });
});
