module.exports = function TasksJSWebWebSocket(port) {
  const express = require("express");
  const WebSocketServer = require("http").Server(express());
  const WebSocket = require("socket.io")(WebSocketServer);
  WebSocketServer.listen(port);
  return WebSocket;
};
