const { expect } = require("chai");
const LoadBalancer = require("../LoadBalancer")();
describe("LoadBalancer", () => {
  it("should return an object with properties: startService (fn), clones (ServerModule)", () => {});

  it("should be able to start the LoadBalancer Service using the LoadBalancer.startService method", () => {});
});
describe("LoadBalancer.clones module", () => {
  it("should be a ServerModule object with additional methods for LoadBalancing", () => {});
  it("should be able to use clones.register(connData, callback) method to host connection", () => {});

  it("should be able to manager the routing to multiple clones of one Service", () => {});

  it("should be able to manage the route of multiple clones of multiple Services. aka Service Discovery", () => {});
  it("should be able to use clones.dispatch(options, callback) fire events to all registered clone Services", () => {});
  it("should be able to use clones.assignDispatch to ensure only one clone responds to an event", () => {});
});
