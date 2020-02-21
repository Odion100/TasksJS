//ServerManager handles routing and mapping request to objects
const TasksJSServer = require("./components/Server");
const TasksJSRouter = require("./components/Router");
const SocketEmitter = require("./components/SocketEmitter");
const TasksJSWebSocket = require("./components/WebSocketServer");
const abstractMethods = require("./components/abstractMethods");
const shortId = require("shortid");

module.exports = function TasksJSServerManager() {
  //start the Express and WebSocket Servers
  let serverConfigurations = {
    route: null,
    port: null,
    host: "localhost",
    socketPort: null,
    useREST: false,
    useService: true,
    staticRouting: false,
    middleware: []
  };
  const server = TasksJSServer();
  const router = TasksJSRouter(server);
  const { SocketServer, WebSocket } = TasksJSWebSocket();
  const moduleQueue = [];
  const modules = [];

  const ServerManager = { Server: () => server, WebSocket: () => WebSocket };

  ServerManager.startService = options => {
    let { route, host = "localhost", port, socketPort, staticRouting } = options;

    socketPort = socketPort || parseInt(Math.random() * parseInt(Math.random() * 10000)) + 1023;
    const namespace = staticRouting ? route : shortId();
    SocketServer.listen(socketPort);
    SocketEmitter.apply(ServerManager, [namespace, WebSocket]);

    route = route.charAt(0) === "/" ? route.substr(1) : route;
    route = route.charAt(route.length - 1) === "/" ? route.substr(route.length - 1) : route;
    const serviceUrl = `http://${host}:${port}/${route}`;
    serverConfigurations = { ...serverConfigurations, ...options, serviceUrl, route, socketPort };

    server.get(`/${route}`, (req, res) => {
      //The route will return connection data for the service including an array of
      //modules (objects) which contain instructions on how to make request to each object
      res.json({
        modules,
        port,
        host,
        route: `/${route}`,
        serviceUrl,
        namespace: `http://${host}:${socketPort}/${namespace}`,
        TasksJSService: true
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

  ServerManager.addModule = (name, object, reserved_methods = []) => {
    const {
      host,
      route,
      serviceUrl,
      staticRouting,
      useService,
      useREST,
      socketPort
    } = serverConfigurations;

    if (!serviceUrl) return moduleQueue.push({ name, object, reserved_methods });
    const methods = abstractMethods(object, ["on", "emit", ...reserved_methods], useREST);
    const namespace = staticRouting ? name : shortId();

    SocketEmitter.apply(object, [namespace, WebSocket]);

    if (useService) {
      const path = staticRouting ? `${route}/${name}` : `${shortId()}/${shortId()}`;

      modules.push({
        namespace: `http://${host}:${socketPort}/${namespace}`,
        route: `/${path}`,
        name,
        methods
      });
      methods.forEach(method => router.addService(object, path, method));
    }
    if (useREST)
      methods.forEach(method => {
        switch (method.fn) {
          case "get":
          case "put":
          case "post":
          case "delete":
            router.addREST(object, `${route}/${name}`, method);
        }
      });
  };

  return ServerManager;
};
