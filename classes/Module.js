//What do they even call this pattern...?
module.exports = function TasksJSModule({ name, app, modConstructor }) {
  const TasksJSModule = this;
  const events = {};

  TasksJSModule.name = name;

  TasksJSModule.useModule = modName => {
    app.modules[modName].module;
  };

  TasksJSModule.useService = serviceName => {
    app.service[serviceName].service;
  };

  TasksJSModule.emit = (eventName, data) => {
    if (events[eventName])
      events[eventName].forEach(handler => handler({ ...data }));
  };

  TasksJSModule.on = (eventName, eventHandler) => {
    //if the event doesn't aready exist
    if (!events[eventName]) {
      events[eventName] = [];
    }

    events[eventName].push(eventHandler);
  };

  modConstructor.apply(TasksJSModule, []);
  return TasksJSModule;
};
