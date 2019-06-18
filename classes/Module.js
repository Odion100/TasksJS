//What do they even call this pattern...?
function TasksJSModule({ name, app, modConstructor }) {
  const tjsModule = {};
  const events = {};

  tjsModule.name = name;
  this.useModule = modName => {
    app.modules[modName].module;
  };

  this.useService = serviceName => {
    app.service[serviceName].service;
  };

  this.emit = (eventName, data) => {
    if (events[eventName])
      events[eventName].forEach(handler => handler({ ...data }));
  };

  this.on = (eventName, eventHandler) => {
    //if the event doesn't aready exist
    if (!events[eventName]) {
      events[eventName] = [];
    }

    events[eventName].push(eventHandler);
  };

  modConstructor.apply(tjsModule, []);
  return tjsModule;
}
