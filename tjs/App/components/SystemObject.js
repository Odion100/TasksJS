module.exports = function SystemObjects(systemObjects) {
  const obj = this || {};
  obj.useModule = modName =>
    (systemObjects.Modules.find(mod => mod.name === modName) || {}).module || {};
  obj.useService = serviceName =>
    (systemObjects.Service.find(mod => mod.name === serviceName) || {}).client || {};
  obj.useConfig = ()
   => systemObjects.configurations.module || {};
  return App;
};
