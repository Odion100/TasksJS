"use strict";
const ServiceRequestHandler = require("./ServiceRequestHandler");
const SocketDispatcher = require("./SocketDispatcher");
module.exports = function TasksJSServiceModule(
  { methods, namespace, route },
  { port, host },
  resetConnection
) {
  const events = {};
  const ServiceModule = this || {};
  ServiceModule.__setConnection = (host, port, route, namespace) => {
    ServiceModule.__connectionData = () => ({ route, host, port });
    SocketDispatcher.apply(ServiceModule, [namespace, events]);
  };
  ServiceModule.__setConnection(host, port, route, namespace);

  methods.forEach(({ method, fn }) => {
    ServiceModule[fn] = ServiceRequestHandler.apply(ServiceModule, [method, fn, resetConnection]);
  });

  return ServiceModule;
};
