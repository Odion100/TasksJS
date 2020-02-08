module.exports = function SocketEmitter(namespace, WebSocket) {
  const Emitter = this.on && this.emit ? this : TasksJSDispatcher.apply(this);

  Emitter.socket = WebSocket.of(`/${namespace}`);

  const emit = Emitter.emit;

  Emitter.emit = (name, data) => {
    const id = shortid();
    const type = "WebSocket";
    Emitter.socket.emit("dispatch", { id, name, data, type });
    //emit the same event locally
    emit(name, data);
  };
  return Emitter;
};
