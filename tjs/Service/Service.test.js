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
      this.action1 = (data, cb) => cb(null, { SERVICE_TEST_PASSED: true, ...data });
      this.action2 = (data, cb) => cb(null, { SERVICE_TEST_PASSED: true, ...data });
    });

    await ServerModule.startService({ route, port });

    const Service = TasksJSService();
    const TestService = await Service(url);

    console.log(TestService);
  });
});
