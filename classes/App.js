const Service = require("./Service");
const ServerManager = require("./Server");

module.exports = async function App() {
  const app = {};
  const onComplete = [];
  app.server = null; //remember to implement app.server

  //use ServerManager to initialize the express server that will handle routing
  app.initService = ({ host, port, route, middlewear }) => {
    app.route = route;
    app.host = host || "localhost";
    ServerManager.init(route, port, app.host, middlewear);

    return app;
  };
  //register onComplete handlers
  app.initComplete = handler => {
    if (typeof handler === "function") onComplete.push(handler);

    return app;
  };

  app.loadService = () => {};

  app.config = () => {};

  app.onLoad = () => {};

  app.module = () => {};

  app.serverMod = () => {};

  app._maps = () => {};
};

function initService(options) {
  appName = options.route;
  _host = options.host || "localhost";

  _server = require("./server")(
    options.route,
    options.port,
    _host,
    options.validation
  );

  tasks.server = _server.server;
  return tasks;
}
