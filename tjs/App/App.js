"use strict";
const ServiceFactory = require("../Service/Service");
const SystemObject = require("./components/SystemObject");
const Dispatcher = require("../Dispatcher/Dispatcher");
const initializeApp = require("./components/initializeApp");
const URL = require("url");
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
    routing: null,
  };
  SystemObject.apply(system);
  Service.defaultModule = SystemObject(system);
  setTimeout(() => initializeApp(system), 0);

  App.startService = (options) => {
    system.routing = options;
    return App;
  };

  App.loadService = (name, options) => {
    const url =
      typeof options === "string"
        ? URL.parse(options)
        : URL.format({
            protocol: "http",
            hostname: options.host || "localhost",
            port: options.port,
            pathname: options.route[0] === "/" ? options.route : "/" + options.route,
          });

    system.Services.push({
      name,
      url,
      onLoad: null,
      limit: options.limit,
      wait: options.wait,
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
