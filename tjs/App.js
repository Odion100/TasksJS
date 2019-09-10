//App.js provides an interface and lifecycle for loading and creating modules
const TasksJSService = require("./Service");
const TasksJSModule = require("./Module");
const TasksJSServerModule = require("./ServerModule");

module.exports = function TasksJSApp() {
  const app = new TasksJSModule();
  const ServerModule = TasksJSServerModule();
  const Service = TasksJSService();
  const systemObjects = {
    Services: {},
    Modules: {},
    ServerModules: {},
    config: {}
  }; //hash for all loaded Services and modules
  const serviceQueue = [];
  const moduleQueue = [];
  const serverModuleQueue = [];
  let last_service = "";
  let isInitialized = false;

  //modules need to be initialized only after services have been loaded
  //so we're collect modules, services, and config functions to be run in
  //a paricular sequence. this is done in the initApp function
  const setInititializer = () => {
    //setTimeout will send the initApp function to the end of the call stack
    if (!isInitialized) {
      isInitialized = true;
      setTimeout(initApp, 0);
    }
  };

  const initApp = async () => {
    //load all services
    try {
      await loadServices(serviceQueue);
    } catch (err) {
      throw `(TasksJSAppError): Initialization Error - failed to load all services`;
    }

    const { config } = systemObjects;
    if (typeof config.constructor === "function") {
      //give config constructor access to the systemObject so any loaded services can be accessed
      config.module = TasksJSModule(null, null, systemObjects);
      //pass loadModules as a parameter of the config constructor function
      //so that its given control of the next step in the initialization lifecycle
      config.constructor.apply(config.module, [loadModules]);
    } else loadModules(); //load modules immediately
  };

  const loadServices = services => {
    //Use map function to create an array of promises
    //that will handle  loading each service
    return Promise.all(
      services.map(
        service =>
          new Promise(async resolve => {
            const { url, limit, wait, name, onLoad } = service;

            try {
              //pass the service's url to the Service class, that will handle loading
              //the service's data and recreating its ServerModules on the client side
              service.ServerModules = await Service(url, false, limit, wait);
              //use apply to ensure that the onLoad handler function
              if (typeof onLoad === "function") onLoad(service.ServerModules);
              //emit sevice_loaded event after loading each Service
              app
                .emit("service_loaded", service.ServerModule)
                .emit(`service_loaded:${name}`, service.ServerModule);
              resolve();
            } catch (err) {
              console.warn(
                `(TasksJSAppWarning)(${name} Service): Failed to connect to ${url} after ${err.connection_attempts} attempts.`
              );
              app.emit("failed_connection", err);
              resolve();
            }
          })
      )
    );
  };

  const loadModules = () => {
    //first load modules
    moduleQueue.forEach(
      mod =>
        (mod.module = TasksJSModule(mod.name, mod.constructor, systemObjects))
    );
    //then load each ServerModule
    serverModuleQueue.forEach(mod =>
      ServerModule(mod.name, mod.constructor, systemObjects)
    );
    app.emit("init_complete", systemObjects);
  };

  //use ServerModule to initialize the express server that will handle routing
  app.initService = ({ host, port, route, middlewear }) => {
    //Start ServerManager via the ServerModule
    host = host || "localhost";
    const { server } = ServerModule.startServer({
      route,
      port,
      host,
      middlewear
    });
    app.server = server;
    return app;
  };
  //register a service to be loaded later
  app.loadService = (
    name,
    { host = "localhost", port, route, url, limit, wait }
  ) => {
    url = url || `http://${host}:${port}/${route}`;
    //add service to systemObjects
    systemObjects.Services[name] = {
      name,
      url,
      ServerModules: {},
      onLoad: null,
      limit,
      wait
    };

    //add the service to the serviceQueue to be loaded later
    serviceQueue.push(systemObjects.Services[name]);
    //setup "app" to initialize at the end of the callstack
    setInititializer();
    //so that you can chain (.onLoad) behind a loadService method
    last_service = name;
    return app;
  };
  //set onLoad handler for the last service added to the serviceQueue
  //this is so that immediately after typing app.loadService(data) you
  //can chain onLoad event for that particular service: app.loadService(data).onLoad(handler)
  app.onLoad = handler => {
    systemObjects.Services[last_service].onLoad = handler;
    return app;
  };

  app.module = (name, constructor) => {
    //register the module to be created later
    systemObjects.Modules[name] = {
      name,
      constructor
    };
    //add module to the queue to be loaded constructed later
    moduleQueue.push(systemObjects.Modules[name]);
    //set initalizer
    setInititializer();
    return app;
  };

  app.ServerModule = (name, constructor) => {
    systemObjects.ServerModules[name] = {
      name,
      constructor
    };
    serverModuleQueue.push(systemObjects.ServerModules[name]);
    //set initializer
    setInititializer();
    return app;
  };

  app.config = constructor => {
    if (typeof constructor === "function")
      systemObjects.config.constructor = constructor;

    return app;
  };

  //aliases
  app.serverModule = app.ServerModule;
  app.serverMod = app.ServerModule;
  app.Module = app.module;
  return app;
};
