module.exports = function TasksJSRouter(server) {
  //user (express) server.all to handle all request to a given ServerModule
  const addService = (ServerModule, route) => {
    server.all(
      [`/${route}/:fn`, `/sf/${route}/:fn`, `/mf/${route}/:fn`],
      (req, res, next, fn) => {
        req.fn = fn;
        req.ServerModule = ServerModule;
        next();
      },
      routeHandler
    );
  };

  const addREST = (ServerModule, route, method) => {
    server[method](
      [`${route}/:id`, `${route}/:id/:resource`],
      (req, res, next) => {
        req.fn = method;
        req.ServerModule = ServerModule;
        next();
      },
      routeHandler
    );
  };

  const routeHandler = (req, res) => {
    const { params, query, file, files, body, fn, ServerModule } = req;

    if (typeof ServerModule[fn] !== "function")
      return res.status(404).json({
        message: "TasksJSServiceError: Object resource not found",
        status: 404,
        ServerModule,
        fn,
        query,
        params
      });

    const data = {
      ...(body.data || {}),
      ...query,
      ...params,
      file,
      files
    };

    const callback = (err, results) => {
      if (err) res.status(err.status || 500).json({ err });
      else res.json(results);
    };

    ServerModule[fn](data, callback, req, res);
  };

  return { addService, addREST };
};
