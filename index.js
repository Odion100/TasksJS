//These are all the abstractions that make up TasksJS
const AppFactory = require("./tjs/App/App");
const LoadBalancerFactory = require("./tjs/LoadBalancer/LoadBalancer");
const ServiceFactory = require("./tjs/Service/Service");
const ServerManagerFactory = require("./tjs/ServerManager/ServerManager");
const ClientFactory = require("./tjs/Client/Client");
const HttpClientFactory = require("./tjs/HttpClient/HttpClient");

const App = AppFactory();
const ServerManager = ServerManagerFactory();
const HttpClient = HttpClientFactory();
const Service = ServiceFactory();
const Client = ClientFactory();
const LoadBalancer = LoadBalancerFactory();

module.exports = {
  //Export these pre-created objects for convenient object destructuring
  //These are the main utilities for app development
  App,
  HttpClient,
  LoadBalancer,
  Client,
  Service,
  ServerManager,
  //export all modules themselves
  //all these modules export factory functions
  //to ensure non-singleton behavior
  AppFactory,
  LoadBalancerFactory,
  ServiceFactory,
  ClientFactory,
  HttpClientFactory,
  ServerManagerFactory
};
