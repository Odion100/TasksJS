module.exports = function inheritEvents(events = {}) {
  const obj = this;

  obj.emit = (eventName, data) => {
    if (events[eventName]) events[eventName].forEach(handler => handler(data));
    return obj;
  };

  obj.on = (eventName, handler) => {
    if (typeof handler !== "function")
      throw Error(
        "TasksJSModule Events Error: object.on(eventName, callback) requires a function as the second parameter"
      );

    if (!events[eventName]) events[eventName] = [];
    events[eventName].push(handler);

    return obj;
  };

  return obj;
};
