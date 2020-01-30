//ServerManager handles routing and mapping request to ServerModules
const TasksJSServer = require("../Server/Server");
const TasksJSRouter = require("./Router");
const shortId = require("shortid");

module.exports = function TasksJSServerManager() {
  //start the Express and WebSocket Servers
  const { server, io, socketPort } = TasksJSServer();
  let serverConfigurations = {
    route: null,
    port: null,
    host: "localhost",
    useREST: false,
    useService: true,
    staticRouting: false,
    middleware: [],
    server,
    io
  };
  const router = TasksJSRouter(server);
  const ServerManager = { server, io };
  const moduleQueue = [];
  const modules = [];

  ServerManager.startServer = options => {
    let { route, host = "localhost", port } = options;
    if (serverConfigurations.serviceUrl)
      throw Error(
        `(TasksJSSeverManagerError): ServerManager.startServer called twice: ${route}`
      );

    //ensure route begins with a slash
    route = route.charAt(0) === "/" ? route : "/" + route;
    const serviceUrl = `${host}:${port}${route}`;
    serverConfigurations = { ...serverConfigurations, ...options, serviceUrl };
    //add route to server that will be used to handle request to "connect" to the Service
    server.get(route, (req, res) => {
      //The route will return connection data for the service including an array of
      //modules (objects) which contain instructions on how to make request to each ServerModule
      res.json({
        modules,
        port,
        host,
        TasksJSService: { serviceUrl }
      });
    });
    //Listen for request on the given port
    return new Promise(resolve =>
      server.listen(port, () => {
        console.log(
          `(TasksJSService): ${route} --> Listening on ${host}:${port}`
        );
        moduleQueue.forEach(options => ServerManager.addModule(options));
        resolve(ServerManager);
      })
    );
  };

  ServerManager.addModule = options => {
    const { name, namespace, methods, ServerModule } = options;
    const {
      host,
      route,
      serviceUrl,
      staticRouting,
      useService,
      useREST
    } = serverConfigurations;
    if (!serviceUrl) return moduleQueue.push(options);

    //create random route to ServerModule unless staticRouting is true
    const path = staticRouting
      ? `${route}/${name}`
      : `${shortId()}/${shortId()}`;
    /// store connection data to the ServerModule in the modules array
    modules.push({
      namespace: `http://${host}:${socketPort}/${namespace}`,
      route: path,
      name,
      methods
    });

    switch (true) {
      case useService:
        router.addService(ServerModule, path);
      case useREST:
        methods.forEach(method => {
          switch (method.name) {
            case "get":
            case "put":
            case "post":
            case "delete":
              router.addREST(ServerModule, `${route}/${name}`, method.name);
          }
        });
    }
  };

  return ServerManager;
};
