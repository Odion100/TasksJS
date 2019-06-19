//What do they even call this pattern...?
module.exports = function TasksJSModule({ name, app, modConstructor }) {
  const tjsModule = this;
  const events = {};

  tjsModule.name = name;
  tjsModule.useModule = modName => {
    app.modules[modName].module;
  };

  tjsModule.useService = serviceName => {
    app.service[serviceName].service;
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

  modConstructor.apply(tjsModule, []);
  return tjsModule;
};
