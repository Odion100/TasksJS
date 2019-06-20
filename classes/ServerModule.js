const TasksJSModule = require("./Module");
const Server = require("./Server");
const shortid = require("shortid");
exports = ServerModule;

function ServerModule({ name, app, modConstructor, server }, cfCallback) {
  //serverMod is inheriting from TasksJSModule using this weird pattern. Lol
  let serverMod = new TasksJSModule.apply(this, [name, app, modConstructor]);
  //This sets up a socket.io namespace for this ServerMod
  let nameSpace = shortid();
  let nsp = server.io.of(`/${nameSpace}`);

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
  //using modConstructor.apply let's us determine that the this object will be this serveModule
  modConstructor.apply(serverMod, []);
  //configuration options determine how routing is handled
  let options = configurationHandler(serverMod, app, cfCallback);
  Server.addRoute(name, serverMod, options, nameSpace);
}

//configurationHandler creates an object that has methods that are used
//to set configuration options. This object is passed to the configuration
//callback which is the second parameter of the app.serverMod method
function configurationHandler(serverMod, app, cfCallback) {
  const handler = {};
  const configOptions = {};
  const props = Object.getOwnPropertyNames(serverMod);
  const reservedProps = ["emit", "useModule", "useService"];
  //loop through each property on the serverMod that is a function
  //in order to create a handler that can set configOptions for each method
  props.forEach(prop => {
    if (
      //exclude serverMod original methods
      reservedProps.indexOf(pName) === -1 &&
      typeof thisMod[pName] === "function"
    ) {
      handler[prop] = configurator(prop);

      configOptions[prop] = {
        method: "PUT",
        route: null
      };
    }
  });
  //using persistance here so that the configurator will know
  //what the property it's supposed to set
  const configurator = fnName => {
    const setter = {
      setRoute: value => setOption("route", value),
      setMethod: value => setOption("request_method", value),
      inferRoute: () =>
        setOption("route", `${app.route}/${serverMod.name}/${fnName}`)
    };
    const setOption = (optionName, value) => {
      configOptions[fnName][optionName] = value;
      //setter returned here to allow chaining
      return setter;
    };
    return setter;
  };

  //the following functions are for configuring all the methods of
  //the serverMod at once
  handler.setNamespace = value => {
    configOptions.nsp = value;
    return handler;
  };
  handler.setRoutes = value => {
    props.forEach(prop => handler[prop].setRoute(`${value}/${prop}`));
    return handler;
  };
  handler.inferRoutes = () => {
    props.forEach(prop => handler[prop].inferRoute());
    return handler;
  };

  handler.setMethods = value => {
    props.forEach(prop => handler[prop].setMethod(value));
    return handler;
  };

  //inside the cfCallback serverMod configuration should look like this:
  //example: handler.propertyName.setMeothod('GET').inferRoute()
  if (typeof cfCallback === "function") cfCallback(handler);
  return configOptions;
}
