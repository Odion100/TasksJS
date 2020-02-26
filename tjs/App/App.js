//App.js provides an interface and lifecycle for loading and creating modules
const ServiceFactory = require("../Service/Service");
const ServerModuleFactory = require("../ServerModule/ServerModule");
const Dispatcher = require("../Dispatcher/Dispatcher");
const SystemObject = require("./components/SystemObject");

module.exports = function TasksJSApp() {
  const App = Dispatcher();
  const ServerModule = ServerModuleFactory();
  const serviceQueue = [];
  const moduleQueue = [];
  const serverModuleQueue = [];
  const systemObjects = {
    Services: {},
    Modules: {},
    ServerModules: {},
    config: {}
  };
  SystemObject.apply(App, [systemObjects]);
  App.server = ServerModule.server;
  App.websocket = ServerModule.websocket;
  setTimeout(() => initApp.apply(App, [serviceQueue, serverModuleQueue]), 0);

  App.startService = ({ host, port, route, middlewear }) => {
    ServerModule.startService({
      route,
      port,
      host,
      middlewear
    });

    return App;
  };

  let last_service = "";
  App.loadService = (name, { host = "localhost", port, route, url, limit, wait }) => {
    url = url || `http://${host}:${port}/${route}`;
    last_service = name;
    systemObjects.Services[name] = {
      name,
      url,
      ServerModules: {},
      onLoad: null,
      limit,
      wait
    };

    serviceQueue.push(systemObjects.Services[name]);

    return App;
  };

  App.onLoad = handler => {
    systemObjects.Services[last_service].onLoad = handler;
    return App;
  };

  App.module = (name, constructor) => {
    systemObjects.Modules[name] = {
      name,
      constructor
    };
    moduleQueue.push(systemObjects.Modules[name]);
    return App;
  };

  App.ServerModule = (name, constructor) => {
    systemObjects.ServerModules[name] = {
      name,
      constructor
    };
    serverModuleQueue.push(systemObjects.ServerModules[name]);
    return App;
  };

  App.config = constructor => {
    if (typeof constructor === "function") systemObjects.config.__constructor = constructor;

    return App;
  };

  return App;
};
