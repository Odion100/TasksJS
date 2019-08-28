//Modules is used by App.js to provide closures and to
//controll the lifecycle of code initialization

//What do they even call this pattern...?
module.exports = function TasksJSModule(name, constructor, systemObjects) {
  const tjsModule = {};
  const events = {};

  tjsModule.name = name;
  //return other modules in the same App by name
  tjsModule.useModule = modName => {
    if (systemObjects) return (systemObjects.Modules[modName] || {}).module;
  };
  //returns any service that has been loaded by name
  tjsModule.useService = serviceName => {
    if (systemObjects)
      return (systemObjects.Services[serviceName] || {}).ServerModules;
  };
  //return config module
  tjsModule.useConfig = () => {
    if (systemObjects) return systemObjects.config.module;
  };
  //emit events to other modules
  tjsModule.emit = (eventName, data) => {
    if (events[eventName])
      events[eventName].forEach(handler => handler({ data }));
  };
  //register event handler by event name
  tjsModule.on = (eventName, eventHandler) => {
    //if the event doesn't aready exist
    if (!events[eventName]) {
      events[eventName] = [];
    }

    events[eventName].push(eventHandler);
  };
  //allow for creating a modules without constructors as a way of doing inheritance
  if (typeof constructor === "function") constructor.apply(tjsModule, []);
  return tjsModule;
};
