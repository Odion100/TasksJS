//ServerManager handles routing and moding request to ServerModuless
const TasksJSServer = require("./Server");
const shortId = require("shortid");

module.exports = function TasksJSServerManager() {
  const ServerManager = {};
  const mods = [];

  //start the Express and WebSocket Servers
  const { server, io, socketPort, errorResponseBuilder } = TasksJSServer();
  //add properties to ServerManager object
  ServerManager.io = io;
  ServerManager.server = server;

  ServerManager.startServer = ({
    route,
    port,
    host = "localhost",
    middleware
  }) => {
    if (ServerManager.serviceUrl)
      throw Error(
        `(TasksJSSeverManagerError): You must only call startServer({route, port, host}) once: ${serviceUrl}`
      );
    const serviceUrl = `${host}:${port}${route}`;
    ServerManager.host = host;
    ServerManager.route = route;
    ServerManager.serviceUrl = serviceUrl;
    //ensure route begins with a slash
    route = route.charAt(0) === "/" ? route : "/" + route;
    //add route to server that will be used to handle request to "connect" to the Service
    server.get(route, (req, res) => {
      //The route will return connection data for the service including an array of
      //mods (objects) which contain instructions on how to make request to each ServerModule
      res.json({
        mods,
        port,
        host,
        TasksJSService: { serviceUrl }
      });
    });
    //Listen for request on the given port
    server.listen(port, () =>
      console.log(`(TasksJSService): ${route} --> Listening on ${host}:${port}`)
    );
  };

  ServerManager.addModule = ({
    name,
    namespace,
    methods,
    inferRoute,
    ServerModule
  }) => {
    const { host, route, serviceUrl } = ServerManager;
    if (!serviceUrl)
      throw Error(
        `(TasksJSSeverManagerError): You must first call startServer({route, port, host}) before adding new modules`
      );
    //create random route to ServerModule unless inferRoute is true
    const path = inferRoute ? `${route}/${name}` : `${shortId()}/${shortId()}`;
    /// store connection data to the ServerModule in the mods array
    mods.push({
      namespace: `http://${host}:${socketPort}/${namespace}`,
      route: path,
      name,
      methods
    });
    //add route to the modules
    addRoute(ServerModule, path);
  };

  //user (express) server.all to handle all request to a given ServerModule
  const addRoute = (ServerModule, route) => {
    server.all(
      [`/${route}/:fn`, `/sf/${route}/:fn`, `/mf/${route}/:fn`],
      (req, res) => {
        const { fn } = req.params;
        const data = req.body.data || {};
        //in the case where there was a file upload the file/files should be passed with the data
        data.file = req.file;
        data.files = req.files;
        //call the method on the ServerModule
        ServerModule[fn](
          data,
          (err, results) => {
            if (err)
              res
                .status(err.status || 500)
                .json(errorResponseBuilder(err, ServerManager.serviceUrl));
            else res.json(results);
          },
          req,
          res
        );
      }
    );
  };
  return ServerManager;
};
