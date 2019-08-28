const cwd = process.cwd();
//express and middleware
const express = require("express");
const server = express();
var app = express();
const socketServer = require("http").Server(app);
const io = require("socket.io")(socketServer);

const bodyParser = require("body-parser");
server.use(express.static(cwd + "/public"));
//server.use(bodyParser.json())
server.use(bodyParser.json({ limit: "5mb" }));

const multer = require("multer");

const tempLocation = __dirname + "/temp";

const mime = require("mime");
const crypto = require("crypto");
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, tempLocation);
  },
  filename: function(req, file, cb) {
    cb(
      null,
      randomStr(10) + Date.now() + "." + mime.getExtension(file.mimetype)
    );
  }
});

var tasks = {},
  maps = [],
  validateConn,
  _connPath,
  _host,
  _port,
  _socket_port =
    parseInt(Math.random() * parseInt(Math.random() * 10000)) + 1023;
socketServer.listen(_socket_port);

server.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT ,DELETE");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type, Authorization"
  );
  next();
});

server.get("/:app/:mod/:serverMod/:fn", getHandler);
server.put("/:app/:mod/:serverMod/:fn", requestHandler);
server.post("/:app/:mod/:serverMod/:fn", requestHandler);
server.post("/sf/:app/:mod/:serverMod/:fn", singleFileUpload);
server.post("/mf/:app/:mod/:serverMod/:fn", multiFileUpload);

var singleFileHandler = multer({ storage: storage }).single("file");
var multiFileHandler = multer({ storage: storage }).array("files");

function init(connPath, port, host, validationFn) {
  validateConn = validationFn;
  _host = host;
  _port = port;
  _connPath = connPath;

  var _server = {};
  _server.addRoute = addRoute;
  _server.maps = getMaps;
  _server.server = server;
  _server.io = io;

  server.get(connPath, sendMaps);
  server.listen(port);
  console.log("port-----------------");
  console.log(port);
  console.log(
    "--------- " + connPath + " service listening on " + _host + ":" + _port
  );

  return _server;
}

function errorResponseBuilder(err) {
  err._service = _host + ":" + _port + _connPath;
  return err;
}
function multiFileUpload(req, res) {
  var app = req.params.app,
    mod = req.params.mod,
    fn = req.params.fn,
    serverMod = req.params.serverMod;
  if (validMap(req, res)) {
    multiFileHandler(req, res, function(err) {
      if (err) {
        res.status(err.status || 500).json(errorResponseBuilder(err));
        console.log(err);
      } else {
        var data = req.body;
        data.files = req.files;
        tasks[app][mod][serverMod][fn](
          data || {},
          function(err, results) {
            if (err) {
              res.status(err.status || 500).json(errorResponseBuilder(err));
              console.log(err);
            } else {
              res.json(results);
            }
          },
          req,
          res
        );
      }
    });
  }
}

function singleFileUpload(req, res) {
  var app = req.params.app,
    mod = req.params.mod,
    fn = req.params.fn,
    serverMod = req.params.serverMod;
  if (validMap(req, res)) {
    singleFileHandler(req, res, function(err) {
      if (err) {
        res.status(err.status || 500).json(errorResponseBuilder(err));
        console.log(err);
      } else {
        var data = req.body;
        data.file = req.file;
        tasks[app][mod][serverMod][fn](
          data || {},
          function(err, results) {
            if (err) {
              res.status(err.status || 500).json(errorResponseBuilder(err));
              console.log(err);
            } else {
              res.json(results);
            }
          },
          req,
          res
        );
      }
    });
  }
}

function requestHandler(req, res) {
  if (validMap(req, res)) {
    var app = req.params.app,
      mod = req.params.mod,
      fn = req.params.fn,
      serverMod = req.params.serverMod;
    tasks[app][mod][serverMod][fn](
      req.body.data || {},
      function(err, results) {
        if (err) {
          res.status(err.status || 500).json(errorResponseBuilder(err));
          console.log(err);
        } else {
          res.json(results);
        }
      },
      req,
      res
    );
  }
}

function getHandler(req, res) {
  if (validMap(req, res)) {
    var app = req.params.app,
      mod = req.params.mod,
      fn = req.params.fn,
      serverMod = req.params.serverMod;

    try {
      tasks[app][mod][serverMod][fn](function(err, results) {
        if (err) {
          res.status(err.status || 500).json(errorResponseBuilder(err));
        } else {
          res.json(results);
        }
      });
    } catch (e) {
      res.status(500).json(e);
    }
  }
}

function sendMaps(req, res) {
  if (typeof validateConn === "function") {
    validateConn(req, res, function(err) {
      if (err) {
        res.status(err.status || 500).json(errorResponseBuilder(err));
      } else {
        res.json({ maps: maps, host: _host + ":" + _port });
      }
    });
  } else {
    res.json({ maps: maps, host: _host + ":" + _port });
  }
}

function validMap(req, res) {
  function sendMapsErr() {
    res
      .status(400)
      .json({ maps: maps, host: _host + ":" + _port, invalidMap: true });
  }

  if (tasks[req.params.app]) {
    if (tasks[req.params.app][req.params.mod]) {
      if (tasks[req.params.app][req.params.mod][req.params.serverMod]) {
        if (
          tasks[req.params.app][req.params.mod][req.params.serverMod][
            req.params.fn
          ]
        ) {
          return true;
        } else {
          sendMapsErr();
        }
      } else {
        sendMapsErr();
      }
    } else {
      sendMapsErr();
    }
  } else {
    sendMapsErr();
  }
}

function randomStr(count) {
  var text = "";
  possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  count = count || Math.floor(Math.random() * 10) || 5;

  for (var i = 0; i < count; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

//create a map that will be used to replicate the backend api on the client
function mapRoute(serverModName, serverMod, config, nsp) {
  /// randomly generate routes to the server mod
  ///use random characters to generate map with random route object
  var map = {},
    previous = randomStr(),
    next = randomStr(),
    methods;
  map.route = [];
  map.modName = serverModName;
  map.methods = Object.getOwnPropertyNames(config);
  map.config = config;
  map.nsp = "http://" + _host + ":" + _socket_port + "/" + nsp;

  var obj = tasks;
  obj[previous] = {};
  map.route.push(previous);

  for (var i = 1; i < 2; i++) {
    obj[previous][next] = {};
    obj = obj[previous];
    map.route.push(next);
    previous = next;
    next = randomStr();
  }
  obj[previous][next] = serverMod;
  map.route.push(next);
  maps.push(map);
  //console.log(map)
  return map;
}

function addRoute(serverModName, serverMod, config, nsp) {
  var _map = mapRoute(serverModName, serverMod, config, nsp);
}
function getMaps() {
  return { maps: maps, host: _host + ":" + _port };
}

module.exports = init;
