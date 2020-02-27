const { expect } = require("chai");
const LoadBalancer = require("../LoadBalancer")();
const ServerModuleFactory = require("../../ServerModule/ServerModule");
const HttpClient = require("../../HttpClient/HttpClient")();
const port = 5030;
const route = "loadbalancer";
describe("LoadBalancer", () => {
  it("should return an object with properties: startService (fn), clones (ServerModule)", () => {
    expect(LoadBalancer).to.be.an("object");
    expect(typeof LoadBalancer.startService).to.equal("function");
  });

  it("should be able to start the LoadBalancer Service using the LoadBalancer.startService method", async () => {
    await LoadBalancer.startService({ port, route });
    const url = `http://localhost:${port}/${route}`;
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
      .that.is.an("array")
      .to.has.a.lengthOf(1);
  });
});
describe("LoadBalancer.clones module", () => {
  it("should be a ServerModule object with additional methods for LoadBalancing", () => {
    expect(LoadBalancer.clones)
      .to.be.an("Object")
      .that.has.all.keys("on", "emit", "register", "dispatch", "assignDispatch", "clones")
      .that.respondsTo("on")
      .that.respondsTo("emit")
      .that.respondsTo("register")
      .that.respondsTo("dispatch")
      .that.respondsTo("assignDispatch")
      .that.has.property("clones")
      .that.is.an("array");
  });
  it("should be able to use clones.register(connData, callback) method to host connection", () => {});

  it("should be able to manager the routing to multiple clones of one Service", () => {});

  it("should be able to manage the route of multiple clones of multiple Services. aka Service Discovery", () => {});
  it("should be able to use clones.dispatch(options, callback) fire events to all registered clone Services", () => {});
  it("should be able to use clones.assignDispatch to ensure only one clone responds to an event", () => {});
});
