const ServerModuleFactory = require("../ServerModule/ServerModule");
const CloneManager = require("./components/CloneManager");
module.exports = function LoadBalancer() {
  const ServerModule = ServerModuleFactory();
  const { server, startService } = ServerModule;
  const clones = ServerModule("clones", CloneManager);
  return { server, startService, clones };
};
