const loadModules = require("./loadModules");
const loadServices = require("./loadServices");

module.exports = async function initApp(system) {
  try {
    await loadServices(system);
  } catch (err) {
    throw `(TasksJSAppError): Initialization Error - failed to load all services`;
  }

  const { configurations } = system;

  if (typeof configurations.__constructor === "function")
    configurations.__constructor.apply(configurations.module, [() => loadModules(system)]);
  else loadModules(system);
};
