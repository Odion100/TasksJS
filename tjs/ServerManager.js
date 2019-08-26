//ServerManager handles routing and maping request to ServerModules

//start the Express and WebSocket Servers
const { server, io, socketPort } = require("./Server");

module.exports = (function ServerManager() {
  const manager = {};
  const ServerModHash = {};
  const maps = [];
  //add properties to manager object
  manager.io = io;
  manager.server = server;

  manager.initServer = (route, port, host, middleware) => {
    //add route that will be used to handle request to "connect" to the Service
    server.get(route, (req, res) => {
      //The route will return connection data for the service including an array of
      //maps (objects) which contain instruction on how to make request to this service
      res.json({ maps, host: `${host}:${port}` });
    });
    //Setup server to handle ServerModule request
    initializeServer(server);
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
    maps.push(map);
    //create a hash to the ServerModule

    ServerModHash[app] = {};
    ServerModHash[app][mod] = ServerModule;
  };

  const initializeServer = server => {
    //validate each request to confirm that the route points to a ServerModule
    server.use((req, res, next) => {
      const { app, mod, fn } = req.params;

      if (ServerModHash[app])
        if (ServerModHash[app][mod])
          if (typeof ServerModHash[app][mod][fn] === "function") return next();

      //return an error
      const { host, port, maps } = manager;
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

      //call the method stored on the ServerModule hash table
      ServerModHash[app][mod][fn](data || {}, (err, results) => {
        if (err) {
          res.status(err.status || 500).json(errorResponseBuilder(err));
        } else {
          res.json(results);
        }
      });
    };

    const errorResponseBuilder = err => {
      //will add more logic after some experiementation
      let { host, port, route } = manager;
      err._service = `${host}:${port}${route}`;
      return err;
    };

    //setup routes
    server.get("/:app/:mod/:fn", requestHandler);
    server.put("/:app/:mod/:fn", requestHandler);
    server.post("/:app/:mod/:fn", requestHandler);
    server.post("/sf/:app/:mod/:fn", requestHandler);
    server.post("/mf/:app/:mod/:fn", requestHandler);
  };
  return manager;
})();
