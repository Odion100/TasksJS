const TasksJSModule = require("./Module");
const shortid = require("shortid");
const ServerManager = require("./ServerManager");

module.exports = function TasksJSServerModule(
  name,
  constructor,
  systemObjects
) {
  //ServerModule is inheriting from TasksJSModule
  const ServerModule = new TasksJSModule(name, null, systemObjects);
  //This creates a socket.io namespace for this ServerModule
  const namespace = shortid();
  const nsp = ServerManager.io.of(`/${namespace}`);

  //here we're using the socket.io namespace to fire an event called dispatch
  ServerModule.emit = (name, data) => {
    nsp.emit("dispatch", {
      id: shortid(),
      name,
      data,
      sent_by: "",
      sent_at: Date()
    });
  };

  ServerModule.inferRoute = () => (ServerModule.inferRoute = true);

  //using constructor.apply let's us determine that the this object will be the ServerModule
  constructor.apply(ServerModule, []);

  const methods = [];
  const props = Object.getOwnPropertyNames(ServerModule);
  const reservedMethods = [
    "emit",
    "useModule",
    "useService",
    "setMethod",
    "setMethods",
    "inferRoute"
  ];
  //loop through each property on the ServerModule that is a function
  //in order to create a config object for each method on the ServerModule
  props.forEach(name => {
    if (
      //exclude ServerModule reserved methods
      reservedMethods.indexOf(name) === -1 &&
      typeof ServerModule[name] === "function"
    ) {
      let method = methodConfig[name] || "PUT";
      methods.push({ method, name });
    }
  });

  ServerManager.addModule({
    name,
    ServerModule,
    namespace,
    inferRoute,
    methods
  });
  return ServerModule;
};

TasksJSServerModule.startServer = ServerManager.startServer;
