const Client = require("./Client.js")();
const TasksJSModule = require("./Module");
const io = require("socket.io-client");
const loadedServices = {};
//this function makes a request to a service to recieve a mods array
//which provides instruction on how to make request to each serverMod in the service
module.exports = function TasksJSService(
  url,
  forceReload = false,
  limit = 10,
  wait = 1500
) {
  const connectionErrors = [];
  let connection_attemps = 0;
  //avoid loading connection data from Service already loaded
  if (loadedServices[url] && !forceReload) return loadedServices[url];

  const loadService = async () => {
    try {
      const connectionData = await Client.request({ method: "GET", url });
      //use connectionData returned from the service to recreate the serverModule api
      loadedServices[url] = createService(connectionData);
      return loadedServices[url];
    } catch (err) {
      connectionErrors.push(err);
      connection_attemps++;
      //attempt to load the service recursively up to ten times
      if (connection_attemps < limit)
        setTimeout(() => loadService(), connection_attemps * wait);
      else throw { connection_attemps, connectionErrors };
    }
  };

  return loadService();
};

const createService = connData => {
  const service = new TasksJSModule();
  //each mod describes a backend ServerModule
  connData.mods.forEach(mod => {
    service[mod.name] = serverModuleRequestHandler(mod, connData, service);
  });

  return service;
};

const serverModuleRequestHandler = (
  { methods, namespace, route },
  { port, host },
  service
) => {
  const serverMod = {};
  const eventHandlers = {};
  let singleFileURL = "";
  let multiFileURL = "";
  let url = "";
  //this method sets up the urls to make request to the backend module
  serverMod.__setConnection = (host, port, route, namespace) => {
    singleFileURL = `http://${host}:${port}/sf/${route}`;
    multiFileURL = `http://${host}:${port}/mf/${route}`;
    url = `http://${host}:${port}/${route}`;

    //connectWebSocket function will handle events coming from the backend ServerModules
    //the callback will be called for every event coming from that module so in the
    //callback we dispatch the event to the handler of the particular event
    connectWebSocket(namespace, event => {
      if (eventHandlers[event.name])
        eventHandlers[event.name].forEach(cb => cb(event));
    });
  };
  serverMod.__setConnection(host, port, route, namespace);

  //adds callback that will be called every time the backend ServerModule fires the given event
  serverMod.on = (name, cb) => {
    eventHandlers[name] = eventHandlers[name] || [];
    eventHandlers[name].push(cb);
  };

  //for each method on the serverMod, requestHandler returns a function
  //that will handle sending data to the backend ServerModule
  methods.forEach(fn => (serverMod[fn.name] = requestHandler(fn)));

  function requestHandler({ method, name }) {
    return function sendData(data, cb, errCount = 0) {
      //handles callback after each request
      const callBack = (err, results) => {
        if (err) {
          if (err.invalidModERROR) {
            //throw an error if a request fails three times in a row
            if (errCount >= 3)
              throw Error(
                "(TasksJSService invalidModERROR): Invalid route. Failed to reconnect after 3 attempts."
              );
            //reset the connection then try to make the same request again
            resetConnection(err, service, () => {
              errCount++;
              sendData(data, cb, errCount);
            });
          } else {
            service.emit("failed_request", { err, serverMod, fn_name: name });
            if (typeof cb === "function") cb(err);
          }
        } else {
          if (typeof cb === "function") cb(null, results);
        }
      };

      //if there is a file or files property on the data object make the
      //request to the appropriate file upload route

      if (data.file)
        return Client.upload(
          { url: `${singleFileURL}/${name}`, method, formData: data },
          callBack
        );
      else if (data.files)
        return Client.upload(
          { url: `${multiFileURL}/${name}`, method, formData: data },
          callBack
        );
      else {
        return Client.request(
          { url: `${url}/${name}`, method, body: { data } },
          callBack
        );
      }
    };
  }

  return serverMod;
};

//Use mods to update the endpoits to each ServerModule in the service
const resetConnection = ({ mods, host, port }, service, cb) => {
  //instead of re-instantiating the backend serverModule we use the ___setConnection
  //method to update the serverModules' connection data
  mods.forEach(mod =>
    service[mod.name].__setConnection(host, port, mod.route, mod.namespace)
  );
  cb();
};

const connectWebSocket = (namespace, dispatch) => {
  const socket = io.connect(namespace);
  socket.on(`dispatch`, data => dispatch(data));
  socket.on("disconnect", data => dispatch({ name: "disconnect", data }));
  socket.on("connect", data => dispatch({ name: "connect", data }));
};
