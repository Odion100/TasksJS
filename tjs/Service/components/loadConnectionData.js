const Client = require("../../HttpClient/HttpClient");

module.exports = function loadConnectionData(url, { limit = 10, wait = 150 } = {}) {
  const errors = [];

  return new Promise(function getData(resolve) {
    Client.request({ method: "GET", url })
      .then(connectionData => resolve(connectionData))
      .catch(err => {
        errors.push(err);
        if (errors.length < limit) setTimeout(() => getData(resolve), errors.length * wait);
        else throw `TasksJS loadConnectionData() Error: url:${url}, attempts:${errors.length}`;
      });
  });
};
