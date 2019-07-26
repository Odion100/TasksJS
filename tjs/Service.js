const Client = require("./Client.js");
//this function makes a request to a service to recieve a maps array
//which provides instruction on how to make request to each serverMod in the service
module.exports = async function Service( url ) {
  //laod the service
  try {
    const serviceData = await Client.request({ method: "GET", url });
    //use maps return from service to recreate the serverModule api
    return createService(serviceData.maps);
  } catch (err) {
    throw err;
  }
  
}

const createService = maps => {
  const service = {};
  //each map describes a backend ServerModule
  maps.forEach(map => {
    service[map.modName] = serverModuleRequestHandler(map, service);
  });

  return service;
};

const serverModuleRequestHandler = (
  { methods, nsp, host, port, route },
  service
) => {
  const serverMod = {}, eventHandlers = {};
  const singleFileURL ='';
  const multiFileURL = '';
  const url = '';
  //this method sets up the urls to make request to the backend module
  serverMod.__setConnection = (host, route, port, wsData) => {
     singleFileURL = `http://${host}:${port}/sf/${route}`;
     multiFileURL = `http://${host}:${port}/mf/${route}`;
     url = `http://${host}:${port}${route}`;

    //connectWebSocket function will handle events coming from the backend ServerModules
    //the callback will be called for every event coming from that module so in the 
    //callback we dispatch the event to the handler of the particular event
    connectWebSocket(nsp, (event)=>{
      if(eventHandlers[event.name])
        eventHandlers[event.name].forEach(cb=>cb(event))
    })
  };
  serverMod.__setConnection(host, port, route, wsData);

  //adds callback that will be called every time the backend ServerModule fires the given event
  serverMod.on = (name, cb) =>{
    eventHandlers[name] = eventHandlers[name] || [];
    eventHandlers[name].push(cb)
  }
  
  //for each method on the serverMod, requestHandler returns a function 
  //that will handle sending data to the backend ServerModule
  methods.forEach(fn => (serverMod[fn.name] = requestHandler(fn)));

  const requestHandler = ({ method, name }) => {
    const sendData
    return sendData = (data, cb, errCount = 0) => {
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
            resetConnection(err.maps, service, () => sendData(data, cb, errCount++));
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
    };
  };
};

//Use the maps to update the endpoits to each ServerModule in the service
const resetConnection = (maps, service, cb) => {
  //instead of re-instantiating the backend serverModule we use the ___setConnection
  //method to update the serverModules' connection data
  maps.forEach(map =>
    service[map.modName].__setConnection(map.host, map.port, map.route, map.wsData)
  );

  cb();
};

const connectWebSocket = (nsp, eventCallback) => {
    const socket = io.connect(nsp);

    socket.on(`dispatch:`, (data)=>eventCallback(data))

    socket.on('disconnect', (data)=>{

    })

    socket.on('connect', (data)=>{

    })
};