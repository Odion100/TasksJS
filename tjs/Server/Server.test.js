const { expect } = require("chai");
const TasksJSServer = require("./Server");

describe("Server", () => {
  it("should return a TasksJSServer instance", () => {
    const Server = TasksJSServer();
    expect(Server)
      .to.be.an("Object")
      .that.has.all.keys("server", "io", "socketPort", "errorResponseBuilder");
  });
});
