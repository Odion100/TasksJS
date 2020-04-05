"use strict";
const ServiceFactory = require("../Service/Service");
const SystemObject = require("./components/SystemObject");
const Dispatcher = require("../Dispatcher/Dispatcher");
const initializeApp = require("./components/initializeApp");
module.exports = function TasksJSApp() {
  const App = Dispatcher();
  const Service = ServiceFactory();
  const system = {
    Services: [],
    Modules: [],
    ServerModules: [],
    configurations: {},
    Service,
    App,
  };
  Service.defaultModule = SystemObject(system);
  setTimeout(() => initializeApp(system), 0);

  App.startService = (options) => {
    system.Service.startService(options);
    return App;
  };

  App.loadService = (name, { host = "localhost", port, route, url, limit, wait }) => {
    url = url || `http://${host}:${port}/${route}`;
    system.Services.push({
      name,
      url,
      onLoad: null,
      limit,
      wait,
      client: {},
    });
    return App;
  };

  App.onLoad = (handler) => {
    const service = system.Services[system.Services.length - 1];
    service.onLoad = handler;
    return App;
  };

  App.module = (name, __constructor) => {
    system.Modules.push({
      name,
      __constructor,
      module: SystemObject(system),
    });
    return App;
  };

  App.ServerModule = (name, __constructor) => {
    system.ServerModules.push({
      name,
      __constructor,
    });
    return App;
  };

  App.config = (__constructor) => {
    if (typeof __constructor === "function")
      system.configurations = { __constructor, module: SystemObject(system) };
    else throw Error("App.config methods requires a constructor function as it first parameter.");
    return App;
  };

  return App;
};
