const { expect } = require("chai");
const ClientFactory = require("../Client");
const ServiceFactory = require("../../Service/Service");
const Service = ServiceFactory();
const port = 6757;
const route = "service-test";
const url = `http://localhost:${port}/${route}`;

describe("Client Factory", () => {
  it("should return a TasksJS Client", () => {
    const Client = ClientFactory();
    expect(Client).to.be.an("object").that.has.property("loadService").that.is.a("function");
  });
});
describe("Client", () => {
  it("should be able to use Client.loadService(url, options) to return a promise that resolve into a backend service", async () => {
    Service.ServerModule(
      "orders",
      function () {
        this.action1 = (data, cb) =>
          cb(null, { SERVICE_TEST_PASSED: true, ...data, action1: true });
        this.action2 = (data, cb) =>
          cb(null, { SERVICE_TEST_PASSED: true, ...data, action2: true });
        this.action3 = (data, cb) =>
          cb(null, { SERVICE_TEST_PASSED: true, ...data, action3: true });
        this.multiArgTest = (arg1, arg2, arg3, cb) =>
          cb(null, { SERVICE_TEST_PASSED: true, multiArgTest: true, arg1, arg2, arg3 });
        this.noArgTest = (cb) => cb(null, { SERVICE_TEST_PASSED: true, noArgTest: true });
        this.anyArgTest = function () {
          cb = arguments[2];
          arg1 = arguments[0];
          arg2 = arguments[1];
          cb(null, { SERVICE_TEST_PASSED: true, anyArgTest: true, arg1, arg2 });
        };
      },
      ["action3"]
    );

    await Service.startService({ route, port });

    const Client = ClientFactory();
    const buAPI = await Client.loadService(url);

    expect(buAPI)
      .to.be.an("object")
      .that.has.all.keys("emit", "on", "resetConnection", "disconnect", "orders")
      .that.respondsTo("emit")
      .that.respondsTo("on")
      .that.respondsTo("resetConnection")
      .that.respondsTo("disconnect");

    expect(buAPI.orders)
      .to.be.an("object")
      .that.has.all.keys(
        "emit",
        "on",
        "disconnect",
        "__setConnection",
        "__connectionData",
        "action1",
        "action2",
        "multiArgTest",
        "noArgTest",
        "anyArgTest"
      )
      .that.respondsTo("emit")
      .that.respondsTo("on")
      .that.respondsTo("emit")
      .that.respondsTo("__setConnection")
      .that.respondsTo("__connectionData")
      .that.respondsTo("action1")
      .that.respondsTo("action2")
      .that.respondsTo("multiArgTest")
      .that.respondsTo("noArgTest")
      .that.respondsTo("anyArgTest");
  });
});

