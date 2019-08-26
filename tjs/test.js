const { expect } = require("chai");
const TasksJSModule = require("./Module");
const Client = require("./Client");

describe("Client Test", () => {
  //1. Launch an express server
  const express = require("express");
  const expressApp = express();
  const port = 4000;

  const response = ({ body, method }, res) => {
    res.json({ method, body });
  };

  expressApp.get("/test", response);
  expressApp.put("/test", response);
  expressApp.post("/test", response);
  expressApp.delete("/test", response);

  expressApp.listen(port, () => {
    console.log(`(TestServer) listening on port:${port}`);
    it("should be a TasksJS Client Object", () => {
      expect(Client)
        .to.be.an("object")
        .that.has.all.keys("request", "uploadFile")
        .that.respondsTo("request")
        .that.respondsTo("uploadFile");
    });
    it("should be able to make a request returning a promise or calling a callback", () => {
      expect(
        Client.request({ method: "GET", url: `http://localhost:${port}/test` })
      ).to.be.a("promise");
    });

    it("should be able to succesfully make http requests", async () => {
      const url = `http://localhost:${port}/test`;
      const body = { test: true };

      const getResponse = await Client.request({ method: "GET", url, body });
      const putResponse = await Client.request({ method: "PUT", url, body });
      const postResponse = await Client.request({ method: "POST", url, body });
      const delResponse = await Client.request({ method: "DELETE", url, body });

      expect(getResponse)
        .to.be.an("object")
        .that.has.property("method", "GET");
      expect(putResponse)
        .to.be.an("object")
        .that.has.property("method", "PUT")
        .and.property("body", body);
      expect(postResponse)
        .to.be.an("object")
        .that.has.property("method", "POST")
        .and.property("body", body);
      expect(delResponse)
        .to.be.an("object")
        .that.has.property("method", "DELETE")
        .and.property("body", body);
    });
  });
  //2. make test request using client
});
return;
describe("TasksJSModule Tests", function() {
  describe("Create a TasksJSModule instance with all parameters as null: TasksJSModule()", () => {
    it("Should return a TaskJSModule instance with all basic properties and methods", () => {
      expect(TasksJSModule())
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

    it("Should be able to emit and handle events", () => {});

    it("should return null when attempting to retrieve systemObjects: (i.e., TasksJSModules, ServerModules, and Services)", () => {});
  });

  describe("Create a TasksJSModule instance with all parameters: TasksJSModules(name, constructor, systemObjects)", () => {
    it("should have extra methods and properties set inside the constructor function", () => {});
    it("should be able to retrieve systemObjects: : (i.e., TasksJSModules, ServerModules, and Services)", () => {});
  });
});

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
