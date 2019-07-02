const TasksJSModule = require("./Module");
const Server = require("./Server");
const shortid = require("shortid");

module.exports = function ServerModule({ name, app, modConstructor, server }) {
  //serverMod is inheriting from TasksJSModule using this weird pattern
  const serverMod = new TasksJSModule.apply(this, [name, app, modConstructor]);
  //This sets up a socket.io namespace for this ServerMod
  const nameSpace = shortid();
  const nsp = server.io.of(`/${nameSpace}`);

  serverMod.name = name;
  serverMod.nsp = nsp;
  //here we're using the socket.io namespace to fire an event called dispatch
  serverMod.emit = (name, data) => {
    nsp.emit("dispatch", {
      id: shortid(),
      name,
      data,
      sent_by: "",
      sent_at: Date()
    });
  };

  const methodConfig = {};
  //manually set the request method for REST purposes
  serverMod.setMethod = (fnName, method) => {
    methodConfig[fnName] = method;
  };

  serverMod.inferRoute = root => {
    //create static route using
    if (!root)
      throw Error(
        "(TasksJS): ServerModule.inferRoute(root) requires a root route as the first parameter"
      );
    serverMod.root = root;
    serverMod.inferRoute = true;
  };
  //using modConstructor.apply let's us determine that the this object will be the serverMod
  modConstructor.apply(serverMod, []);

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
  //pass info need by the Server class to manage routing to the ServerModule
  Server.addModule(name, serverMod, {
    methods,
    nsp: nameSpace,
    inferRoute: serverMod.inferRoute,
    root: serverMod.root
  });
};
