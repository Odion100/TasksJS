module.exports = TestServerSetup = (port, done) => {
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
  server.listen(
    port,
    console.log(`(TestServer) listening on port:${port}`),
    done
  );

  return server;
};
