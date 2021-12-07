"use strict";
const HttpClient = require("../../HttpClient/HttpClient")();
const isObject = (value) => {
  if (value === "object") return !value ? false : !Array.isArray(value);
  else false;
};

module.exports = function ServiceRequestHandler(method, fn, resetConnection) {
  const ServiceModule = this;

  const makeQuery = (data) => {
    let query = "?";
    const props = Object.getOwnPropertyNames(data);
    props.forEach((name) => (query += name + "=" + data[name] + "&"));
    return query;
  };

  return function sendRequest() {
    const callback =
      typeof arguments[arguments.length - 1] === "function"
        ? arguments[arguments.length - 1]
        : null;
    const __arguments = callback
      ? Array.from(arguments).splice(0, arguments.length - 1)
      : Array.from(arguments);

    const tryRequest = (cb, errCount = 0) => {
      const { route, port, host } = ServiceModule.__connectionData();
      const singleFileURL = `http://${host}:${port}/sf${route}/${fn}`;
      const multiFileURL = `http://${host}:${port}/mf${route}/${fn}`;
      const defaultURL = `http://${host}:${port}${route}/${fn === "get" ? "" : fn}`;
      const { file, files } = __arguments[0] || {};
      const url = file ? singleFileURL : files ? multiFileURL : defaultURL;

      if (url === defaultURL)
        HttpClient.request({
          url: `${url}${
            method === "get" && isObject(__arguments[0]) ? makeQuery(__arguments[0]) : ""
          }`,
          method,
          body: { __arguments },
        })
          .then((results) => cb(null, results))
          .catch((err) => ErrorHandler(err, errCount, cb));
      else
        HttpClient.upload({
          url,
          method,
          formData: { ...__arguments[0], __arguments },
        })
          .then((results) => cb(null, results))
          .catch((err) => ErrorHandler(err, errCount, cb));
    };

    const ErrorHandler = (err, errCount, cb) => {
      if (err.TasksJSServiceError) {
        cb(err);
      } else if (errCount <= 3) {
        console.log(err);
        errCount++;
        resetConnection(() => tryRequest(cb, errCount));
      } else throw Error(`(TasksJSServiceError): Invalid route:${err}`);
    };

    if (typeof callback === "function") tryRequest(callback);
    else
      return new Promise((resolve, reject) =>
        tryRequest((err, results) => {
          if (err) reject(err);
          else resolve(results);
        })
      );
  };
};
