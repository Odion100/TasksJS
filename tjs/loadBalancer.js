const ServerModule = require("./ServerModule");
const server = ServerModule.startServer({ port, host, route });
const Client = require("./Client");

ServerModule("clones", function() {
  const clones = this;
  const serviceQueue = [];
  const handledEvents = [];

  clones.register = (connectionData, cb) => {
    const { port, host, route } = connectionData;
    const url = `http://${host}:${port}${route}`;
    //check if a route for this service has already been registered
    const service = serviceQueue.find(service => (service.route = route));
    if (service) {
      //if the route to the services was already registered just add the location
      if (service.locations.indexOf(url) === -1) service.locations.push(url);
    } else {
      const service = {
        route,
        locations: [url]
      };
      //add new route to express server
      addService(service);
      //add service data to the queue
      serviceQueue.push(service);
    }
    cb();
  };
  //cause and event to be fired from this clones module
  //this is used when you want to ensure that all instance of a
  //service responds to a given event
  clones.fireEvent = ({ name, data }, cb) => {
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
      cb();
    }

    if (handledEvents.length > 50) {
      //remove last 20 elements to keep list short
      handledEvents.splice(20);
    }
  };

  const addService = ({ route, locations }) => {
    let location_index = 0;

    //attempt to retrieve maps for the service from the registered clone locations
    const getService = async cb => {
      if (locations.length > 0) {
        const i = location_index < locations.length ? location_index : 0;
        const url = locations[i];
        const method = "get";

        service.location_index++;

        Client.request({ method, url }, (err, results) => {
          if (err) {
            //if the request to the service failes, remove the url for the list
            console.log(
              `(LoadBalancer): Removing (${url}) URL from ${route} Service`
            );
            //remove the ref to the service that failed to load
            locations.splice(i, 1);
            //call getService recursively until all locations have been exhuasted
            return getService(service);
          } else {
            cb(results);
          }
        });
      } else {
        cb({ message: `No services found on requested route: ${route}` });
      }
    };

    server.get(route, (req, res) => {
      const service = serviceQueue.find(service => service.route === route);

      if (service) {
        getService(service, (err, maps) => {
          if (err) {
          } else {
            res.json(maps);
          }
        });
      } else {
        cb({ message: `Unable to find registered service: ${route}` });
      }
    });
  };
});
