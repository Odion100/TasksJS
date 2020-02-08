const loadConnectionData = require("./loadConnectionData");
module.exports = function createService(connData) {
  const Service = TasksJSEvents.apply(this);
  Service.TasksJSService = connData.TasksJSService;
  //each mod describes a backend mod
  connData.modules.forEach(mod => (Service[mod.name] = ServiceModule(mod, connData)));

  Service.resetConnection = async callback => {
    const { modules, host, port } = await loadConnectionData(connData.serviceUrl);
    modules.forEach(mod => Service[mod.name].__setConnection(host, port, mod.route, mod.namespace));
  };

  return Service;
};
