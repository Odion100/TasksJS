const ServerModuleFactory = require("../ServerModule/ServerModule");

module.exports = function LoadBalancer({ port, host = "localhost", route = "loadbalancer" }) {
  const ServerModule = ServerModuleFactory();
  const { server, startService } = ServerModule;
  const clones = ServerModule("clones", CloneManager);
  return { server, startService, clones };
};
