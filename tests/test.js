const { expect } = require("chai");
const fs = require("fs");
const {
  //Export these pre-created objects for convenient object destructuring
  //These are the main utilities for app development
  App,
  Client,
  LoadBalancer,
  ServerModule,
  Service,
  //export all factory functions themselves
  TasksJSApp,
  TasksJSLoadBalancer,
  TasksJSServerModule,
  TasksJSServer,
  TasksJSService,
  TasksJSClient,
  TasksJSModule,
  TasksJSServerManager
} = require("../index")();

describe("TasksJSClient && TasksJSServer Tests", async () => {
  //1. Launch an express server
  const port = 4789;
  const url = `http://localhost:${port}/test`;
  const singleFileUrl = `http://localhost:${port}/sf/test`;
  const multiFileUrl = `http://localhost:${port}/mf/test`;

  const body = { testPassed: false };

  const response = (req, res) => {
    const { body, method } = req;
    body.testPassed = true;
    res.json({ method, ...body });
  };

  const uploadResponse = (req, res) => {
    const { file } = req;
    const json = JSON.parse(fs.readFileSync(file.path));

    res.json({ file, ...json });
  };

  const multiUploadResponse = (req, res) => {
    const { files } = req;
    const json = JSON.parse(fs.readFileSync(files[0].path));

    res.json({ files, ...json });
  };
  const { server } = TasksJSServer();
  server.get("/test", response);
  server.put("/test", response);
  server.post("/test", response);
  server.delete("/test", response);
  server.post("/sf/test", uploadResponse);
  server.post("/mf/test", multiUploadResponse);
  server.listen(port, console.log(`(TestServer) listening on port:${port}`));

  describe("Client", () => {
    it("should be a TasksJSClient Object", () => {
      expect(Client)
        .to.be.an("Object")
        .that.has.all.keys("request", "upload")
        .that.respondsTo("request")
        .that.respondsTo("upload");
    });

    it("should be able to succesfully make http requests returning a promise", async () => {
      const get = await Client.request({ method: "GET", url });
      const put = await Client.request({ method: "PUT", url, body });
      const post = await Client.request({ method: "POST", url, body });
      const del = await Client.request({ method: "DELETE", url, body });

      expect(Client.request({ method: "GET", url })).to.be.a("promise");

      expect(get)
        .to.be.an("Object")
        .that.has.property("method", "GET");

      expect(put).to.be.an("Object");
      expect(put).to.have.property("method", "PUT");
      expect(put).to.have.property("testPassed", true);

      expect(post).to.be.an("Object");
      expect(post).to.have.property("method", "POST");
      expect(post).to.have.property("testPassed", true);

      expect(del).to.be.an("Object");
      expect(del).to.have.property("method", "DELETE");
      expect(del).to.have.property("testPassed", true);
    });
  });

  it("should be able to upload one or more files", async () => {
    const file = fs.createReadStream(__dirname + "\\testFile.json");
    const files = [
      fs.createReadStream(__dirname + "\\testFile.json"),
      fs.createReadStream(__dirname + "\\testFile.json")
    ];
    const uploadResponse = await Client.upload({
      url: singleFileUrl,
      formData: { file }
    });
    expect(uploadResponse)
      .to.be.an("Object")
      .that.has.property("testPassed", true);
    expect(uploadResponse)
      .to.have.property("file")
      .that.is.an("object")
      .has.property("originalname", "testFile.json");
    expect(uploadResponse).to.have.property("fileUploadTest", true);
    const multiUploadResponse = await Client.upload({
      url: multiFileUrl,
      formData: { files }
    });
    expect(multiUploadResponse)
      .to.be.an("Object")
      .that.has.property("testPassed", true);
    expect(multiUploadResponse)
      .to.have.property("files")
      .that.is.an("Array");
    expect(multiUploadResponse).to.have.property("fileUploadTest", true);
  });

  // it("should handle bad requests", () => {});
});

