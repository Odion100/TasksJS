const { expect } = require("chai");
const request = require("request");
const TasksJSServerModule = require("./ServerModule");

describe("ServerModule", () => {
  it("should return a new instance of a ServerModule (fn)", () => {
    const ServerModule = TasksJSServerModule();
    expect(typeof ServerModule).to.equal("function");
    expect(typeof ServerModule.startService).to.equal("function");
  });

  it("should use ServerModule.startServer to initiate a ServerManager instance to host the ServerModule Connection", async () => {
    const ServerModule = TasksJSServerModule();
    const route = "/testService";
    const port = 5500;
    const url = `http://localhost:${port}${route}`;
    const results = await new Promise(resolve => {
      ServerModule.startService({ route, port }, () =>
        request({ url, json: true }, (err, res, body) => {
          resolve(body);
        })
      );
    });

    expect(results)
      .to.be.an("Object")
      .that.has.all.keys("TasksJSService", "host", "port", "mods")
      .that.has.property("mods")
      .that.is.an("array").that.is.empty;
  });
  it("should be able to construct and return a ServerModule object using a constructor function", () => {});

  it("should added each new instance of a ServerModule to a ServerManager instnace", () => {});
});
