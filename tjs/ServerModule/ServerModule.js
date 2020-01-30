const TasksJSModule = require("../Module/Module");
const TasksJSServerManager = require("../ServerManager/ServerManager");
const shortid = require("shortid");

module.exports = function TasksJSServerModule(options) {
  const ServerManager = TasksJSServerManager();
  if (options) ServerManager.startServer(options);

  function ServerModule(name, constructor, { systemObjects } = {}) {
    //ServerModule is inheriting from TasksJSModule
    const ServerModule =
      typeof constructor === "object"
        ? TasksJSModule(name, constructor, { systemObjects })
        : TasksJSModule(name, null, { systemObjects });

    const namespace = shortid();
    const nsp = ServerManager.io.of(`/${namespace}`);
    const emit = ServerModule.emit;

    ServerModule.emit = (name, data) => {
      const id = shortid();
      const type = "WebSocket";
      //emit WebSocket Event
      nsp.emit("dispatch", { id, name, data, type });
      //emit the same event locally
      emit(name, data);
    };

    //using constructor.apply let's us determine that the this object will be the ServerModule
    if (typeof constructor === "function") {
      if (constructor.constructor.name === "AsyncFunction")
        throw `(TasksJSServerModuleError): ServerModule construction function cannot be Async`;
      else constructor.apply(ServerModule, []);
    }
    const methods = abstractMethods(ServerModule, [
      "on",
      "emit",
      "config",
      "useModule",
      "useService",
      "useConfig"
    ]);
    ServerManager.addModule({
      name,
      ServerModule,
      namespace,
      methods
    });

    return ServerModule;
  }

  ServerModule.startService = ServerManager.startServer;
  return ServerModule;
};

const abstractMethods = (ServerModule, reserved_methods = []) => {
  const methods = [];
  const props = Object.getOwnPropertyNames(ServerModule);

  props.forEach(name => {
    if (
      typeof ServerModule[name] === "function" &&
      reserved_methods.indexOf(name) === -1
    )
      methods.push({ method: "PUT", name });
  });

  return methods;
};
