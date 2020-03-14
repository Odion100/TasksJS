"use strict";
const loadConnectionData = require("./components/loadConnectionData");
const SocketDispatcher = require("./components/SocketDispatcher");
const ServiceModule = require("./components/ServiceModule");

module.exports = function TasksJSClient() {
  const Client = {};
  const loadedServices = {};

  Client.loadService = async (url, options = {}) => {
    if (loadedServices[url] && !options.forceReload) return loadedServices[url];

    const connData = await loadConnectionData(url, options);
    const Service = SocketDispatcher(connData.namespace);

    Service.resetConnection = async cb => {
      Service.disconnect();
      const { modules, host, port, namespace } = await loadConnectionData(url, options);

      SocketDispatcher.apply(Service, [namespace]);

      modules.forEach(({ namespace, route, name }) =>
        Service[name].__setConnection(host, port, route, namespace)
      );

      if (typeof cb === "function") cb();
    };

    connData.modules.forEach(
      mod => (Service[mod.name] = ServiceModule(mod, connData, Service.resetConnection))
    );

    Service.on("disconnect", Service.resetConnection);
    loadedServices[url] = Service;
    if (options.name) Client[options.name] = Service;
    return Service;
  };

  return Client;
};
