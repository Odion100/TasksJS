const Dispatcher = require("../../Dispatcher/Dispatcher");

module.exports = function loadModules(system) {
  system.Modules.forEach(mod => {
    Dispatcher.apply(mod.module);
    mod.__constructor.apply(mod.module);
  });

  system.ServerModules.forEach(({ name, __constructor }) =>
    system.Service.ServerModule(name, __constructor)
  );
  system.App.emit("init_complete", { system });
};
