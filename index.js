//These are all the abstractions that make up TasksJS
const TasksJSApp = require("./tjs/App");
const TasksJSLoadBalancer = require("./tjs/LoadBalancer");
const TasksJSServerModule = require("./tjs/ServerModule");
const TasksJSServer = require("./tjs/Server");
const TasksJSServerManager = require("./tjs/ServerManager");
const TasksJSService = require("./tjs/Service");
const TasksJSClient = require("./tjs/Client");
const TasksJSModule = require("./tjs/Module");

//this index file exports a function to ensure non-singleton behavior
module.exports = function TasksJS() {
  const App = TasksJSApp;
  const app = App();
  const Client = TasksJSClient();
  const ServerModule = TasksJSServerModule();
  //create separate names for these main utilites
  const Service = TasksJSService();
  const LoadBalancer = TasksJSLoadBalancer;

  return {
    //Export these pre-created objects for convenient object destructuring
    //These are the main utilities for app development
    App,
    Client,
    LoadBalancer,
    ServerModule,
    Service,
    app,
    //export all modules themselves
    //all these modules export factory functions
    //to ensure non-singleton behavior
    TasksJSApp,
    TasksJSLoadBalancer,
    TasksJSServerModule,
    TasksJSServer,
    TasksJSService,
    TasksJSClient,
    TasksJSModule,
    TasksJSServerManager
  };
};
