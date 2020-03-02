module.exports = async function initApp(system) {
  try {
    await loadServices(system);
  } catch (err) {
    throw `(TasksJSAppError): Initialization Error - failed to load all services`;
  }

  const { configurations } = system;

  if (typeof configurations.__constructor === "function") {
    configurations.module = {};
    configurations.__constructor.apply(configurations.module, [() => loadModules(system)]);
  } else loadModules(system);
};
