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
    const { query, file, files, body, fn, ServerModule = {}, module_name, method } = req;
    const { useCallbacks, useReturnValues, serviceUrl, validateArgs } = config();
    const callback = (error, results) => {
      if (error) {
        error.status = error.status || 500;
        res.status(error.status).json({
          ...error,
          TasksJSServiceError: true,
          serviceUrl: serviceUrl,
          module_name,
          fn,
        });
      } else res.json(results);
    };
    try {
      const returnValue = (results) => {
        if (isObject(results)) {
          if (results.status >= 400) cb(results);
          else callback(null, results);
        } else callback(null, results);
      };

      if (typeof ServerModule[fn] !== "function")
        return callback({
          message: "Object resource not found",
          status: 404,
        });
      const __arguments = body.__arguments || [];

      if (!isEmpty(query) && !__arguments.length) __arguments.push(query);
      if (useCallbacks) __arguments.push(callback);
      if (isObject(__arguments[0]) && method === "PUT")
        __arguments[0] = {
          ...__arguments[0],
          file,
          files,
        };

      if (validateArgs)
        if (ServerModule[fn].length > 0 && ServerModule[fn].length !== __arguments.length) {
          const callbackMsg = useCallbacks ? " (including a callback function)" : "";
          return callback({
            message: `In valid number of arguments: Expected ${ServerModule[fn].length}${callbackMsg}, Recieved ${__arguments.length}${callbackMsg}.`,
            status: 400,
          });
        }

      const results = ServerModule[fn].apply({ req, res }, __arguments);

      if (useReturnValues)
        if (!useCallbacks) returnValue(results);
        else {
          //in this case check to see that results are not undefined are null
          if (results || results === false) returnValue(results);
        }
    } catch (error) {
      callback(error);
    }
  };

  return { addService, addREST };
};

const isObject = (value) =>
  typeof value === "object" ? (!value ? false : !Array.isArray(value)) : false;
const isEmpty = (obj) => Object.getOwnPropertyNames(obj).length === 0;
