//Modules is used by App.js to provide closures and to
//controll the lifecycle of code initialization

//What do they even call this pattern...?
module.exports = function TasksJSModule(
  name,
  constructor,
  { systemObjects } = {}
) {
  const tjsModule =
    typeof constructor === "object" && constructor instanceof Object
      ? constructor
      : {};
  const events = {};

  if (systemObjects) {
    //return other modules in the same App by name
    tjsModule.useModule = modName =>
      (systemObjects.Modules[modName] || {}).module || {};
    //returns any service that has been loaded by name
    tjsModule.useService = serviceName =>
      (systemObjects.Services[serviceName] || {}).ServerModules || {};
    //return config module
    tjsModule.useConfig = () => systemObjects.config.module || {};
  }

  //emit events to other modules
  tjsModule.emit = (eventName, data) => {
    if (events[eventName]) events[eventName].forEach(handler => handler(data));
    return tjsModule;
  };
  //register event handler by event name
  tjsModule.on = (eventName, handler) => {
    //if the event doesn't aready exist
    if (!events[eventName]) {
      events[eventName] = [];
    }
    if (typeof handler === "function") events[eventName].push(handler);
    else
      throw Error(`TasksJSModuleError:
      name:${name}
      message:module.on(eventName, handler) Requires a function as 
      it's second parameter.
    `);
    return tjsModule;
  };
  //allow for creating a modules without constructors returning a basice module object
  if (typeof constructor === "function") {
    if (constructor.constructor.name === "AsyncFunction")
      throw `TasksJSModuleError:
      name:${name}
      message:The Module(name, constructor) cannot take an async function as a constructor
      `;

    constructor.apply(tjsModule, []);
  }

  return tjsModule;
};
