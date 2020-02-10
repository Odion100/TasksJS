const loadConnectionData = require("./components/loadConnectionData");
const SocketDispatcher = require("./components/SocketDispatcher");
module.exports = async function createService(url) {
  const connData = await loadConnectionData(url);
  const Service = SocketDispatcher.apply(this, [connData.namespace]);

  const resetConnection = async cb => {
    const { modules, host, port } = await loadConnectionData(url);
    modules.forEach(({ namespace, route, name }) =>
      Service[name].__setConnection(host, port, route, namespace)
    );
    cb();
  };

  connData.modules.forEach(
    mod => (Service[mod.name] = ServiceModule(mod, connData, resetConnection))
  );

  Service.on("disconnect", resetConnection);
  return Service;
};
