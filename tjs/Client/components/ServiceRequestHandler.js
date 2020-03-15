"use strict";
const HttpClient = require("../../HttpClient/HttpClient")();
module.exports = function ServiceRequestHandler(method, fn, resetConnection) {
  const ServiceModule = this;

  const makeQuery = data => {
    let query = "none/?";
    const props = Object.getOwnPropertyNames(data);
    props.forEach(name => (query += name + "=" + data[name] + "&"));
    return query;
  };

  return function sendRequest(data = {}, callback) {
    const tryRequest = (cb, errCount = 0) => {
      const { route, port, host } = ServiceModule.__connectionData();
      const singleFileURL = `http://${host}:${port}/sf${route}/${fn}`;
      const multiFileURL = `http://${host}:${port}/mf${route}/${fn}`;
      const defaultURL = `http://${host}:${port}${route}/${fn === "get" ? "" : fn}`;

      const url = `${data.file ? singleFileURL : data.files ? multiFileURL : defaultURL}`;

      if (url === defaultURL)
        HttpClient.request({
          url: `${url}${method === "get" ? makeQuery(data) : ""}`,
          method,
          body: { data }
        })
          .then(results => cb(null, results))
          .catch(err => ErrorHandler(err, errCount, cb));
      else
        HttpClient.upload({
          url,
          method,
          formData: data
        })
          .then(results => cb(null, results))
          .catch(err => ErrorHandler(err, errCount, cb));
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
