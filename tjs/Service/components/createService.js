const loadConnectionData = require("./loadConnectionData");
const SocketDispatcher = require("./SocketDispatcher");
module.exports = function createService(url) {
  const connData = await loadConnectionData(url)
  const Service = SocketDispatcher.apply(this, [connData.namespace]);
  Service.TasksJSService = connData.TasksJSService;

  connData.modules.forEach(mod => (Service[mod.name] = ServiceModule(mod, connData)));

  Service.resetConnection = async cb => {
    const { modules, host, port } = await loadConnectionData(url);
    modules.forEach(mod => Service[mod.name].__setConnection(host, port, mod.route, mod.namespace));
    cb();
  };

  Service.on("disconnect", Service.resetConnection);
  return Service;
};
