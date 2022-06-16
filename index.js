//These are all the abstractions that make up TasksJS
const { isNode } = require("./utils/ProcessChecker");
const AppFactory = require("./tjs/App/App");
const LoadBalancerFactory = require("./tjs/LoadBalancer/LoadBalancer");
const ServiceFactory = require("./tjs/Service/Service");
const ServerManagerFactory = require("./tjs/ServerManager/ServerManager");
const ClientFactory = require("./tjs/Client/Client");
const HttpClientFactory = require("./tjs/HttpClient/HttpClient");
const DispatcherFactory = require("./tjs/Dispatcher/Dispatcher");

const ServerManager = isNode ? ServerManagerFactory() : null;
const Service = isNode ? ServiceFactory() : null;
const LoadBalancer = isNode ? LoadBalancerFactory() : null;

const App = AppFactory();
const HttpClient = HttpClientFactory();
const Client = ClientFactory();
const Dispatcher = DispatcherFactory();

module.exports = {
  //Export these pre-created objects for convenient object destructuring
  //These are the main utilities for app development
  App,
  HttpClient,
  LoadBalancer,
  Client,
  Service,
  ServerManager,
  Dispatcher,
  //export all modules themselves
  //all these modules export factory functions
  //to ensure non-singleton behavior
  AppFactory,
  LoadBalancerFactory,
  ServiceFactory,
  ClientFactory,
  HttpClientFactory,
  ServerManagerFactory,
  DispatcherFactory,
};
