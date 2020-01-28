const Client = require("../Client/Client")();
const TasksJSModule = require("../Module/Module");
const io = require("socket.io-client");

module.exports = function TasksJSService() {
  const loadedServices = {};
  //this function makes a request to a service to recieve connectionData
  //which provides instruction on how to make request to each ServerModule in the service
  return async function Service(
    url,
    { forceReload = false, limit = 10, wait = 150 } = {}
  ) {
    //avoid loading connection data from Service already loaded
    if (loadedServices[url] && !forceReload) return loadedServices[url];

    const loadConnectionData = (limit, wait) => {
      const connectionErrors = [];

      return new Promise(function getData(resolve, reject) {
        Client.request({ method: "GET", url })
          .then(connectionData => resolve(connectionData))
          .catch(err => {
            connectionErrors.push(err);
            //attempt to load the service recursively up to ten times
            if (connectionErrors.length < limit)
              setTimeout(
                () => getData(resolve, reject),
                connectionErrors.length * wait
              );
            else {
              const connection_attempts = connectionErrors.length;
              reject({ connection_attempts, connectionErrors });
            }
          });
      });
    };

    const createService = connData => {
      const service = new TasksJSModule();
      service.TasksJSService = connData.TasksJSService;
      //each mod describes a backend ServerModule
      connData.modules.forEach(mod => {
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
            eventHandlers[event.name].forEach(cb => cb(event.data, event));
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
        return function sendData(data, cb) {
          const executeRequest = (cb, errCount = 0) => {
            if (data.file)
              Client.upload({
                url: `${singleFileURL}/${name}`,
                method,
                formData: data
              })
                .then(results => cb(null, results))
                .catch(err => ErrorHandler(err));
            else if (data.files)
              Client.upload({
                url: `${multiFileURL}/${name}`,
                method,
                formData: data
              })
                .then(results => cb(null, results))
                .catch(err => ErrorHandler(err));
            else {
              Client.request({ url: `${url}/${name}`, method, body: { data } })
                .then(results => cb(null, results))
                .catch(err => ErrorHandler(err));
            }
            const ErrorHandler = err => {
              //if the err object doesn't have TasksJSServerError value as true
              //we know the request never reached the server
              if (!err.TasksJSServerError) {
                //throw an error if a request fails three times in a row
                if (errCount >= 3)
                  throw Error(
                    `(TasksJSServiceError): Invalid route. Failed to reconnect after 3 attempts->
                url: ${url}
                method:${name}
                service:${service.TasksJSService.serviceUrl}
              `
                  );
                //reset the connection then try to make the same request again
                errCount++;
                resetConnection(() => executeRequest(cb, errCount));
              } else {
                service.emit("failed_request", {
                  err,
                  serverMod,
                  fn_name: name
                });
                cb(err);
              }
            };
          };

          //there is an option to use either the callback or the promise
          //if cb is a function then call executeRequest with cb as the callback
          // else return a promise that calls executRequest
          if (typeof cb === "function") executeRequest(cb);
          else
            return new Promise((resolve, reject) =>
              executeRequest((err, results) => {
                if (err) reject(err);
                else resolve(results);
              })
            );
        };
      }

      return serverMod;
    };

    //Use modules to update the endpoits to each ServerModule in the service
    const resetConnection = async cb => {
      const { modules, host, port } = await loadConnectionData(1, 0);
      //instead of re-instantiating the backend ServerModules we use the ___setConnection
      //method to update the serverModules' connection data
      modules.forEach(mod =>
        loadedServices[url][mod.name].__setConnection(
          host,
          port,
          mod.route,
          mod.namespace
        )
      );
      cb();
    };

    const connectWebSocket = (namespace, dispatch) => {
      const socket = io.connect(namespace);
      socket.on("dispatch", event => dispatch(event));
      socket.on("disconnect", () => dispatch({ name: "disconnect" }));
      socket.on("connect", () => dispatch({ name: "connect" }));
    };

    //use connectionData returned from the service to recreate the serverModule api
    try {
      const connectionData = await loadConnectionData(limit, wait);
      loadedServices[url] = createService(connectionData);
      return loadedServices[url];
    } catch (err) {
      throw err;
    }
  };
};
