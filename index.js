//The following modules return functions to ensure new
//instances are created on each function call
const TasksJSApp = require("./tjs/App");
const TasksJSLoadBalancer = require("./tjs/LoadBalancer");
const TasksJSServerModule = require("./tjs/ServerModule");
const TasksJSServer = require("./tjs/Server");
//The following don't need to return new intances
//or already are functions
const TasksJSService = require("./tjs/Service");
const TasksJSClient = require("./tjs/Client");
const TasksJSModule = require("./tjs/Module");
const TasksJServerManager = require("./tjs/ServerManager");
//this index file returns a function the ensure new instances
//of objects on export
module.exports = function TasksJS() {
  const App = TasksJSApp();
  const Client = TasksJSClient();
  const ServerModule = TasksJSServerModule();
  //return the function itself
  const Service = TasksJSService;
  const LoadBalancer = TasksJSLoadBalancer;

  return {
    //Export these pre-created objects for convenient object destructuring
    //These are the main utilities for app development
    App,
    Client,
    LoadBalancer,
    ServerModule,
    Service,
    //export all factory functions themselves
    TasksJSApp,
    TasksJSLoadBalancer,
    TasksJSServerModule,
    TasksJSServer,
    TasksJSService,
    TasksJSClient,
    TasksJSModule,
    TasksJServerManager
  };
};
