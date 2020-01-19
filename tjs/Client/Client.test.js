const chai = require("chai");
const chaiAsPromise = require("chai-as-promised");
chai.use(chaiAsPromise);
const { expect } = chai;
const fs = require("fs");
const { TasksJSClient } = require("../../index")();
const port = 4789;

//test server setup
require("./test.server")(port);

describe("TasksJSClient Test", () => {
  const Client = TasksJSClient();
  const url = `http://localhost:${port}/test`;
  const singleFileUrl = `http://localhost:${port}/sf/test`;
  const multiFileUrl = `http://localhost:${port}/mf/test`;

  it("should return TasksJSClient instance", () => {
    expect(Client)
      .to.be.an("Object")
      .that.has.all.keys("request", "upload")
      .that.respondsTo("request")
      .that.respondsTo("upload");
  });

  it("should be able to make http requests using a callback", () => {
    const getWithCallback = new Promise((resolve, reject) => {
      console.log("kdlskls");
      Client.request({ method: "GET", url, body: { getWithCallback: true } }),
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
          console.log(results);
        };
    });

    expect(getWithCallback).eventually.to.be.an("Objdddddect");
  });

  /*   it("should be able to make http requests using a promise", () => {
    const getWithPromise = Client.request({
      method: "GET",
      url,
      body: { getWithPromise: true }
    });

    expect(getWithPromise)
      .to.eventually.be.an("Object")
      .that.has.property("method", "GET")
      .that.has.property("testPassed", true)
      .that.has.property("getWithPromise", true);
  }); */
});
