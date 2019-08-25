const { expect } = require("chai");
const TasksJSModule = require("../tjs/Module");

describe("TasksJSModule Tests", function() {
  describe("Create a TasksJSModule instance with all parameters as null: TasksJSModule()", () => {
    it("Should return a TaskJSModule instance with all basic properties and methods", () => {
      expect(TasksJSModule())
        .to.be.an("object")
        .that.has.all.keys(
          "on",
          "emit",
          "useModule",
          "useService",
          "useConfig",
          "name"
        )
        .that.respondsTo("on")
        .that.respondsTo("emit")
        .that.respondsTo("useModule")
        .that.respondsTo("useService")
        .that.respondsTo("useConfig");
    });

    it("Should be able to emit and handle events", () => {});

    it("should return null when attempting to retrieve systemObjects: (i.e., TasksJSModules, ServerModules, and Services)", () => {});
  });

  describe("Create a TasksJSModule instance with all parameters: TasksJSModules(name, constructor, systemObjects)", () => {
    it("should have extra methods and properties set inside the constructor function", () => {});
    it("should be able to retrieve systemObjects: : (i.e., TasksJSModules, ServerModules, and Services)", () => {});
  });
});
