const TasksJSDispatcher = require("../../Dispatcher/Dispatcher");
const ServiceRequestHandler = require("./ServiceRequestHandler");
const SocketDispatcher = require("./SocketDispatcher");
module.exports = function TasksJSServiceModule({ methods, namespace, route }, { port, host }) {
  const events = {};

  const ServiceModule = TasksJSDispatcher.apply(this, [events]);

  ServiceModule.__setConnection = (host, port, route, namespace) => {
    ServiceModule.__connectionData = () => ({ route, host, port });
    SocketDispatcher.apply(ServiceModule, [namespace, events]);
  };
  ServiceModule.__setConnection(host, port, route, namespace);

  methods.forEach(({ method, fn }) => {
    ServiceModule[fn] = ServiceRequestHandler.apply(ServiceModule, [method, fn]);
  });

  return ServiceModule;
};
