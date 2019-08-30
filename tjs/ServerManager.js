//ServerManager handles routing and maping request to ServerModules

//start the Express and WebSocket Servers
const { server, io, socketPort, errorResponseBuilder } = require("./Server")();
const shortId = require("shortid");

module.exports = function TasksJSServerManager() {
  const ServerManager = {};
  const ServerModHash = {};
  const maps = [];
  ServerManager.count = 0;
  //add properties to ServerManager object
  ServerManager.io = io;
  ServerManager.server = server;
  ServerManager.startServer = ({
    route,
    port,
    host = "localhost",
    middleware
  }) => {
    //ensure route begins with a slash
    route = route.charAt(0) === "/" ? route : "/" + route;
    //save conection data on the ServerManager Object
    ServerManager.route = route;
    ServerManager.port = port;
    ServerManager.host = host;
    //add route to server that will be used to handle request to "connect" to the Service
    server.get(route, (req, res) => {
      //The route will return connection data for the service including an array of
      //maps (objects) which contain instruction on how to make request to each ServerModule
      res.json({ maps, TasksJSService: `${host}:${port}/${route}` });
    });
    //Setup server to handle ServerModule request
    initializeServer(ServerManager);
  };

  ServerManager.addModule = ({
    name,
    namespace,
    methods,
    inferRoute,
    ServerModule
  }) => {
    let app = "";
    let mod = "";

    if (inferRoute) {
      /// routes inferred from the name of the service and module
      app = route;
      mod = name;
    } else {
      /// randomly generate routes to the ServerModule
      app = shortId();
      mod = shortId();
    }

    /// store info on how to connect / make request to the ServerModule
    const { port, host } = ServerManager;
    let map = {
      namespace: `http://${host}:${socketPort}/${namespace}`,
      route: `${app}/${name}`,
      port,
      host,
      name,
      methods
    };
    maps.push(map);
    //create a hash to the ServerModule

    ServerModHash[app] = {};
    ServerModHash[app][mod] = ServerModule;
  };

  const initializeServer = ({ route, port, host }) => {
    //validate each request to confirm that the route points to a {route, port, host}Module
    server.use((req, res, next) => {
      const { app, mod, fn } = req.params;

      if (ServerModHash[app])
        if (ServerModHash[app][mod])
          if (typeof ServerModHash[app][mod][fn] === "function") return next();

      //return an error
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
      ServerModHash[app][mod][fn](
        data || {},
        (err, results) => {
          if (err) {
            res.status(err.status || 500).json(errorResponseBuilder(err));
          } else {
            res.json(results);
          }
        },
        req,
        res
      );
    };

    //setup routes
    server.get("/:app/:mod/:fn", requestHandler);
    server.put("/:app/:mod/:fn", requestHandler);
    server.post("/:app/:mod/:fn", requestHandler);
    server.post("/sf/:app/:mod/:fn", requestHandler);
    server.post("/mf/:app/:mod/:fn", requestHandler);

    //Listen for request on the given port
    server.listen(port);
    console.log(`(TasksJSService): ${route} --> Listening on ${host}:${port}`);
  };
  return ServerManager;
};
