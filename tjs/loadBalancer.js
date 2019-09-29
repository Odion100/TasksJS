//this LoadBalancer file is used to facilitate loadbalancing as well as
//service discovery. Serveral intances of the same service can register
//as a clone of a service by sending it's connection data any service with
//identical routes will be considered clones. Service discovery is accomplished
//through this service by having serveral different services register with
//the same loadbalancer so they can be all be reached at the same host and port
const TasksJSServerModule = require("./ServerModule");
const TasksJSClient = require("./Client");
module.exports = function TasksJSLoadBalancer({
  port,
  host = "localhost",
  route = "loadbalancer"
}) {
  const ServerModule = TasksJSServerModule();
  const { server } = ServerModule.startService({ port, host, route });
  const Client = TasksJSClient();

  const clones = ServerModule("clones", function() {
    const clones = this;
    const serviceQueue = [];
    const handledEvents = [];
    //add these properties to the LoadBalancer for testing purposes
    clones.serviceQueue = serviceQueue;
    clones.handledEvents = handledEvents;

    clones.register = ({ port, host, route }, cb) => {
      if (!(port && route && host))
        return cb({
          message:
            "route port and host are required options of the clones.register(options) method",
          status: 400
        });
      route = route.charAt(0) === "/" ? route : "/" + route;
      const url = `http://${host}:${port}${route}`;
      //check if a route for this service has already been registered
      let service = serviceQueue.find(service => service.route === route);
      if (service) {
        //if the route to the services was already registered just add the new location
        if (service.locations.indexOf(url) === -1) {
          service.locations.push(url);
          //emit event for testing purposes
          //clones.emit("new_clone", { url, service });
          cb(null, { message: "New clone locations registered", service });
        }
      } else {
        service;
        service = {
          route,
          locations: [url]
        };
        //add new route to express server
        addService(service);
        //add service data to the queue
        serviceQueue.push(service);
        //emit event for testing purposes
        clones.emit("new_service", { url, service });
        cb(null, { message: "New route registered", service });
      }
    };
    //cause and event to be fired from this clones module
    //this is used when you want to ensure that all instance of a
    //service responds to a given event
    clones.shareEvent = ({ name, data }, cb) => {
      clones.emit(name, data);
      cb();
    };
    //clones using this loadbalancer service can used this function
    //to ensure that only one instance of the service responds to shared events
    clones.assignHandler = (event, cb) => {
      const e = handledEvents.find(e => (e.id = event.id));
      if (!e) {
        //record that the event was handled
        handledEvents.push(event);
        //call the callback to let the service handle the event
        cb(null, event);
      }

      if (handledEvents.length > 50) {
        //remove last 20 elements to keep list short
        handledEvents.splice(20);
      }
    };
  });

  const addService = ({ route, locations }) => {
    let location_index = 0;
    server.get(route, (req, res) => {
      //wrapped in a function so it can be called asynchronously
      function recursiveGetService() {
        //retrun status 404 if no clones are available
        if (locations.length === 0)
          res.status(404).json({
            message: `No services found on requested route: ${route}`
          });
        //ensure the location_index is less than the lenght of the array
        location_index = location_index < locations.length ? location_index : 0;
        const url = locations[location_index];
        //call recursiveGetService recursively until all locations have been exhuasted
        console.log(
          "trying this-----------------------------ooo00o000oo00o>>>>",
          url,
          locations,
          location_index
        );
        getService(url, (err, connData) => {
          console.log(
            err,
            "<---------o     hello world       o--------->",
            connData
          );
          if (err)
            if (locations.length > 0) recursiveGetService();
            else res.status(err.status || 500).json(err);
          else res.json(connData);
        });
      }
      recursiveGetService();
    });

    //attempt to retrieve connection data for the service from the registered clone locations
    const method = "GET";
    const getService = (url, cb) => {
      Client.request({ method, url }, (err, results) => {
        if (err) {
          //if the request to the service failes, remove the url for the list
          console.warn(
            `(TasksJSLoadBalancer): Removing (${url}) URL from ${route} Service`
          );
          //remove the ref to the service that failed to load
          //because the locations array can be transformed during
          //the async request, this is the best way to remove the location
          for (i = 0; i < locations.length; i++) {
            if (locations[i] === url) {
              locations.splice(i, 1);
              //emit event for testing purposes
              clones.emit("location_removed", { url, route, locations });
            }
          }

          cb(err);
        } else {
          location_index++;
          cb(null, results);
        }
      }).catch(err => console.log(err, "here<--------------------------"));
    };
  };

  return clones;
};
