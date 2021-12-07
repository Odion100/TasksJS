module.exports = function TasksJSRouter(server, config) {
  const addService = (ServerModule, route, { fn, method }, module_name) => {
    server[method](
      [`/${route}/${fn}`, `/sf/${route}/${fn}`, `/mf/${route}/${fn}`],
      (req, res, next) => {
        req.module_name = module_name;
        req.fn = fn;
        req.ServerModule = ServerModule;
        next();
      },
      routeHandler
    );
  };

  const addREST = (ServerModule, route, { method }, module_name) => {
    server[method](
      [`/${route}`],
      (req, res, next) => {
        req.module_name = module_name;
        req.fn = method;
        req.ServerModule = ServerModule;
        next();
      },
      routeHandler
    );
  };

  const routeHandler = (req, res) => {
    const { params, query, file, files, body, fn, ServerModule = {}, module_name } = req;
    const callback = (error, results) => {
      if (error) {
        error.status |= error.status || 500;
        res.status(error.status).json({
          ...error,
          TasksJSServiceError: true,
          serviceUrl: config().serviceUrl,
          module_name,
          fn,
        });
      } else res.json(results);
    };

    if (typeof ServerModule[fn] !== "function")
      return callback({
        message: "Object resource not found",
        status: 404,
      });
    const __arguments = body.__arguments || [];
    __arguments.push(callback);
    if (isObject(__arguments[0]))
      __arguments[0] = {
        ...params,
        ...query,
        ...__arguments[0],
        file,
        files,
      };
    try {
      if (config().validateArgs)
        if (ServerModule[fn].length > 0 && ServerModule[fn].length !== __arguments.length)
          return callback({
            message: `In valid number of arguments: Expected ${ServerModule[fn].length} (including a callback function), Recieved ${__arguments.length} (including a callback function).`,
            status: 400,
          });

      ServerModule[fn].apply({ req, res }, __arguments);
    } catch (error) {
      callback(error);
    }
  };

  return { addService, addREST };
};

const isObject = (value) => {
  if (value === "object") return !value ? false : !Array.isArray(value);
  else false;
};
