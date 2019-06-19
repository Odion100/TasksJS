const TasksJSModule = require("./Module");
const Server = require("./Server");
const shortid = require("shortid");
function ServerModule({ name, app, modConstructor, server }, config) {
  //serverMod is inheriting from TasksJSModule using this weird pattern. Lol
  let serverMod = new TasksJSModule.apply(this, [name, app, modConstructor]);
  //This sets up a socket.io namespace for this ServerMod
  let nameSpace = shortid();
  let nsp = server.io.of("/" + nameSpace);

  serverMod.name = name;
  serverMod.nsp = nsp;

  serverMod.emit = (name, data) => {
    nsp.emit("dispatch", {
      id: shortid(),
      name,
      data,
      sent_by: "",
      sent_at: Date()
    });
  };
}

function serverModFactory(mod) {
  var thisMod = {},
    config_all = {},
    config_options = {};

  thisMod._class = "serverMod";
  thisMod._name = mod.name;

  thisMod.config = config;
  thisMod.configAll = configAll;

  thisMod.useModule = useModule;
  thisMod.useService = useService;

  function config(name, options) {
    config_options[name] = options;
  }

  function configAll(options) {
    config_all = options;
  }

  var _nsp = randomStr();

  var nsp = _server.io.of("/" + _nsp);

  thisMod.nsp = nsp;

  thisMod.emit = function(eventName, data) {
    nsp.emit("dispatch", {
      id: randomStr(10),
      name: eventName,
      data: data,
      sent_by: appName + "." + mod.name,
      sent_at: Date()
    });
  };

  mod.modConstructor.apply(thisMod, []);
  //loop through all properties on serverMod
  obj(thisMod).forEach(function(value, pName) {
    if (
      [
        "config",
        "configAll",
        "handle",
        "emit",
        "useModule",
        "useService"
      ].indexOf(pName) === -1 &&
      typeof thisMod[pName] === "function"
    ) {
      config_options[pName] = config_options[pName] || {};

      //loop through all config options on config_all object
      obj(config_all).forEach(function(opt) {
        //apply config_all options for each serverMod method where config_options have not already been set
        config_options[pName][opt] =
          config_options[pName][opt] || config_all[opt];
      });

      //all request to serverMod are PUTs by default
      config_options[pName].request_method =
        config_options[pName].request_method || "PUT";
    }
  });

  _server.addRoute(mod.name, thisMod, config_options, _nsp);
}
