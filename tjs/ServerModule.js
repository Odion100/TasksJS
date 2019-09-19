const TasksJSModule = require("./Module");
const TasksJSServerManager = require("./ServerManager");
const shortid = require("shortid");

module.exports = function TasksJSServerModule() {
  const ServerManager = TasksJSServerManager();

  function ServerModule(name, constructor, { systemObjects } = {}) {
    if (typeof constructor === "function") {
      if (constructor.constructor.name === "AsyncFunction")
        throw `(TasksJSServerModuleError): ServerModule construction function cannot be Async`;
    } else
      throw `(TasksJSServerModuleError): ServerModule Factory requires a constructor function as the second parameter`;

    //ServerModule is inheriting from TasksJSModule
    const ServerModule = TasksJSModule(name, null, { systemObjects });
    const namespace = shortid();
    const nsp = ServerManager.io.of(`/${namespace}`);
    let inferRoute = false;
    let config = { methods: {} };

    //save TasksJSModule.emit function now as it's overwritten below
    const emit = ServerModule.emit;
    //This creates a socket.io namespace for this ServerModule
    //here we're using the socket.io namespace to fire an event called dispatch
    ServerModule.emit = (name, data) => {
      const id = shortid();
      const type = "WebSocket";
      //emit WebSocket Event
      nsp.emit("dispatch", { id, name, data, type });
      //emit the same event locally
      emit(name, data);
    };

    ServerModule.config = conf => {
      inferRoute = conf.inferRoute;
      config = conf;
    };

    //using constructor.apply let's us determine that the this object will be the ServerModule
    constructor.apply(ServerModule, []);

    const methods = [];
    const props = Object.getOwnPropertyNames(ServerModule);
    const reservedMethods = [
      "on",
      "emit",
      "config",
      "useModule",
      "useService",
      "useConfig"
    ];
    //loop through each property on the ServerModule that is a function
    //in order to create a config object for each method on the ServerModule
    props.forEach(name => {
      if (
        //exclude ServerModule reserved methods
        reservedMethods.indexOf(name) === -1 &&
        typeof ServerModule[name] === "function"
      ) {
        let method = (config.methods[name] || "PUT").toUpperCase();
        methods.push({ method, name });
      }
    });

    ServerManager.addModule({
      name,
      ServerModule,
      namespace,
      inferRoute,
      methods
    });

    return ServerModule;
  }

  ServerModule.startService = ServerManager.startServer;
  return ServerModule;
};
