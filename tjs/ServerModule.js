const TasksJSModule = require("./Module");
const shortid = require("shortid");
const ServerManager = require("./ServerManager");

module.exports = function ServerModule(name, constructor, systemObjects) {
  //serverMod is inheriting from TasksJSModule
  const serverMod = new TasksJSModule(name, null, systemObjects);
  //This creates a socket.io namespace for this ServerMod
  const nsp = shortid();
  const namespace = ServerManager.io.of(`/${nsp}`);
  serverMod.name = name;
  serverMod.namespace = nsp;

  //here we're using the socket.io namespace to fire an event called dispatch
  serverMod.emit = (name, data) => {
    namespace.emit("dispatch", {
      id: shortid(),
      name,
      data,
      sent_by: "",
      sent_at: Date()
    });
  };

  serverMod.inferRoute = () => (serverMod.inferRoute = true);

  //using constructor.apply let's us determine that the this object will be the serverMod
  constructor.apply(serverMod, []);

  const methods = [];
  const props = Object.getOwnPropertyNames(serverMod);
  const reservedMethods = [
    "emit",
    "useModule",
    "useService",
    "setMethod",
    "setMethods",
    "inferRoute"
  ];
  //loop through each property on the serverMod that is a function
  //in order to create a config object for each method on the serverMod
  props.forEach(name => {
    if (
      //exclude serverMod reserved methods
      reservedMethods.indexOf(name) === -1 &&
      typeof serverMod[name] === "function"
    ) {
      let method = methodConfig[name] || "PUT";
      methods.push({ method, name });
    }
  });

  ServerManager.addModule(name, serverMod);
  return serverMod;
};

ServerModule.startServer = ({ port, host, route, middleware }) => {
  ServerManager.init(route, port, host, middleware);
  return ServerManager.server;
};
