//App.js provides an interface and lifecycle for loading and creating modules
const Service = require("./Service");
const tjsModule = require("./Module");
const ServerModule = require("./ServerModule");

module.exports = (async function App() {
  const app = {};
  const sysObjs = { Services: {}, Modules: {}, ServerModules: {} }; //hash for all loaded Services and modules
  const serviceQueue = [];
  const moduleQueue = [];
  const serverModuleQueue = [];
  const last_service = "";
  const initializer_set = false;
  const configHandler = null;
  const onCompleteHandlers = [];

  //modules need to be initialized only after services have been loaded
  //so we're collect modules, services, and config functions to be run in
  //a paricular sequence. this is done in the initApp function
  const setInititializer = () => {
    //setTimeout will send the initApp function to the end of the call stack
    if (!initializer_set) {
      initializer_set = true;
      setTimeout(initApp, 0);
    }
  };

  const initApp = async () => {
    //load all services
    await loadServices(serviceQueue);

    //load all modules
    //call the configuration function first and only
    //then load modules when the config callback is called

    //use configHandler.apply to make a tjsModule the this value of the config function
    //so that the config function can use any loaded service
    if (typeof configHandler === "function")
      configHandler.apply(tjsModule(null, null, sysObjs), [loadModules()]);
    else loadModules(); //load modules immediately
  };

  const loadServices = services => {
    //Use map function to create an array of promises
    //that will handle  loading each service
    const getServices = services.map(service =>
      Promise(async function loadService(resolve, reject) {
        try {
          //pass the service's url to the Service class, that will handle loading
          //the service's data and recreating its ServerModules on the client side
          service.serverModules = await Service(service.url);
          //use apply to ensure that the onLoad handler function
          service.onLoad().apply(service, []);
          resolve(service.serverModules);
        } catch (err) {
          service.connectionErrors.push(err);
          service.connection_attemps++;
          //attempt to load the service recursively up to ten times
          if (service.connection_attemps < 10)
            setTimeout(
              () => loadService(resolve, reject),
              service.connection_attemps * 1500
            );
          else reject(err);

          console.log(
            `(${service.name} Service): Failed to connect to ${
              service.url
            } after ${service.connection_attemps} attempts.`
          );
        }
      })
    );
    return Promise.all(getServices);
  };

  const loadModules = () => {
    //first load modules
    moduleQueue.forEach(
      mod => (mod.module = tjsModule(mod.name, mod.constructor, sysObjs))
    );
    //then load each ServerModule
    serverModuleQueue.forEach(ServerModule(mod.name, mod.constructor, sysObjs));
    //call onCompleteHandlers
    initializationComplete();
  };

  const initializationComplete = () => {
    onCompleteHandlers.forEach(handler => handler());
  };
  //use ServerModule to initialize the express server that will handle routing
  app.initService = ({ host, port, route, middlewear }) => {
    host = host || "localhost";
    app.route = route;
    app.host = host;

    app.server = ServerModule.startServer({ route, port, host, middlewear });
    return app;
  };
  //register a service to be loaded later
  app.loadService = (name, { host, port, route, url }) => {
    const url = url || `http://${host}:${port}${route}`;
    //add service to sysObjs
    sysObjs.Services[name] = {
      name,
      url,
      serverModules: {},
      connection_attemps: 0,
      connectionErrors: [],
      onLoad: null
    };

    //add the service to the serviceQueue to be loaded later
    serviceQueue.push(sysObjs.Services[name]);
    //setup "app" to initialize at the end of the callstack
    setInititializer();
    //so that you can chain (.onLoad) behind a loadService method
    last_service = name;
    return app;
  };
  //set onLoad handler for the last service added to the serviceQueue
  //this is so that immediately after typeing app.loadService(data) you
  //can chain onLoad event for that particular service: app.loadService(data).onLoad(handler)
  app.onLoad = handler => {
    sysObjs.Services[last_service].onLoad = handler;
    return app;
  };

  app.module = (name, constructor) => {
    //register the module to be created later
    sysObjs.Modules[name] = {
      name,
      constructor
    };
    //use unshift to ensure modules are placed before serverModules
    moduleQueue.unshift(sysObjs.Modules[name]);
    //set initalizer
    setInititializer();
  };

  app.serverModule = (name, constructor) => {
    sysObjs.ServerModules[name] = {
      name,
      constructor
    };
    serverModuleQueue.push(sysObjs.ServerModules[name]);
    //set initializer
    setInititializer();
  };

  app.config = handler => {
    if (typeof config === "function") configHandler = handler;
  };
  //register onComplete handlers
  app.initComplete = handler => {
    if (typeof handler === "function") onComplete.push(handler);

    return app;
  };

  return app;
})();
