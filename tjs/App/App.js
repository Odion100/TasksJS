const ServiceFactory = require("../Service/Service");
const SystemObject = require("./components/SystemObject");
module.exports = function TasksJSApp() {
  const App = Dispatcher();
  const system = {
    Services: [],
    Modules: [],
    ServerModules: [],
    configurations: {},
    Service: ServiceFactory({ defaultModule: SystemObject(system) }),
    App
  };

  setTimeout(() => initializeApp(system), 0);

  App.startService = ({ host, port, route, middlewear }) => {
    system.Service.startService({
      route,
      port,
      host,
      middlewear
    });
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
      client: {}
    });
    return App;
  };

  App.onLoad = handler => {
    const service = system.Services[system.Services.length - 1];
    service.onLoad = handler;
    return App;
  };

  App.module = (name, __constructor) => {
    system.Modules.push({
      name,
      __constructor,
      module: SystemObject(system)
    });
    return App;
  };

  App.ServerModule = (name, __constructor) => {
    system.ServerModules.push({
      name,
      __constructor
    });
    return App;
  };

  App.config = __constructor => {
    if (typeof __constructor === "function") system.configurations.push({ __constructor });
    return App;
  };

  return App;
};
