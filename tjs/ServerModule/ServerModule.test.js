const { expect } = require("chai");
const TasksJSServerModule = require("./ServerModule");

describe("ServerModule", () => {
  it("should return a new instance of a ServerModule (fn)", () => {
    const ServerModule = TasksJSServerModule();
    console.log(ServerModule);
  });

  it("should use a ServerManager instance to host the ServerModule Connection", () => {});
  it("should be able to construct and return a ServerModule object using a constructor function", () => {});

  it("should added each new instance of a ServerModule to a ServerManager instnace", () => {});
});
