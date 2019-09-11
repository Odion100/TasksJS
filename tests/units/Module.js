const { expect } = require("chai");

module.exports = TasksJSModule => {
  return () => {
    describe("...instance without parameters", () => {
      const tjsMod = TasksJSModule();
      it("Should return a TasksJSModule instance with all basic properties and methods", () => {
        expect(tjsMod)
          .to.be.an("Object")
          .that.has.all.keys("on", "emit")
          .that.respondsTo("on")
          .that.respondsTo("emit");
      });

      it("Should be able to emit and handle events", () => {
        let eventWasHandled = false;
        let eventWasHandled2 = false;
        //ensuring the ability to set multiple event handlers
        tjsMod.on("test", data => (eventWasHandled = data.test));
        tjsMod.on("test", data => (eventWasHandled2 = data.test));

        tjsMod.emit("test", { test: true });
        expect(eventWasHandled).to.be.true;
        expect(eventWasHandled2).to.be.true;
      });
    });

    describe("...instance with all parameters", () => {
      const mockSystemObjects = {
        Services: { mockService: { ServerModules: { testPassed: true } } },
        Modules: { mockModule: { module: { testPassed: true } } },
        ServerModules: {},
        config: { module: { testPassed: true } }
      };
      const tjsMod = TasksJSModule(
        "testMod", //module name
        function() {
          //constructor function
          const testMod = this;
          testMod.testPassed = true;
          testMod.test = () => {};
          testMod.test2 = () => {};
        },
        mockSystemObjects
      );

      it("should have extra methods and properties added inside the constructor function", () => {
        expect(tjsMod)
          .to.be.an("Object")
          .that.has.all.keys(
            "on",
            "emit",
            "useModule",
            "useService",
            "useConfig",
            "testPassed",
            "test",
            "test2"
          )
          .that.respondsTo("on")
          .that.respondsTo("emit")
          .that.respondsTo("useModule")
          .that.respondsTo("useService")
          .that.respondsTo("useConfig")
          .that.respondsTo("test")
          .that.respondsTo("test2")
          .that.has.property("testPassed", true);
      });

      it("should be able to retrieve systemObjects: : (i.e., Modules, ServerModules, and Services)", () => {
        const mod = tjsMod.useModule("mockModule");
        const service = tjsMod.useService("mockService");
        const config = tjsMod.useConfig();
        const undefinedModule = tjsMod.useModule("nonExisting");
        const undefinedService = tjsMod.useService("nonExisting");
        expect(mod)
          .to.be.an("object")
          .has.property("testPassed", true);
        expect(service)
          .to.be.an("object")
          .has.property("testPassed", true);
        expect(config)
          .to.be.an("object")
          .has.property("testPassed", true);
        expect(undefinedModule).an("object").that.is.empty;
        expect(undefinedService).an("object").that.is.empty;
      });
    });
  };
};
