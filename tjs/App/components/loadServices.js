const Client = require("../../Client/Client");
module.exports = ({ Services, App }) => {
  return Promise.all(
    Services.map(serviceData => {
      const { url, limit, wait, name, onLoad } = serviceData;
      new Promise(resolve => {
        Client.loadService(url, { limit, wait })
          .then(service => {
            serviceData.client = service;
            if (typeof onLoad === "function") {
              onLoad(serviceData.client);
              serviceData.client.on("reconnect", onLoad);
            }
            App.emit("service_loaded", serviceData.client).emit(
              `service_loaded:${name}`,
              serviceData.client
            );
            resolve();
          })
          .catch(err => {
            console.warn(err);
            App.emit("failed_connection", err);
            resolve();
          });
      });
    })
  );
};