describe("Service", () => {
  it("should be able to call methods from the frontend client to the backend ServerModule", async () => {
    const Client = ClientFactory();
    const buAPI = await Client.loadService(url);

    const results = await buAPI.orders.action1({ code: 3 });

    const results2 = await buAPI.orders.action2({ code: 11 });

    expect(results).to.deep.equal({ SERVICE_TEST_PASSED: true, code: 3, action1: true });
    expect(results2).to.deep.equal({ SERVICE_TEST_PASSED: true, code: 11, action2: true });
  });
  it("should be able to send multiple arguments (including a callback function) to the backend ServerModule", async () => {
    const Client = ClientFactory();
    const buAPI = await Client.loadService(url);
    const arg1 = 1,
      arg2 = 2,
      arg3 = 3;

    await new Promise((resolve) =>
      buAPI.orders.multiArgTest(arg1, arg2, arg3, (err, results) => {
        expect(results).to.deep.equal({
          SERVICE_TEST_PASSED: true,
          multiArgTest: true,
          arg1,
          arg2,
          arg3,
        });
        resolve();
      })
    );
  });
  it("should be able to send multiple arguments (excluding a callback and using a promise) to the backend ServerModule", async () => {
    const Client = ClientFactory();
    const buAPI = await Client.loadService(url);
    const arg1 = 4,
      arg2 = 5,
      arg3 = 6;

    const results = await buAPI.orders.multiArgTest(arg1, arg2, arg3);

    expect(results).to.deep.equal({
      SERVICE_TEST_PASSED: true,
      multiArgTest: true,
      arg1,
      arg2,
      arg3,
    });
  });
  it("should be able to send callback as the only arguments to the backend ServerModule", async () => {
    const Client = ClientFactory();
    const buAPI = await Client.loadService(url);

    await new Promise((resolve) =>
      buAPI.orders.noArgTest((err, results) => {
        expect(results).to.deep.equal({
          SERVICE_TEST_PASSED: true,
          noArgTest: true,
        });
        resolve();
      })
    );
  });
  it("should be able to send no arguments and use a promise to the backend ServerModule", async () => {
    const Client = ClientFactory();
    const buAPI = await Client.loadService(url);
    const results = await buAPI.orders.noArgTest();

    expect(results).to.deep.equal({
      SERVICE_TEST_PASSED: true,
      noArgTest: true,
    });
  });
  // it(
  //   "should validate the number of arguments passed from the client function the backend ServerModule function"
  // );
  // it(
  //   "should validate the number of arguments passed from the client function the backend ServerModule function"
  // );
  // it(
  //   "should validate the number of arguments passed from the client function the backend ServerModule function"
  // );

  it("should be able to receive events emitted from the backend Client", async () => {
    const eventName = "testing";
    const eventTester = Service.ServerModule("eventTester", function () {
      const eventTester = this;
      eventTester.sendEvent = () => eventTester.emit(eventName, { testPassed: true });
    });

    const Client = ClientFactory();
    const buAPI = await Client.loadService(url);

    buAPI.eventTester.on(eventName, (data, event) => {
      console.log("Ladies and gentleman... mission accomplish!");
      // console.log(data);
      // console.log(event);
      expect(data).to.deep.equal({ testPassed: true });
      expect(event).to.be.an("object").that.has.all.keys("id", "name", "data", "type");
      expect(event.name).to.equal("testing");
      expect(event.data).to.deep.equal({ testPassed: true });
      expect(event.id).to.be.a("string");
      expect(event.type).to.equal("WebSocket");
    });

    eventTester.emit(eventName, { testPassed: true });
  });

  it("should be able to send REST http requests", async () => {
    const Client = ClientFactory();
    const Service = ServiceFactory();
    const route = "rest-tester";
    const port = "8492";
    const url = `http://localhost:${port}/${route}`;
    const useREST = true;
    Service.ServerModule("restTester", function () {
      this.get = (data, cb) => cb(null, { REST_TEST_PASSED: true, getResponse: true, ...data });

      this.put = (cb) => cb(null, { REST_TEST_PASSED: true, putResponse: true });

      this.post = (cb) => cb(null, { REST_TEST_PASSED: true, postResponse: true });

      this.delete = (cb) => cb(null, { REST_TEST_PASSED: true, deleteResponse: true });
    });

    await Service.startService({ route, port, useREST });
    const buAPI = await Client.loadService(url);
    const getResponse = await buAPI.restTester.get({ name: "GET TEST", id: 12 });
    const putResponse = await buAPI.restTester.put();
    const postResponse = await buAPI.restTester.post();
    const deleteResponse = await buAPI.restTester.delete();
    expect(getResponse).to.deep.equal({
      REST_TEST_PASSED: true,
      getResponse: true,
      name: "GET TEST",
      id: 12,
    });
    expect(putResponse).to.deep.equal({ REST_TEST_PASSED: true, putResponse: true });
    expect(postResponse).to.deep.equal({ REST_TEST_PASSED: true, postResponse: true });
    expect(deleteResponse).to.deep.equal({ REST_TEST_PASSED: true, deleteResponse: true });
  });

  it("should correctly validate the number of arguments passed to the ServerModule", async () => {
    const Client = ClientFactory();
    const buAPI = await Client.loadService(url);

    try {
      await buAPI.orders.noArgTest(3);
    } catch (error) {
      expect(error).to.deep.equal({
        TasksJSServiceError: true,
        message:
          "In valid number of arguments: Expected 1 (including a callback function), Recieved 2 (including a callback function).",
        serviceUrl: url,
        status: 400,
        fn: "noArgTest",
        module_name: "orders",
      });
    }

    try {
      await buAPI.orders.multiArgTest();
    } catch (error) {
      expect(error).to.deep.equal({
        TasksJSServiceError: true,
        message:
          "In valid number of arguments: Expected 4 (including a callback function), Recieved 1 (including a callback function).",
        serviceUrl: url,
        status: 400,
        fn: "multiArgTest",
        module_name: "orders",
      });
    }
    const arg1 = 1;
    const arg2 = 2;
    const results = await buAPI.orders.anyArgTest(arg1, arg2);

    expect(results).to.deep.equal({
      SERVICE_TEST_PASSED: true,
      anyArgTest: true,
      arg1,
      arg2,
    });
  });
});
