module.exports = function requestHandler(method, fn) {
  const ServiceModule = this;

  return function sendRequest(data, callback) {
    const RequestHandler = (cb, errCount = 0) => {
      const { route, port, host } = ServiceModule.connectionData();
      const singleFileURL = `http://${host}:${port}/sf/${route}/${fn}`;
      const multiFileURL = `http://${host}:${port}/mf/${route}/${fn}`;
      const defaultURL = `http://${host}:${port}/${route}/${fn}`;

      const url = data.file ? singleFileURL : data.files ? multiFileURL : defaultURL;

      if (url === defaultURL)
        Client.request({ url, method, body: { data } })
          .then(results => cb(null, results))
          .catch(err => ErrorHandler(err, errCount, cb));
      else
        Client.upload({
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
      } else {
        if (errCount >= 3) throw Error(`(TasksJSServiceError): Invalid route`);
        errCount++;
        ServiceModule.resetConnection(() => RequestHandler(cb, errCount));
      }
    };
    //there is an option to use either the callback or the promise
    //if cb is a function then call executeRequest with cb as the callback
    // else return a promise that calls executRequest
    if (typeof callback === "function") request(callback);
    else
      return new Promise((resolve, reject) =>
        request((err, results) => {
          if (err) reject(err);
          else resolve(results);
        })
      );
  };
};