describe("TasksJSModule", function() {
  describe("...instance without parameters", () => {
    const tjsMod = TasksJSModule();
    it("Should return a TaskJSModule instance with all basic properties and methods", () => {
      expect(tjsMod)
        .to.be.an("Object")
        .that.has.all.keys("on", "emit", "useModule", "useService", "useConfig")
        .that.respondsTo("on")
        .that.respondsTo("emit")
        .that.respondsTo("useModule")
        .that.respondsTo("useService")
        .that.respondsTo("useConfig");
    });
    it("Should be able to emit and handle events", () => {
      let eventWasHandled = false;
      let eventWasHandled2 = false;
      //ensuring the ability to set multiple event handlers
      tjsMod.on("test", event => (eventWasHandled = event.data.test));
      tjsMod.on("test", event => (eventWasHandled2 = event.data.test));

      tjsMod.emit("test", { test: true });
      expect(eventWasHandled).to.be.true;
      expect(eventWasHandled2).to.be.true;
    });

    it("should return undefined when attempting to retrieve systemObjects", () => {
      const mod = tjsMod.useModule();
      const service = tjsMod.useService();
      const config = tjsMod.useConfig();

      expect(mod).to.be.undefined;
      expect(service).to.be.undefined;
      expect(config).to.be.undefined;
    });
  });

  describe("...instance with all parameters", () => {
    const mockSystemObjects = {
      Services: { mockService: { ServerModules: { testPassed: true } } },
      Modules: { mockModule: { module: { testPassed: true } } },
      ServerModules: {},
      config: { module: { testPassed: true } }
    };
    const tjsMod = TasksJSModule(
      "testMod", //module name
      function() {
        //constructor function
        const testMod = this;
        testMod.testPassed = true;
        testMod.test = () => {};
        testMod.test2 = () => {};
      },
      mockSystemObjects
    );
    it("should have extra methods and properties added inside the constructor function", () => {
      expect(tjsMod)
        .to.be.an("Object")
        .that.has.all.keys(
          "on",
          "emit",
          "useModule",
          "useService",
          "useConfig",
          "testPassed",
          "test",
          "test2"
        )
        .that.respondsTo("on")
        .that.respondsTo("emit")
        .that.respondsTo("useModule")
        .that.respondsTo("useService")
        .that.respondsTo("useConfig")
        .that.respondsTo("test")
        .that.respondsTo("test2")
        .that.has.property("testPassed", true);
    });

    it("should be able to retrieve systemObjects: : (i.e., Modules, ServerModules, and Services)", () => {
      const mod = tjsMod.useModule("mockModule");
      const service = tjsMod.useService("mockService");
      const config = tjsMod.useConfig();
      const undefinedModule = tjsMod.useModule("nonExisting");
      const undefinedService = tjsMod.useService("nonExisting");
      expect(mod)
        .to.be.an("object")
        .has.property("testPassed", true);
      expect(service)
        .to.be.an("object")
        .has.property("testPassed", true);
      expect(config)
        .to.be.an("object")
        .has.property("testPassed", true);
      expect(undefinedModule).to.be.undefined;
      expect(undefinedService).to.be.undefined;
    });
  });
});

describe("TasksJSServerManager", () => {
  const ServerManager = TasksJSServerManager();

  const route = "/testService";
  const port = 4400;
  const method = "GET";
  const url = `http://localhost:${port}${route}`;
  ServerManager.startServer({ route, port });

  it("should accepts requests for connectionData on given route", async () => {
    //make a request expecting to recieve an empty maps array in the response
    const connectionData = await Client.request({ method, url });
    expect(connectionData)
      .to.be.an("object")
      .has.property("maps")
      .that.is.an("array").that.is.empty;
  });

  //just confirming that modules and be added and retrieved remotely
  it("should be able to add ServerModule data that can be accessed on the give route", async () => {
    const options = {
      name: "TestModule",
      namespace: "TestNamespace",
      methods: [],
      inferRoutes: false,
      ServerModule: {}
    };
    ServerManager.addModule(options);
    const connectionData1 = await Client.request({ method, url });
    expect(connectionData1)
      .to.be.an("object")
      .has.property("maps")
      .that.is.an("array")
      .that.has.a.lengthOf(1);
    expect(connectionData1.maps[0])
      .to.be.an("object")
      .that.has.all.keys(
        "name",
        "namespace",
        "methods",
        "route",
        "port",
        "host"
      );
    ServerManager.addModule(options);
    const connectionData2 = await Client.request({ method, url });

    expect(connectionData2)
      .to.be.an("object")
      .has.property("maps")
      .that.is.an("array")
      .that.has.a.lengthOf(2);
    expect(connectionData2.maps[1])
      .to.be.an("object")
      .that.has.all.keys(
        "name",
        "namespace",
        "methods",
        "route",
        "port",
        "host"
      );
  });
});
return;
describe("TasksJSService && TasksJSServerModule Tests", () => {
  const ServerModule = TasksJSServerModule();
  const mockServerModule = ServerModule("testMod", function() {
    this.testMethod = (data, cb) => {
      data.testPassed = true;
      cb(data);
    };

    this.testMethod2 = (data, cb) => {
      data.testPassed = true;
      cb(data);
    };
  });

  describe("ServerModule", () => {
    it("should be able to start as TasksJSServer via TasksJSServerManager", () => {});
    describe("...instance without systemObjects", () => {
      it("should be a valid TasksJSServerModule instance", () => {});
      it("should add connection data to the TasksJSServerManager", () => {});
    });
  });
  describe("Service", () => {
    it("Should be able to load and recreate ServerModules on the client end", () => {});

    it("should be able to call methods on backend ServerModules it loaded", () => {});

    it("Service should be able to call ServerModule Methods", () => {});

    it(
      "should be able to recieve WebSocket Events emitted from the ServerModule"
    );
  });

  describe("Service && ServerModule interactions", () => {
    describe("TasksJSService", () => {});
  });
});

describe("App & Service Test", () => {
  describe("Creatign a TasksJS App instance", () => {
    //todo
  });

  describe("Initializing a Service, loading a Service, and creating 2 ServerModules and one Module", () => {
    //Remember to test lifecycle events
  });
});

describe("LoadBalancer && Service Test", () => {
  //to do
});
