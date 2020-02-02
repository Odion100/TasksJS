//Objects that can be accessed only within system enclosure
module.exports = function inheritSystemObjects(systemObjects) {
  const obj = this;
  //inherit ability to share TaskjsSystemObjects
  obj.useModule = modName => (systemObjects.Modules[modName] || {}).module || {};

  obj.useService = serviceName => (systemObjects.Services[serviceName] || {}).ServerModules || {};

  obj.useConfig = () => systemObjects.config.module || {};

  return obj;
};
