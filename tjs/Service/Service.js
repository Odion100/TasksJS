const loadConnectionData = require("./components/loadConnectionData");
const createService = require("./components/createService");

module.exports = function TasksJSService() {
  const loadedServices = {};
  return async function ServiceFactory(url, options = {}) {
    if (loadedServices[url] && !options.forceReload) return loadedServices[url];

    const connData = await loadConnectionData(url, options);
    console.log("connData", connData);
    const resetConnection = async cb => {
      const { modules, host, port } = await loadConnectionData(url, options);
      modules.forEach(({ namespace, route, name }) =>
        Service[name].__setConnection(host, port, route, namespace)
      );
      cb();
    };

    const Service = createService(connData, resetConnection);
    Service.on("disconnect", resetConnection);
    loadedServices[url] = Service;
    return Service;
  };
};
