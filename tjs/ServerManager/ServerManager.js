//ServerManager handles routing and mapping request to objects
const TasksJSServer = require("../Server/Server");
const TasksJSRouter = require("./Router");
const parseMethods = require("./parseMethods");
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
    middleware: []
  };
  const router = TasksJSRouter(server);
  const ServerManager = { server, io };
  const moduleQueue = [];
  const modules = [];

  ServerManager.startServer = options => {
    let { route, host = "localhost", port } = options;

    //ensure route begins and ends without a slash
    route = route.charAt(0) === "/" ? route.substr(1) : route;
    route = route.charAt(route.length - 1) === "/" ? route.substr(route.length - 1) : route;
    const serviceUrl = `${host}:${port}/${route}`;

    serverConfigurations = { ...serverConfigurations, ...options, serviceUrl, route };

    //add route to server that will be used to handle request to "connect" to the Service
    server.get(`/${route}`, (req, res) => {
      //The route will return connection data for the service including an array of
      //modules (objects) which contain instructions on how to make request to each object
      res.json({
        modules,
        port,
        host,
        TasksJSService: { serviceUrl }
      });
    });

    return new Promise(resolve =>
      server.listen(port, () => {
        console.log(`(TasksJSService): ${route} --> Listening on ${host}:${port}`);
        moduleQueue.forEach(({ name, object, reserved_methods }) =>
          ServerManager.addModule(name, object, reserved_methods)
        );
        moduleQueue.length = 0;
        resolve(ServerManager);
      })
    );
  };

  ServerManager.addModule = (name, object, reserved_methods) => {
    const { route, serviceUrl, staticRouting, useService, useREST } = serverConfigurations;
    if (!serviceUrl) return moduleQueue.push({ name, object, reserved_methods });
    const methods = parseMethods(object, reserved_methods, useREST);

    if (useService) {
      const path = staticRouting ? `${route}/${name}` : `${shortId()}/${shortId()}`;

      modules.push({
        namespace: object.namespace,
        route: `/${path}`,
        name,
        methods
      });
      methods.forEach(method => router.addService(object, path, method));
    }
    if (useREST)
      methods.forEach(method => {
        switch (method.name) {
          case "get":
          case "put":
          case "post":
          case "delete":
            router.addREST(object, `${route}/${name}`, method);
        }
      });
  };

  ServerManager.attachNamespace = (object, namespace) => {
    const { host, staticRouting } = serverConfigurations;
    namespace = !namespace ? shortId() : staticRouting ? namespace : shortId();
    object.namespace = `http://${host}:${socketPort}/${namespace}`;
    object.nsp = ServerManager.io.of(`/${namespace}`);

    const emit = object.emit;

    object.emit = (name, data) => {
      const id = shortid();
      const type = "WebSocket";
      //emit WebSocket Event
      object.nsp.emit("dispatch", { id, name, data, type });
      //emit the same event locally
      if (typeof emit === "function") emit(name, data);
    };
    return object;
  };
  return ServerManager;
};
