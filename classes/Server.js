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
  let { app, root, mod, fn } = req.params;

  if (ServerManager.moduleHash[root])
    if (ServerManager.moduleHash[root][app])
      if (ServerManager.moduleHash[root][app][mod])
        if (typeof ServerManager.moduleHash[root][app][mod][fn] === "function")
          return next();

  let { host, port, maps } = servManager;
  res
    .status(400)
    .json({ maps, invalidMapERROR: true, service: `${host}:${port}` });
});

//all request are handle in the same way.
const requestHandler = (req, res) => {
  let { root, app, mod, fn } = req.params;
  let data = req.body.data;
  //in the case where there was a file upload the file/files should be passed with the data
  data.file = req.file;
  data.files = req.files;

  //call the method stored on the tasks hash table
  ServerManager.moduleHash[root][app][mod][fn](data || {}, (err, results) => {
    if (err) {
      res.status(err.status || 500).json(errorResponseBuilder(err));
    } else {
      res.json(results);
    }
  });
};

const errorResponseBuilder = err => {
  //will add more logic after some experiementation
  let { host, port, route } = servManager;
  err._service = `${host}:${port}${route}`;
  return err;
};

//setup routes
server.get("/:root/:app/:mod/:fn", requestHandler);
server.put("/:root/:app/:mod/:fn", requestHandler);
server.post("/:root/:app/:mod/:fn", requestHandler);
server.post("/sf/:root/:app/:mod/:fn", requestHandler);
server.post("/mf/:root/:app/:mod/:fn", requestHandler);

const ServerManager = () => {
  const manager = {};
  manager.server = server;
  manager.maps = [];
  manager.moduleHash = {};

  manager.init = (route, port, host, middleware) => {
    //add any middlware passed
    middleware = Array.isArray(middleware) ? middleware : [middleware];
    middleware.forEach(mw => {
      if (typeof mw === "function") server.use(mw);
    });
    //save server connection data
    manager.host = host;
    manager.port = port;
    manager.route = route;
    //create route to request the maps make request to this service
    server.get(route, (req, res) => {
      res.json({ maps: manager.maps, host: `${host}:${port}` });
    });
    //Listen for request on the given route
    server.listen(port);
    console.log(`TaskJS -- ${route} Service listening on ${host}:${port}`);
  };

  manager.addModule = (
    modName,
    serverModule,
    { nsp, methods, inferRoute, root }
  ) => {
    let app = "";
    let mod = "";

    if (inferRoute) {
      /// routes inferred from the name of the service and module
      app = manager.route;
      mod = modName;
    } else {
      /// randomly generate routes to the serverModule
      root = shortId();
      app = shortId();
      mod = shortId();
    }

    /// store info on how to connect / make request to the serveModule
    const { port, host } = manager;
    let map = {
      nsp: `http://${host}:${socketPort}/${nsp}`,
      route: `${root}/${app}/${modName}`,
      port,
      host,
      modName,
      methods
    };
    manager.maps.push(map);
    //create a hash to the serverModule
    manager.moduleHash[root] = {};
    manager.moduleHash[root][app] = {};
    manager.moduleHash[root][app][mod] = serverModule;
  };
  return manager;
};
const servManager = new ServerManager();
module.exports = servManager;
