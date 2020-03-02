const ServerManagerFactory = require("../ServerManager/ServerManager");
const Dispatcher = require("../Dispatcher/Dispatcher");

module.exports = function ServiceFactory({ defaultModule = {} } = {}) {
  const ServerManager = ServerManagerFactory();
  const { startService, Server, WebSocket } = ServerManager;
  const Service = { startService, Server, WebSocket, defaultModule };

  Service.ServerModule = function(name, constructor, reserved_methods = []) {
    if (typeof constructor === "object" && constructor instanceof Object) {
      const ServerModule = Dispatcher.apply({ ...constructor, ...Service.defaultModule });
      const exclude_methods = [
        ...reserved_methods,
        ...Object.getOwnPropertyNames(Service.defaultModule)
      ];
      ServerManager.addModule(name, ServerModule, exclude_methods);
      return ServerModule;
    }

    if (typeof constructor === "function") {
      if (constructor.constructor.name === "AsyncFunction")
        throw `(ServerModule Error): ServerModule(name, constructor) function requires a non-async function as the constructor`;

      const ServerModule = Dispatcher.apply(Service.defaultModule);
      const exclude_methods = [...reserved_methods, ...Object.getOwnPropertyNames(ServerModule)];
      constructor.apply(ServerModule, [ServerManager.Server(), ServerManager.WebSocket()]);
      ServerManager.addModule(name, ServerModule, exclude_methods);
      return ServerModule;
    }
  };
  return Service;
};
