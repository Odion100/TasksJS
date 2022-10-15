const isObject = (value) =>
  typeof value === "object" ? (!value ? false : !Array.isArray(value)) : false;
const isEmpty = (obj) => Object.getOwnPropertyNames(obj).length === 0;
const isPromise = (p) => typeof p === "object" && typeof p.then === "function";

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
    const { query, file, files, body, fn, ServerModule, module_name, method } = req;
    const { serviceUrl } = config();
    const presets = { serviceUrl, module_name, fn };
    const sendError = (error) => {
      const status = error.status || 500;
      const message = error.message || "Unexpected error";
      const unhandledMessage = status === 500 ? "Unhandled error" : "Error";
      res.status(status).json({
        ...presets,
        error,
        status,
        message: `[SystemLink][error]: ${unhandledMessage} While calling ${module_name}.${fn}(...): ${message}`,
        TasksJSServiceError: true,
      });
    };
    const sendResponse = (returnValue) => {
      const status = returnValue.status || 200;
      if (status < 400) {
        res.status(status).json({
          ...presets,
          status,
          message:
            returnValue.message ||
            `[SystemLink][response]: ${module_name}.${fn}(...) returned successfully`,
          returnValue,
        });
      } else sendError(returnValue);
    };

    if (typeof ServerModule[fn] !== "function")
      return sendResponse({
        message: `[SystemLink][error]:${module_name}.${fn} method not found`,
        status: 404,
      });

    try {
      const args = body.__arguments || [];
      if (!isEmpty(query) && !args.length) args.push(query);
      if (isObject(args[0]) && method === "PUT") args[0] = { ...args[0], file, files };

      const results = ServerModule[fn].apply(ServerModule, args);

      if (isPromise(results)) {
        results.then(sendResponse).catch(sendError);
      } else {
        sendResponse(results);
      }
    } catch (error) {
      sendError(error);
    }
  };

  return { addService, addREST };
};
