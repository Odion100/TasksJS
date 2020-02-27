const Service = require("../Service/Service");
const CloneManager = require("./components/CloneManager");
module.exports = function LoadBalancer() {
  const LoadBalancer = Service();
  const { server, startService } = LoadBalancer;
  const clones = LoadBalancer.ServerModule("clones", CloneManager);
  return { server, startService, clones };
};
