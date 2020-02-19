const { expect } = require("chai");
const TasksJSService = require("../Service");

const TasksJSServerModule = require("../../ServerModule/ServerModule");

describe("Service(url, options) Factory", () => {
  const ServerModule = TasksJSServerModule();
  const port = 6757;
  const route = "service-test";
  const url = `http://localhost:${port}/${route}`;
  it("should return a promise that resolve into a backend service", async () => {
    const orders = ServerModule("orders", function() {
      this.action1 = (data, cb) => cb(null, { SERVICE_TEST_PASSED: true, ...data, action1: true });
      this.action2 = (data, cb) => cb(null, { SERVICE_TEST_PASSED: true, ...data, action2: true });
    });

    await ServerModule.startService({ route, port });

    const Service = TasksJSService();
    const buAPI = await Service(url);

    expect(buAPI)
      .to.be.an("object")
      .that.has.all.keys("emit", "on", "resetConnection", "orders")
      .that.respondsTo("emit")
      .that.respondsTo("on")
      .that.respondsTo("resetConnection");

    expect(buAPI.orders)
      .to.be.an("object")
      .that.has.all.keys(
        "emit",
        "on",

        "__setConnection",
        "__connectionData",
        "action1",
        "action2"
      )
      .that.respondsTo("emit")
      .that.respondsTo("on")
      .that.respondsTo("emit")
      .that.respondsTo("__setConnection")
      .that.respondsTo("__connectionData")
      .that.respondsTo("action1")
      .that.respondsTo("action2");
  });

  it("should be able to call methods on the backend Service", async () => {
    const Service = TasksJSService();
    const buAPI = await Service(url);

    const results = await buAPI.orders.action1({ code: 3 });

    const results2 = await buAPI.orders.action2({ code: 11 });

    expect(results).to.deep.equal({ SERVICE_TEST_PASSED: true, code: 3, action1: true });
    expect(results2).to.deep.equal({ SERVICE_TEST_PASSED: true, code: 11, action2: true });
  });

  it("should be able to receive events emitted from the backend Service", async () => {});
});
