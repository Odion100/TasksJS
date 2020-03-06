const loadModules = require("./loadModules");
const loadServices = require("./loadServices");
const continuationERROR = () => {
  throw Error(
    `continuationERROR: Failed to call continuation function in App Configuariotn module
    
      Fix: Must call next function during App.config( constructor(=>next) )          
     `
  );
};

module.exports = async function initApp(system) {
  try {
    await loadServices(system);
  } catch (err) {
    throw `(TasksJSAppError): Initialization Error - failed to load all services`;
  }

  const { configurations } = system;

  if (typeof configurations.__constructor === "function") {
    setTimeout(continuationERROR, 0);
    configurations.__constructor.apply(configurations.module, [
      () => {
        clearTimeout(continuationERROR);
        loadModules(system);
      }
    ]);
  } else loadModules(system);
};
