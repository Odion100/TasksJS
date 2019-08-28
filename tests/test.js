const { expect } = require("chai");
const TasksJSModule = require("../tjs/Module");
const Client = require("../tjs/Client");
const fs = require("fs");

describe("TasksJSClient && TasksJSServer Tests", () => {
  //1. Launch an express server
  const { server } = require("../tjs/Server");
  const port = 4000;
  const url = `http://localhost:${port}/test`;
  const singleFileUrl = `http://localhost:${port}/sf/test`;

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
  server.post("/sf/test", uploadResponse);
  describe("Client", () => {
    it("should be a TasksJSClient Object", () => {
      expect(Client)
        .to.be.an("Object")
        .that.has.all.keys("request", "uploadFile")
        .that.respondsTo("request")
        .that.respondsTo("uploadFile");
    });

    it("should be able to succesfully make http requests returning a promise", () => {
      server.get("/test", response);
      server.put("/test", response);
      server.post("/test", response);
      server.delete("/test", response);

      server.listen(port, async () => {
        console.log(`(TestServer) listening on port:${port}`);

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

    it("should be able to upload a file", async () => {
      const file = fs.createReadStream(__dirname + "\\testFile.json");

      const uploadResponse = await Client.uploadFile({
        url: singleFileUrl,
        formData: { file }
      });

      expect(uploadResponse)
        .to.be.an("Object")
        .that.has.property("testPassed", true);
      expect(uploadResponse)
        .to.have.property("file")
        .that.is.an("object");
      expect(uploadResponse).to.have.property("fileUploadTest", true);

      expect(uploadResponse.file)
        .to.be.an("object")
        .has.property("originalname", "testFile.json");
    });
    return;
    it("should handle bad requests", () => {
      //to do
    });
  });
});

describe("TasksJSModule", function() {
  describe("TasksJSModule instance with all parameters as null: TasksJSModule()", () => {
    const tjsMod = TasksJSModule();
    it("Should return a TaskJSModule instance with all basic properties and methods", () => {
      expect(tjsMod)
        .to.be.an("Object")
        .that.has.all.keys(
          "on",
          "emit",
          "useModule",
          "useService",
          "useConfig",
          "name"
        )
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
    return;
    it("should return null when attempting to retrieve systemObjects: (i.e., TasksJSModules, ServerModules, and Services)", () => {});
  });
  return;
  describe("Create a TasksJSModule instance with all parameters: TasksJSModules(name, constructor, systemObjects)", () => {
    it("should have extra methods and properties set inside the constructor function", () => {});
    it("should be able to retrieve systemObjects: : (i.e., TasksJSModules, ServerModules, and Services)", () => {});
  });
});
return;
describe("ServerManager && ServerModule Tests", () => {
  describe("Creating a ServerManager instance", () => {
    //to do
  });

  describe("Initializing ServerManager-Sever with ServerManagere.init(port, host, route, middleware)", () => {
    it("should be able to recieve get request for maps", () => {
      //todo
    });
  });
  describe("Creating a ServerModule instnace without parameters", () => {
    //should throw an error
  });

  describe("Creating a ServerModule with name and construnctor parameters", () => {
    //todo
  });

  describe("Creating a ServerModule with inferred routes", () => {
    //test if route is what's expected
  });
});

describe("Service && ServerModule Tests", () => {
  //to do
  describe("Loading a Service", () => {
    //todo
  });
  describe("Calling methods on a loaded Service", () => {
    //todo
  });

  describe("Emitting an event from the ServerModule && handling the event from the Service", () => {
    //todo
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
