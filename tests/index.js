const {
  //Import these pre-created objects
  //These are the main utilities for app development
  App,
  Client,
  LoadBalancer,
  ServerModule,
  Service,
  //Import all factory functions themselves
  TasksJSApp,
  TasksJSLoadBalancer,
  TasksJSServerModule,
  TasksJSServer,
  TasksJSService,
  TasksJSClient,
  TasksJSModule,
  TasksJSServerManager
} = require("../index")();

//import tests all wrapped in functions that take test data as
//parameters and return the tests as an executable function
const ClientServerTest = require("./units/ClientAndServer.test");
const ModuleTest = require("./units/Module.test");
const ServerManagerTest = require("./units/ServerManager.test");
const ServerModuleServiceTest = require("./units/ServerModuleService.test");
const AppTest = require("./units/App.test");
const LoadBalancerTest = require("./units/LoadBalancer.test");
ClientServerTest(TasksJSClient, TasksJSServer);

ModuleTest(TasksJSModule);

ServerManagerTest(TasksJSServerManager, Client);

ServerModuleServiceTest(TasksJSServerModule, TasksJSService, Client);

AppTest(TasksJSApp, ServerModule, Service);

LoadBalancerTest(LoadBalancer, App, Service);
