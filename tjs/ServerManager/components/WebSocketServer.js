module.exports = function TasksJSWebWebSocket(port) {
  const express = require("express");
  const SocketServer = require("http").Server(express());
  const Socket = require("socket.io")(SocketServer);
  SocketServer.listen(port);
  return { Socket, SocketServer };
};
