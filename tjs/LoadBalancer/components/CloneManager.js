const Router = require("./Router");
module.exports = function CloneManager(server) {
  const CloneManager = this;
  const cloneRouter = Router.apply(CloneManager, [server]);
  const handledEvents = [];
  CloneManager.clones = [];

  CloneManager.register = ({ port, host, route }, cb) => {
    if (!(port && route && host))
      return cb({
        message: "route port and host are required options",
        status: 400
      });

    route = route.charAt(0) === "/" ? route : "/" + route;
    const url = `http://${host}:${port}${route}`;
    let service = CloneManager.clones.find(service => service.route === route);

    if (service) {
      if (service.locations.indexOf(url) === -1) {
        service.locations.push(url);
        CloneManager.emit("new_clone", { url, service });
        cb(null, { message: "New clone locations registered", service });
      }
    } else {
      service = { route, locations: [url] };
      cloneRouter.addService(service);
      CloneManager.clones.push(service);
      CloneManager.emit("new_service", { url, service });
      CloneManager.emit("new_clone", { url, service });
      cb(null, { url, service });
    }
  };

  CloneManager.dispatch = ({ name, data }, cb) => {
    CloneManager.emit(name, data);
    cb();
  };

  CloneManager.assignDispatch = (event, cb) => {
    const e = handledEvents.find(e => (e.id = event.id));
    if (!e) {
      handledEvents.push(event);
      cb(null, event);
    } else cb({ message: "Event already handle", status: 403 });

    if (handledEvents.length > 50) handledEvents.splice(20);
  };
};
