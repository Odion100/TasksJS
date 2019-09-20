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
const ClientServerTest = require("./units/ClientServer");
const ModuleTest = require("./units/Module");
const ServerManagerTest = require("./units/ServerManager");
const ServerModuleServiceTest = require("./units/ServerModuleService");
const AppTest = require("./units/App");
const LoadBalancerTest = require("./units/LoadBalancer");

ClientServerTest(TasksJSClient, TasksJSServer);

ModuleTest(TasksJSModule);

ServerManagerTest(TasksJSServerManager, Client);

ServerModuleServiceTest(TasksJSServerModule, TasksJSService, Client);

AppTest(TasksJSApp, ServerModule, Service);

// LoadBalancerTest(LoadBalancer, App, Service);
