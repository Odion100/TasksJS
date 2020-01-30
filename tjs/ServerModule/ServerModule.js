const TasksJSModule = require("../Module/Module");
const TasksJSServerManager = require("../ServerManager/ServerManager");
const shortid = require("shortid");

module.exports = function TasksJSServerModule(options) {
  const ServerManager = TasksJSServerManager();
  if (options) ServerManager.startServer(options);

  function ServerModuleFactory(name, constructor, { systemObjects } = {}) {
    //ServerModule is inheriting from TasksJSModule
    const ServerModule =
      typeof constructor === "object"
        ? TasksJSModule(name, constructor, { systemObjects })
        : TasksJSModule(name, null, { systemObjects });

    const reserved_methods = Object.getOwnPropertyNames(ServerModule);

    if (typeof constructor === "function") {
      if (constructor.constructor.name === "AsyncFunction")
        throw `(TasksJSServerModuleError): ServerModule construction function cannot be Async`;
      else constructor.apply(ServerModule, []);
    }

    ServerManager.attachNamespace(ServerModule, name);
    ServerManager.addModule(name, ServerModule, reserved_methods);

    return ServerModule;
  }

  ServerModuleFactory.startService = ServerManager.startServer;
  return ServerModuleFactory;
};
