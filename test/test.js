const { expect } = require("chai");
const TasksJSModule = require("../tjs/Module");

describe("TasksJSModule Tests", function() {
  describe("Create a TasksJSModule instance with all parameters as null", () => {
    it("Should return a TaskJSModule instance with all basic properties and methods", () => {
      const mod = TasksJSModule();
      expect(mod)
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
  });
});
