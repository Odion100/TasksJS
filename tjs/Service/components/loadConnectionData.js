const Client = require("../../HttpClient/HttpClient");

module.exports = function loadConnectionData(url, { limit = 10, wait = 150 } = {}) {
  const errors = [];

  return new Promise(function getData(resolve, reject) {
    Client.request({ method: "GET", url })
      .then(connectionData => resolve(connectionData))
      .catch(err => {
        errors.push(err);
        if (errors.length < limit) setTimeout(() => getData(resolve, reject), errors.length * wait);
        else reject({ attempts: errors.length, errors });
      });
  });
};
