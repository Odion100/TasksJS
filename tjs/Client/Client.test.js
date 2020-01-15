const chai = require("chai");
const chaiAsPromise = require("chai-as-promised");
chai.use(chaiAsPromise);
const { expect } = chai;
const fs = require("fs");
const { TasksJSClient } = require("../../index")();
const port = 4789;

const ExpressServerSetup = () => {
  //express server
  const express = require("express");
  const server = express();
  //express middleware
  const bodyParser = require("body-parser");
  const multer = require("multer");
  //express middleware setup
  const TEMP_LOCATION = "./temp";
  const mime = require("mime");
  const shortId = require("shortid");
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, TEMP_LOCATION),
    filename: (req, file, cb) =>
      cb(null, `${shortId()}.${mime.getExtension(file.mimetype)}`)
  });

  //middleware functions
  const sf = multer({ storage: storage }).single("file");
  const mf = multer({ storage: storage }).array("files");
  //the sf and mf functions are used to a extract file from the req during a file upload
  //a property named file and files will be added to the req object respectively
  const singleFileUpload = (req, res, next) =>
    sf(req, res, err => {
      if (err) res.json(errorResponseBuilder(err));
      else next();
    });

  const multiFileUpload = (req, res, next) =>
    mf(req, res, err => {
      if (err) res.json(errorResponseBuilder(err));
      else next();
    });

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

  server.use("/sf", singleFileUpload);
  server.use("/mf", multiFileUpload);
  server.use(bodyParser.json({ limit: "5mb" }));

  server.get("/test", response);
  server.put("/test", response);
  server.post("/test", response);
  server.delete("/test", response);
  server.post("/sf/test", uploadResponse);
  server.post("/mf/test", multiUploadResponse);
  server.listen(port, console.log(`(TestServer) listening on port:${port}`));

  return server;
};
ExpressServerSetup();

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

  it("should be able to make (get) requests using a promise or callback", () => {
    const getWithPromise = Client.request({ method: "GET", url });
    const getWithCallback = new Promise((resolve, reject) => {
      Client.request({ method: "GET", url }),
        (err, results) => {
          if (err) reject(err);
          else resolve(results);
        };
    });
    expect(getWithPromise)
      .to.eventually.be.an("Object")
      .that.has.property("method", "GET");
    expect(getWithCallback)
      .to.eventually.be.an("Object")
      .that.has.property("method", "GET");
  });
});
