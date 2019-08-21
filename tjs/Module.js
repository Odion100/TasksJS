//Modules is used by App.js to provide closures and to
//controll the lifecycle of code initialization

//What do they even call this pattern...?
module.exports = function TasksJSModule(name, constructor, App) {
  const tjsModule = {};
  const events = {};

  tjsModule.name = name;

  tjsModule.useModule = modName => {
    if (App) App.Modules[modName].module;
  };

  tjsModule.useService = serviceName => {
    if (App) App.Services[serviceName].serverModules;
  };

  tjsModule.emit = (eventName, data) => {
    if (events[eventName])
      events[eventName].forEach(handler => handler({ ...data }));
  };

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
