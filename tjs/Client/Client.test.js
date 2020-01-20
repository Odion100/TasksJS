const chai = require("chai");
const chaiAsPromise = require("chai-as-promised");
chai.use(chaiAsPromise);
const { expect } = chai;
const fs = require("fs");
const { TasksJSClient } = require("../../index")();
const port = 4789;
const testServerSetup = require("./test.server");
//test server setup

before(done => testServerSetup(port, done));
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

  it("should be able to make http requests using a callback", async () => {
    const results = await new Promise((resolve, reject) => {
      Client.request(
        {
          method: "GET",
          url: "http://localhost:4789/test",
          body: { getWithCallback: true }
        },
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        }
      );
    });

    expect(results)
      .to.be.an("Object")
      .that.deep.equal({
        getWithCallback: true,
        testPassed: true,
        method: "GET"
      });
  });

  it("should be able to make http requests using a promise", async () => {
    const results = await Client.request({
      method: "GET",
      url,
      body: { getWithPromise: true }
    });

    expect(results)
      .to.be.an("Object")
      .that.deep.equal({
        getWithPromise: true,
        testPassed: true,
        method: "GET"
      });
  });

  it("should be able to make PUT requests", async () => {
    const results = await Client.request({
      method: "GET",
      url,
      body: { getWithPromise: true }
    });

    expect(results)
      .to.be.an("Object")
      .that.deep.equal({
        getWithPromise: true,
        testPassed: true,
        method: "GET"
      });
  });

  it("should be able to make POST requests", async () => {
    const results = await Client.request({
      method: "POST",
      url,
      body: { test: true }
    });

    expect(results)
      .to.be.an("Object")
      .that.deep.equal({
        test: true,
        testPassed: true,
        method: "POST"
      });
  });
  it("should be able to make DELETE requests", async () => {
    const results = await Client.request({
      method: "DELETE",
      url,
      body: { test: true }
    });

    expect(results)
      .to.be.an("Object")
      .that.deep.equal({
        test: true,
        testPassed: true,
        method: "DELETE"
      });
  });

  it("should be able to upload a file", async () => {
    console.log(__dirname + "\\testFile.json");
    const file = fs.createReadStream(__dirname + "\\testFile.json");
    /*   const results = await Client.upload({
      url: singleFileUrl,
      formData: { file }
    });

    expect(results)
      .to.be.an("Object")
      .that.deep.equal({
        testPassed: true,
        file: { originalname: "testFile.json" }
      }); */
  });
});