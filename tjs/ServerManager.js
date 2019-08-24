//ServerManager handles routing and maping request to ServerModules
module.exports = (function ServerManager() {
  const manager = {};

  manager.init = (route, port, host, middleware) => {
    //start the Express and WebSocket Servers
    const { server, io } = initializeServers(manager);

    //add properties to manager object
    manager.io = io;
    manager.server = server;
    manager.maps = [];
    manager.moduleHash = {};

    //create route that will be used to handle request to "connect" to the Service
    server.get(route, (req, res) => {
      //The route will return connection data for the service including an array of
      //maps (objects) which contain instruction on how to make request to this service
      const { maps } = manager;
      res.json({ maps, host: `${host}:${port}` });
    });
    //Listen for request on the given port
    server.listen(port);
    console.log(`(TaskJS): ${route} Service listening on ${host}:${port}`);
  };
  manager.addModule = (modName, ServerModule) => {
    let { nsp, methods, inferRoute } = ServerModule;
    let app = "";
    let mod = "";

    if (inferRoute) {
      /// routes inferred from the name of the service and module
      app = route;
      mod = modName;
    } else {
      /// randomly generate routes to the ServerModule
      app = shortId();
      mod = shortId();
    }

    /// store info on how to connect / make request to the ServerModule
    const { port, host } = manager;
    let map = {
      nsp: `http://${host}:${socketPort}/${nsp}`,
      route: `${app}/${modName}`,
      port,
      host,
      modName,
      methods
    };
    manager.maps.push(map);
    //create a hash to the ServerModule

    manager.moduleHash[app] = {};
    manager.moduleHash[app][mod] = ServerModule;
  };

  return manager;
})();

function initializeServers(_serverManager) {
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
  const singleFileUpload = (req, res, next) =>
    sf(req, res, (req, res) => next());
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

  //TasksJS specific middleware

  //validate each request to confirm that the route points to a serverMod method
  server.use((req, res, next) => {
    let { app, mod, fn } = req.params;

    if (_serverManager.moduleHash[app])
      if (_serverManager.moduleHash[app][mod])
        if (typeof _serverManager.moduleHash[app][mod][fn] === "function")
          return next();

    let { host, port, maps } = _serverManager;
    res
      .status(400)
      .json({ maps, invalidMapERROR: true, service: `${host}:${port}` });
  });

  //all request are handle in the same way.
  const requestHandler = (req, res) => {
    let { app, mod, fn } = req.params;
    let data = req.body.data;
    //in the case where there was a file upload the file/files should be passed with the data
    data.file = req.file;
    data.files = req.files;

    //call the method stored on the tasks hash table
    _serverManager.moduleHash[app][mod][fn](data || {}, (err, results) => {
      if (err) {
        res.status(err.status || 500).json(errorResponseBuilder(err));
      } else {
        res.json(results);
      }
    });
  };

  const errorResponseBuilder = err => {
    //will add more logic after some experiementation
    let { host, port, route } = _serverManager;
    err._service = `${host}:${port}${route}`;
    return err;
  };

  //setup routes
  server.get("/:app/:mod/:fn", requestHandler);
  server.put("/:app/:mod/:fn", requestHandler);
  server.post("/:app/:mod/:fn", requestHandler);
  server.post("/sf/:app/:mod/:fn", requestHandler);
  server.post("/mf/:app/:mod/:fn", requestHandler);

  return { server, io };
}
