//express server, socket.io server and middleware needed for TasksJS basic functionality
function TasksJSServer() {
  const cwd = process.cwd();
  //express server
  const express = require("express");
  const server = express();

  //scoket.io server setup
  const socketApp = express();
  const socketServer = require("http").Server(socketApp);
  const io = require("socket.io")(socketServer);
  const socketPort =
    parseInt(Math.random() * parseInt(Math.random() * 10000)) + 1023;
  socketServer.listen(socketPort);

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
  const singleFileUpload = (req, res, next) => {
    sf(req, res, err => {
      if (err) console.log(err, "single file upload error");
      else next();
    });
  };
  const multiFileUpload = (req, res, next) =>
    mf(req, res, (req, res) => next());

  server.use("/sf", singleFileUpload);
  server.use("/mf", multiFileUpload);
  server.use(express.static(cwd + "/public"));
  server.use(bodyParser.json({ limit: "5mb" }));

  server.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT ,DELETE");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-Requested-With,content-type, Authorization"
    );
    next();
  });

  return { server, io, socketPort };
}
module.exports = TasksJSServer();
