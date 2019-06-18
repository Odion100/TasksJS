const cwd = process.cwd();
//express server
const express = require("express");
const server = express();

//scoket.io server setup;
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
const TEMP_LOCATION = __dirname + "/temp";
const mime = require("mime");
const shortId = require("shortid");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TEMP_LOCATION),
  filename: (req, file, cb) =>
    cb(null, `${shortId()} . ${mime.getExtension(file.mimetype)}`)
});

//middleware functions
const sf = multer({ storage: storage }).single("file");
const mf = multer({ storage: storage }).array("files");
//the sf and mf functions are used to a extract file from the req during a file upload
//a property named file and files will be added to the req object respectively
const singleFileUpload = (req, res, next) => sf(req, res, (req, res) => next());
const multiFileUpload = (req, res, next) => mf(req, res, (req, res) => next());

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

//TasksJS specific middleware

//validate each request to confirm that the route points to a serverMod method
server.use((req, res, next) => {
  let { app, mod, serverMod, fn } = req.params;

  if (tasks[id])
    if (tasks[id][app])
      if (tasks[id][app][serverMod])
        if (typeof tasks[id][app][serverMod][fn] === "function") return next();

  res
    .status(400)
    .json({ maps, invalidMap: true, service: `${_host}:${_port}` });
});

//all request are handle in the same way.
const requestHandler = (req, res) => {
  let { app, mod, serverMod, fn } = req.params;
  let data = req.body.data;
  //in the case where there was a file upload the file/files should be passed with the data
  data.file = req.file;
  data.files = req.files;

  //call the method stored on the tasks hash table
  tasks[id][app][serverMod][fn](data || {}, (err, results) => {
    if (err) {
      res.status(err.status || 500).json(errorResponseBuilder(err));
    } else {
      res.json(results);
    }
  });
};

const errorResponseBuilder = err => {
  //will add more logic once i've learned what else to do here
  err._service = `${_host}:${_port}${connectionPath}`;
  return err;
};

//setup routes
server.get("/:id/:app/:serverMod/:fn", requestHandler);
server.put("/:id/:app/:serverMod/:fn", requestHandler);
server.post("/:id/:app/:serverMod/:fn", requestHandler);
server.post("/sf/:id/:app/:serverMod/:fn", requestHandler);
server.post("/mf/:id/:app/:serverMod/:fn", requestHandler);

const ServerManager = () => {
  const manager = {};
  manager.server = server;
  manager.maps = [];
  manager.moduleHash = {};

  manager.init = (connectionPath, port, host, middleware) => {
    //add any middlware passed
    middleware = Array.isArray(middleware) ? middleware : [middleware];
    middleware.forEach(mw => {
      if (typeof mw === "function") server.use(mw);
    });
    //save server connection data
    manager.host = host;
    manager.port = port;
    manager.connectionPath = connectionPath;
    //create route to request the maps make request to this service
    server.get(connectionPath, (req, res) => {
      res.json({ maps: manager.maps, host: `${host}:${port}` });
    });
    //Listen for request on the given route
    server.listen(port);
    console.log(
      `TaskJS -- ${connectionPath} Service listening on ${host}:${port}`
    );
    return manager;
  };

  manager.addModule = (modName, serverModule, config, nsp) => {
    /// randomly generate routes to the serverModule
    let id = shortId();
    let app = shortId();
    let serverMod = shortId();
    /// store info on how to connect / make request to the serveModule
    let map = {
      route: [id, app, serverMod],
      modName,
      config,
      nsp: `http://${host}:${socketPort}/${nsp}`,
      methods: Object.getOwnPropertyNames(config)
    };
    manager.maps.push(map);
    //create a hash to the serverModule
    manager.moduleHash[id] = {};
    manager.moduleHash[id][app] = {};
    manager.moduleHash[id][app][serverMod] = serverModule;

    return manager;
  };
  return manager;
};

module.exports = new ServerManager();
