module.exports = function TasksJSRouter(server, config) {
  const addService = (ServerModule, route, { fn, method }) => {
    server[method](
      [`/${route}/${fn}`, `/sf/${route}/${fn}`, `/mf/${route}/${fn}`],
      (req, res, next) => {
        req.fn = fn;
        req.ServerModule = ServerModule;
        next();
      },
      routeHandler
    );
  };

  const addREST = (ServerModule, route, { method }) => {
    server[method](
      [`/${route}`],
      (req, res, next) => {
        req.fn = method;
        req.ServerModule = ServerModule;
        next();
      },
      routeHandler
    );
  };

  const routeHandler = (req, res) => {
    const { params, query, file, files, body, fn, ServerModule = {} } = req;

    if (typeof ServerModule[fn] !== "function")
      return res.status(404).json({
        message: "TasksJSServiceError: Object resource not found",
        status: 404,
        TasksJSServiceError: true,
      });

    if (req.params.id === "tjs-query") req.params.id = undefined;
    const data = {
      ...params,
      ...query,
      ...(body.data || {}),
      file,
      files,
    };

    const callback = (error, results) => {
      if (error) {
        const status = error.status || 500;
        const message = error.message;
        res.status(status).json({
          status,
          error,
          TasksJSServiceError: true,
          serviceUrl: config().serviceUrl,
          message,
        });
      } else res.json(results);
    };

    try {
      ServerModule[fn](data, callback, req, res);
    } catch (error) {
      callback(error);
    }
  };

  return { addService, addREST };
};
