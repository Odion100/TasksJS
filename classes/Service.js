const Client = require("./Client.js");
//this function makes a request to a service to recieve a maps array
//which provides instruction on how to make request to each serverMod in the service
async function Service(name, { host, port, route, url }) {
  //laod the service
  url = url || `http://${host}:${port}${route}`;

  try {
    const serviceData = await Client.request({ method: "GET", url });
  } catch (err) {
    throw err;
  }
  //use maps return from service to recreate the serverModule api
  return createService(serviceData.maps);
}

const createService = maps => {
  const service = {};
  //each map describes a backend ServerModule
  maps.forEach(({ modName, methods, nsp }) => {
    service[modName] = {};
    //for each method on the serverMod, servicerRequestHandler returns a function that will handle requests
    methods.forEach(
      method =>
        (service[modName][method.name] = serviceRequestHandler(method, service))
    );
  });

  return service;
};

const serviceRequestHandler = async ({ url, method, name }, service) => {
  //create the request url using the serverMod and method data
  return (data, cb) => {
    return Client.request({ url, method, data }, (err, results) => {
      if (err) {
        if (err.invalidMapERROR) {
          invalidMapHandler(err);
        } else {
          if (typeof cb === "function") cb(err);
        }
      } else {
        if (typeof cb === "function") cb(null, results);
      }
    });
  };
};
const connectWebSocket = () => {};
//Attempts to
const requestErrHandler = errCount => {
  if (errCount >= 3)
    throw Error(
      "(TasksJS): Invalid route. Failed to reconnect after 3 attempts."
    );

  requestErrHandler();
};
const invalidMapHandler = () => {};

var attempts = 0;
function mapErrHandler(new_api, req, callBack, handler) {
  //continually attempt to make the request to a new service api
  attempts++;
  if (attempts >= 3) {
    throw "tasksJS ERROR: Invalid Map!!! FAILED TO CONNECT TO APP AFTER " +
      attempts +
      " ATTEMPTS!!!";
  } else {
    var new_maps = new_api.maps;

    //use new_maps to update the path for each serverMod of this service
    for (var i = 0; i < new_maps.length; i++) {
      var new_route = new_maps[i].route.join("/");
      //loop throuhg each serverMod in the service and use _updatePath method to update the route to the serverMod
      services[serviceName].service[new_maps[i].modName]._updatePath(
        new_route,
        new_api.host,
        new_maps[i].nsp
      );
    }

    if (typeof services[serviceName].onLoad === "function") {
      //run onLoad Handler first
      services[serviceName].onLoad(function() {
        //use this handle on reqHandler to resend the request
        handler.run(req.data, function(err, data) {
          callBack(err, data);
          attempts = 0;
        });
      });
    } else {
      //use this handle on reqHandler to resend the request
      handler.run(req.data, function(err, data) {
        callBack(err, data);
        attempts = 0;
      });
    }
  }
}
