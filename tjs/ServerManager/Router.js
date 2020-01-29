module.exports = function TasksJSRouter(server) {
  //user (express) server.all to handle all request to a given ServerModule
  const addService = (ServerModule, route) => {
    server.param("fn", (req, res, next, fn) => {
      if (ServerModule[fn] === "function") {
        req.fn = fn;
        req.ServerModule = ServerModule;
        next();
      } else
        res.status(404).json({
          message: "TasksJSServiceError: Object resource not found",
          status: 404
        });
    });

    server.all(
      [`/${route}/:fn`, `/sf/${route}/:fn`, `/mf/${route}/:fn`],
      routeHandler
    );
  };

  const addREST = (ServerModule, route, method) => {
    server[method](
      [`${route}/:id`, `${route}/:id/:resource`],
      req => {
        req.fn = method;
        req.ServerModule = ServerModule;
        next();
      },
      routeHandler
    );
  };

  const routeHandler = (req, res) => {
    const { params, query, file, files, body, fn, ServerModule } = req;
    //in the case where there was a file upload the file/files should be passed with the data
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
