"use strict";
const io = require("socket.io-client");
const TasksJSDispatcher = require("../../Dispatcher/Dispatcher");

module.exports = function SocketDispatcher(namespace, events = {}) {
  const dispatcher =
    (this || {}).on && (this || {}).emit ? this : TasksJSDispatcher.apply(this, [events]);
  const socket = io.connect(namespace);
  socket.on("dispatch", ({ name, data }) => dispatcher.emit(name, data));
  socket.on("disconnect", () => dispatcher.emit("disconnect"));
  socket.on("connect", () => dispatcher.emit("connect"));

  dispatcher.disconnect = () => socket.disconnect();
  return dispatcher;
};
