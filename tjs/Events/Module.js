//Modules provides closures and the ability to have (lifecycle) events and shared system object across closures
const { Events, SystemObjects } = require("./Events");
module.exports = function TasksJSModule(name, moduleConsturctor, { systemObjects } = {}) {
  const TJSModule =
    typeof moduleConsturctor === "object" && moduleConsturctor instanceof Object
      ? moduleConsturctor
      : {};

  Events.apply(TJSModule);

  if (
    typeof moduleConsturctor === "function" &&
    moduleConsturctor.constructor.name != "AsyncFunction"
  )
    constructor.apply(TJSModule, []);
  else
    throw "TasksJSModule Error: TasksJSModule(name, constructor) requires an non-aync function as the constructor";

  return TJSModule;
};
