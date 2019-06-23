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
  maps.forEach(map => {
    service[map.modName] = serverModuleRequestHandler(map);
  });

  return service;
};

const serverModuleRequestHandler = ({ modName, methods, nsp }, service) => {
  const serverMod = {};

  //for each method on the serverMod, requestHandler returns a function that will handle requests
  methods.forEach(method => (serverMod[method.name] = requestHandler(method)));

  //these are the routes to the serverMod in the backend
  const singleFileURL = `http://${host}:${port}/sf/${route}`;
  const multiFileURL = `http://${host}:${port}/mf/${route}`;
  const url = `http://${host}:${port}${route}`;

  const requestHandler = ({ method, name }) => {
    //create the request url using the serverMod and method data
    return (data, cb) => {
      const requestCB = (err, results) => {
        if (err) {
          if (err.invalidMapERROR) {
            invalidMapHandler(err);
          } else {
            if (typeof cb === "function") cb(err);
          }
        } else {
          if (typeof cb === "function") cb(null, results);
        }
      };

      //if there is a file or files property on the data object make the
      //request to the appropriate file upload route
      switch (true) {
        case data.file:
          return Client.uploadFile(
            { url: `${singleFileURL}/${name}`, method, data },
            requestCB
          );
        case data.files:
          return Client.uploadFile(
            { url: `${multiFileURL}/${name}`, method, data },
            requestCB
          );
        default:
          return Client.request(
            { url: `${url}/${name}`, method, data },
            requestCB
          );
      }
    };
  };
};
const connectWebSocket = () => {};
//Attempts to
const requestErrHandler = errCount => {
  //throw an error if a request fails three times in a row
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
