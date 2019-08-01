//Modules is used by App.js to provide closures and to
//controll the lifecycle of code initialization

//What do they even call this pattern...?
module.exports = function TasksJSModule(name, constructor, App) {
  const tjsModule = {};
  const events = {};

  tjsModule.name = name;

  tjsModule.useModule = modName => {
    if (App) App.modules[modName].module;
  };

  tjsModule.useService = serviceName => {
    if (App) App.service[serviceName].modules;
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
  //this is where all modules are initialized
  if (constructor) constructor.apply(tjsModule, []);
  return tjsModule;
};
