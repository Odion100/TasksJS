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

const serverModuleRequestHandler = (
  { modName, methods, nsp, host, port, route },
  service
) => {
  const serverMod = {};

  //for each method on the serverMod, requestHandler returns a function that will handle requests
  methods.forEach(method => (serverMod[method.name] = requestHandler(method)));

  //this method sets up the url to make request to the backend module
  serverMod.__setConnection = (host, route, port) => {
    const singleFileURL = `http://${host}:${port}/sf/${route}`;
    const multiFileURL = `http://${host}:${port}/mf/${route}`;
    const url = `http://${host}:${port}${route}`;
  };
  serverMod.__setConnection(host, port, route);

  const requestHandler = ({ method, name }) => {
    //create the request url using the serverMod and method data
    const fn = (data, cb, errCount = 0) => {
      //if there is a file or files property on the data object make the
      //request to the appropriate file upload route
      switch (true) {
        case data.file:
          return Client.uploadFile(
            { url: `${singleFileURL}/${name}`, method, data },
            callBack
          );
        case data.files:
          return Client.uploadFile(
            { url: `${multiFileURL}/${name}`, method, data },
            callBack
          );
        default:
          return Client.request(
            { url: `${url}/${name}`, method, data },
            callBack
          );
      }
      //handles callback after each request
      const callBack = (err, results) => {
        if (err) {
          if (err.invalidMapERROR) {
            //throw an error if a request fails three times in a row
            if (errCount >= 3)
              throw Error(
                "(TasksJS): Invalid route. Failed to reconnect after 3 attempts."
              );
            //reset the connection then try to make the same request again
            resetConnection(err.maps, service, () => fn(data, cb, errCount++));
          } else {
            if (typeof cb === "function") cb(err);
          }
        } else {
          if (typeof cb === "function") cb(null, results);
        }
      };
    };

    return fn;
  };
};
const connectWebSocket = () => {};
//Use the maps from error object to the path to each ServerModule in the service
const resetConnection = (maps, service, cb) => {
  //instead of re-instantiating the backend serverModule we use the ___setConnection
  //method to update the serverModules' connection data
  maps.forEach(map =>
    service[map.modName].__setConnection(map.host, map.port, map.route)
  );

  cb();
};
