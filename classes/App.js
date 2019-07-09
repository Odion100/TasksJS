const Service = require("./Service");
const ServerManager = require("./Server");

module.exports = async function App() {
  const app = {};
  const onComplete = [];
  const status = "loading services";
  const systemObjects = { services: {}, modules: {}, serverMods: {} }; //hash for all loaded Services and modules
  const serviceQueue = [];
  const moduleQueue = [];
  const initializer_set = false;
  app.server = null; //remember to implement app.server

  //use ServerManager to initialize the express server that will handle routing
  app.initService = ({ host, port, route, middlewear }) => {
    app.route = route;
    app.host = host || "localhost";
    ServerManager.init(route, port, app.host, middlewear);

    return app;
  };
  //register onComplete handlers
  app.initComplete = handler => {
    if (typeof handler === "function") onComplete.push(handler);

    return app;
  };
  //register a service to be loaded later or load a service and return a service immediately
  app.loadService = (name, { host, port, route, url }) => {
    const url = url || `http://${host}:${port}${route}`;

    systemObjects.services[name] = {
      name,
      url,
      modules: {},
      connection_attemps: 0
    };

    if (status === "laoding services") {
      //when loading services outside the module return app so you can chain methods
      //and add the service to the serviceQueue to be loaded later
      serviceQueue.push(systemObjects.services[name]);
      setInititializer();
      return app;
    } else if (status === "loading modules") {
      //laod and return the service directly which will return a promise so async await can be used
      //also which won't register the service so it cannot be access by the Module.useService method
      return new Service(name, url);
    }
  };

  app.config = () => {};

  app.onLoad = () => {};

  app.module = () => {};

  app.serverMod = () => {};

  app._maps = () => {};

  //modules need to be initialized only after services have been loaded
  //so we're collect modules, services, and config init functions to be run in
  //a paricular sequence. this is handled by multiTaskHandler in inti function below
  const setInititializer = () => {
    //setTimeout will send the initApp function to the end of the call stack
    if (!initializer_set) {
      initializer_set = true;
      setTimeout(initApp, 1);
    }
  };

  const initApp = () => {};
};

function loadService(name, option) {
  var uri = "http://" + option.host + ":" + option.port + option.route;

  services[name] = {
    dependents: [],
    name: name,
    uri: uri,
    connection_attemps: 0,
    service: {}
  };

  initAsync.unshift(new getService(uri, name).run);
  setInit();

  _serv = name;
  return tasks;
}
