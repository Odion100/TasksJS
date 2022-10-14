const { response } = require("express");

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

    const setResponse = {
      status: 200,
      message: `SystemLink: ${module_name}.${fn}() returned successfully`,
    };
    const set = ({ status = setResponse.status, message = setResponse.message }) => {
      setResponse.status = status;
      setResponse.message = message;
      return sendResponse;
    };
    const sendResponse = (results) => {
      const status = results.status || setResponse.status;
      const message = results.message || setResponse.message;
      res.status(status).json({
        serviceUrl,
        module_name,
        fn,
        status,
        message,
        ...(status < 500 ? { returnValue: results } : { error: results }),
      });
    };

    if (typeof ServerModule[fn] !== "function")
      return sendResponse({
        message: `SystemLink:${module_name}.${fn} method resource not found`,
        status: 404,
      });

    try {
      const args = body.__arguments || [];
      if (!isEmpty(query) && !args.length) args.push(query);
      if (isObject(args[0]) && method === "PUT") args[0] = { ...args[0], file, files };

      const results = ServerModule[fn].apply({ ...ServerModule, set }, args);

      if (isPromise(results)) {
        results.then(sendResponse).catch(sendResponse);
      } else {
        sendResponse(results);
      }
    } catch (error) {
      setResponse.status = 500;
      setResponse.message = `SystemLink: Unhandled error while calling ${module_name}.${fn}()`;
      sendResponse(error);
    }
  };

  return { addService, addREST };
};
