const TasksJSModule = require("./Module");
const TasksJSServerManager = require("./ServerManager");
const shortid = require("shortid");

module.exports = function TasksJSServerModule(testName) {
  ServerManager = TasksJSServerManager(testName);

  return ServerModuleFactory(ServerManager);
};

function ServerModuleFactory(ServerManager) {
  function ServerModule(name, constructor, systemObjects) {
    //ServerModule is inheriting from TasksJSModule
    const ServerModule = TasksJSModule(name, null, systemObjects);
    const namespace = shortid();
    const nsp = ServerManager.io.of(`/${namespace}`);
    let inferRoute = false;
    let config = { methods: {} };

    //save TasksJSModule.emit function now as it's overwritten below
    const emit = ServerModule.emit;
    //This creates a socket.io namespace for this ServerModulessss
    //here we're using the socket.io namespace to fire an event called dispatch
    ServerModule.emit = (name, data) => {
      const id = shortid();
      //emit WebSocket Event
      nsp.emit("dispatch", { id, name, data });
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

  ServerModule.startServer = ServerManager.startServer;
  return ServerModule;
}
