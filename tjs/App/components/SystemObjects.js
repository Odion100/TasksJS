module.exports = function SystemObjects(systemObjects) {
  const App = this;

  App.useModule = modName => (systemObjects.Modules[modName] || {}).module || {};

  App.useService = serviceName => (systemObjects.Services[serviceName] || {}).ServerModules || {};

  App.useConfig = () => systemObjects.config.module || {};

  return App;
};
