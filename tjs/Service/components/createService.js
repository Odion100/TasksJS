const SocketDispatcher = require("./SocketDispatcher");
const ServiceModule = require("./ServiceModule");

const createService = (connData, resetConnection) => {
  const Service = SocketDispatcher.apply({}, [connData.namespace]);

  connData.modules.forEach(
    mod => (Service[mod.name] = ServiceModule(mod, connData, resetConnection))
  );

  Service.on("disconnect", resetConnection);
  return Service;
};

module.exports = createService;
