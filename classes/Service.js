async function Service(options) {
  //laod the service

  //use maps return from service to recreate the serverModule api
  return createServiceAPI(serviceData.maps);
}

const loadService = () => {};

function loadService(name, option) {
  var uri = "http://" + option.host + ":" + option.port + option.route;

  services[name] = {
    dependents: [],
    name: name,
    uri: uri,
    connection_attemps: 0,
    service: {}
  };

  initAsync.unshift(new getService(uri, name).run);
  setInit();

  _serv = name;
  return tasks;
}

function getService(url, name) {
  return {
    //run will be called by the mth
    run: function(next) {
      _client.request(
        {
          method: "GET",
          url: url
        },
        function(err, data) {
          if (err) {
            services[name].connection_attemps++;
            console.log(
              appName +
                " -- FAILED CONNECTION TO SERVICE: " +
                name +
                "---(after " +
                services[name].connection_attemps +
                " attempts)"
            );
            //console.log(err);
            //user can check for the existance of connectionErr property inside modules to check if the service has loaded correctly
            //so that the app can optionally be made to work even when some services fail
            services[name].service.connectionErr = true;
            services[name].service.err = err;

            //try to establish connection up to ten times
            if (services[name].connection_attemps < 10) {
              setTimeout(function() {
                getService(url, name).run();
              }, services[name].connection_attemps * 1500);
            }
          } else {
            console.log(
              appName +
                " -- SUCCESSFUL CONNECTION TO SERVICE: " +
                name +
                "---(after " +
                services[name].connection_attemps +
                " attempts)"
            );

            services[name].service.connectionErr = false;
            services[name].service.err = null;
            createServiceAPI(services[name], data);

            if (typeof services[name].onLoad === "function") {
              services[name].onLoad();
            }
          }
          if (typeof next === "function") {
            next();
          }
        }
      );
    }
  };
}

function createServiceAPI(serviceHolder, api) {
  var service = serviceHolder.service,
    maps = api.maps;
  //each map in apis.maps describes a backend serverMod
  for (var i = 0; i < maps.length; i++) {
    //serverModRequestHandler creates replica of the backend serverMod api
    //that will send a request to that serverMod's method
    service[maps[i].modName] = new serverModRequestHandler(
      maps[i],
      api.host,
      serviceHolder.name
    );
  }
}

function serverModRequestHandler(map, host, serviceName) {
  //handles request to backend server mod

  //use maps (an array) to regenerate backend  api
  //a map contains info on how to call a backend serverMod and what methods it has
  var serverMod = {},
    path = "http://" + host + "/" + map.route.join("/"),
    method_names = map.methods;

  for (var i = 0; i < method_names.length; i++) {
    serverMod[method_names[i]] = reqHandler(
      method_names[i],
      map.config[method_names[i]].request_method
    ).run;
  }

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

  //paths used for single and multi file uploads
  var sfPath = "http://" + host + "/sf/" + map.route.join("/");
  var mfPath = "http://" + host + "/mf/" + map.route.join("/");

  function reqHandler(method_name, request_method) {
    var handler = {
      run: function(data, callBack) {
        //make sure data is empty object by default
        function cb(err, data) {
          if (err) {
            //console.log(err);
            if (err.invalidMap) {
              mapErrHandler(err, req, callBack, handler);
            } else {
              if (typeof callBack === "function") {
                callBack(err);
              }
            }
          } else {
            if (typeof callBack === "function") {
              callBack(null, data);
            }
          }
        }

        data = data === null || data === undefined ? {} : data;
        var req = {
          method: request_method,
          data: data
        };

        if (data.file) {
          (req.url = sfPath + "/" + method_name), _client.upload(req, cb);
        } else if (data.files) {
          (req.url = mfPath + "/" + method_name), _client.upload(req, cb);
        } else {
          (req.url = path + "/" + method_name), _client.request(req, cb);
        }
      }
    };
    return handler;
  }

  serverMod._updatePath = function(new_route, new_host, new_nsp) {
    path = "http://" + new_host + "/" + new_route;
    socket.disconnect();
    socket = initSocketConnection(new_nsp);
  };

  function reconnectService() {
    _client.request(
      {
        method: "GET",
        url: services[serviceName].uri
      },
      function(err, new_api) {
        if (err) {
          console.log(err);
          //pass the job onto getService function
          getService(services[serviceName].uri, serviceName).run();
        } else {
          var new_maps = new_api.maps;

          //use updated new_maps to update the path for each serverMod of this service
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
            services[serviceName].onLoad();
          }
        }
      }
    );
  }
  /*-------------WebScoket Event Handling-----------------------*/

  eventHandlers = {};

  serverMod.on = function(eventName, handler) {
    eventHandlers[eventName] = eventHandlers[eventName] || {};
    eventHandlers[eventName].subscribers =
      eventHandlers[eventName].subscribers || [];
    eventHandlers[eventName].subscribers.push(handler);
  };

  function dispatch(e) {
    if (eventHandlers[e.name]) {
      e.received_by = appName;
      e.received_at = Date();
      eventHandlers[e.name].subscribers.forEach(function(sub) {
        sub(e);
      });
    }
  }

  function initSocketConnection(name_space) {
    var socket = io.connect(name_space);

    socket.on("dispatch", function(data) {
      //console.log(data);
      dispatch(data);
    });

    socket.on("disconnect", function(data) {
      console.log("on disconnect------------!");
      dispatch({
        name: "disconnect",
        data: data
      });
      socket.disconnect();
      reconnectService();
    });

    socket.on("connect", function(data) {
      //console.log('on connect------------!')
      //console.log(data)
    });
    return socket;
  }

  var socket = initSocketConnection(map.nsp);

  return serverMod;
}
