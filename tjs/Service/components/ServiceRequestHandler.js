module.exports = function requestHandler(method, fn) {
  const ServiceModule = this;

  return function sendRequest(data, callback) {
    const RequestHandler = (errCount = 0) => {
      const { singleFileURL, multiFileURL, URL } = ServiceModule.connectionData;
      switch (true) {
        case data.file:
          return Client.upload({
            url: `${singleFileURL}/${fn}`,
            method,
            formData: data
          })
            .then(results => callback(null, results))
            .catch(err => ErrorHandler(err, errCount, callback));
        case data.files:
          return Client.upload({
            url: `${multiFileURL}/${fn}`,
            method,
            formData: data
          })
            .then(results => callback(null, results))
            .catch(err => ErrorHandler(err, errCount, callback));
        default:
          Client.request({ url: `${URL}/${fn}`, method, body: { data } })
            .then(results => callback(null, results))
            .catch(err => ErrorHandler(err, errCount, callback));
      }
    };

    const ErrorHandler = (err, errCount) => {
      //if the err object doesn't have TasksJSServerError value as true
      //we know the request never reached the server
      if (!err.TasksJSService) {
        //throw an error if a request fails three times in a row
        if (errCount >= 3) throw Error(`(TasksJSServiceError): Invalid route`);
        //reset the connection then try to make the same request again
        errCount++;
        ServiceModule.resetConnection(() => RequestHandler(errCount));
      } else {
        ServiceModule.emit("failed_request", { err, errCount, ServiceModule, fn });
        cb(err);
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
