module.exports = function TasksJSWebWebSocket() {
  const express = require("express");
  const SocketServer = require("http").Server(express());
  const Socket = require("socket.io")(SocketServer);

  return { Socket, SocketServer };
};
