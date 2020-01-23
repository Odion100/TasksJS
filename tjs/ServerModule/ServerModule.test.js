const { expect } = require("chai");
const request = require("request");
const TasksJSServerModule = require("./ServerModule");

describe("TasksJSServerModule", () => {
  it("should return a new instance of a ServerModule (fn)", () => {
    const ServerModule = TasksJSServerModule();
    expect(typeof ServerModule).to.equal("function");
    expect(typeof ServerModule.startService).to.equal("function");
  });

  it("should be able to use ServerModule.startServer to initiate a ServerManager instance that hosts the ServerModule Connection Data", async () => {
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
});
describe("ServerModule(constructor)", () => {
  it("should be able to return a ServerModule instance constructed using the 'this' value in the constructor function", () => {});
  it("should 'Serve' ServerModule connection data created using the 'this' value of the constructor function", () => {});
});

describe("ServerModule(object)", () => {
  it("should be able to return a ServerModule instance created using an object as the constructor", () => {});
  it("should 'Serve' ServerModule connection data created using an object as the constructor", () => {});
});
