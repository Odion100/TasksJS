const { expect } = require("chai");
const TasksJSService = require("./Service");

const TasksJSServerModule = require("../ServerModule/ServerModule");

describe("Service(url, options) Factory", () => {
  it("should return a promise that resolve into a backend service", async () => {
    const ServerModule = TasksJSServerModule();
    const port = 6757;
    const route = "service-test";
    const url = `http://localhost:${port}/${route}`;
    ServerModule("TestModule", function() {
      this.action1 = (data, cb) => cb(null, { SERVICE_TEST_PASSED: true, ...data, action1: true });
      this.action2 = (data, cb) => cb(null, { SERVICE_TEST_PASSED: true, ...data, action2: true });
    });

    await ServerModule.startService({ route, port });

    const Service = TasksJSService();
    const TestService = await Service(url);

    const results = await TestService.TestModule.action1({ code: 3 });

    const results2 = await TestService.TestModule.action2({ code: 11 });

    expect(results).to.deep.equal({ SERVICE_TEST_PASSED: true, code: 3, action1: true });
    expect(results2).to.deep.equal({ SERVICE_TEST_PASSED: true, code: 11, action2: true });
  });
});
