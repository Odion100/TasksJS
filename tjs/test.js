const { expect } = require("chai");
const TasksJSModule = require("./Module");
const Client = require("./Client");

describe("Client", () => {
  //1. Launch an express server
  const express = require("express");
  const expressApp = express();
  const bodyParser = require("body-parser");
  expressApp.use(bodyParser.json({ limit: "5mb" }));
  const port = 4000;
  const url = `http://localhost:${port}/test`;

  const response = (req, res) => {
    const { body, method } = req;
    res.json({ method, ...body });
  };

  expressApp.get("/test", response);
  expressApp.put("/test", response);
  expressApp.post("/test", response);
  expressApp.delete("/test", response);

  it("should be a TasksJSClient Object", () => {
    expect(Client)
      .to.be.an("object")
      .that.has.all.keys("request", "uploadFile")
      .that.respondsTo("request")
      .that.respondsTo("uploadFile");
  });

  it("should be able to succesfully make http requests returning a promise", () => {
    expressApp.listen(port, async () => {
      console.log(`(TestServer) listening on port:${port}`);

      const body = { test: true };

      const getResponse = await Client.request({ method: "GET", url });
      const putResponse = await Client.request({ method: "PUT", url, body });
      const postResponse = await Client.request({ method: "POST", url, body });
      const delResponse = await Client.request({ method: "DELETE", url, body });

      expect(Client.request({ method: "GET", url })).to.be.a("promise");

      expect(getResponse)
        .to.be.an("object")
        .that.has.property("method", "GET");

      expect(putResponse).to.be.an("object");
      expect(putResponse).to.have.property("method", "PUT");
      expect(putResponse).to.have.property("test", true);

      expect(postResponse).to.be.an("object");
      expect(postResponse).to.have.property("method", "POST");
      expect(postResponse).to.have.property("test", true);

      expect(delResponse).to.be.an("object");
      expect(delResponse).to.have.property("method", "DELETE");
      expect(delResponse).to.have.property("test", true);
    });
  });
  return;
  it("should handle bad requests", () => {
    //to do
  });

  it("should be able to upload a file", () => {
    //todo
  });
});

describe("TasksJSModule", function() {
  describe("TasksJSModule instance with all parameters as null: TasksJSModule()", () => {
    const tjsMod = TasksJSModule();
    it("Should return a TaskJSModule instance with all basic properties and methods", () => {
      expect(tjsMod)
        .to.be.an("object")
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
