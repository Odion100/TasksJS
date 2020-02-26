const Service = ServiceFactory();
let isInitialized = false;

module.exports = function startApp() {};
//modules need to be initialized only after services have been loaded
//so we collect modules, services, and config functions to be run in
//a paricular sequence at the end of the call stack. this is done in the initApp function
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
  if (typeof config.__constructor === "function") {
    //give config constructor access to the systemObject so any loaded services can be accessed
    config.module = TasksJSModule(null, null, { systemObjects });
    //pass loadModules as a parameter of the config constructor function
    //so that its given control of the next step in the initialization lifecycle
    config.__constructor.apply(config.module, [loadModules]);
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
            service.ServerModules = await Service(url, { limit, wait });
            //use apply to ensure that the onLoad handler function
            if (typeof onLoad === "function") {
              onLoad(service.ServerModules);
              service.ServerModules.on("reconnect", onLoad);
            }
            //emit sevice_loaded event after loading each Service
            app
              .emit("service_loaded", service.ServerModules)
              .emit(`service_loaded:${name}`, service.ServerModules);
            resolve();
          } catch (err) {
            console.warn(
              `(TasksJSAppWarning)(${name} Service): Failed to connect to ${url} after ${err.connection_attempts ||
                0} attempts`,
              err.connection_attempts ? "" : err
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
      (mod.module = TasksJSModule(mod.name, mod.constructor, {
        systemObjects
      }))
  );
  //then load each ServerModule
  console.log("serverModuleQueue---------------w--w-w-w-w-w-w-w-w-w--w-w-w-w->", serverModuleQueue);
  serverModuleQueue.forEach(mod => ServerModule(mod.name, mod.constructor, { systemObjects }));
  app.emit("init_complete", { systemObjects });
};
