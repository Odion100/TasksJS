const httpClient = require("request");
const json = true;

module.exports = function TasksJSClient() {
  const Client = this;
  Client.request = ({ method, url, body }, cb) => {
    const request = cb => {
      httpClient({ method, url, body, json }, (err, res, body) => {
        if (err) cb(err);
        else if (res.statusCode >= 400) cb(body);
        else cb(null, body, res);
      });
    };
    if (typeof cb === "function") request(cb);
    else
      return new Promise((resolve, reject) =>
        request((err, data) => {
          if (err) reject(err);
          else resolve(data);
        })
      );
  };

  Client.upload = ({ url, formData }, cb) => {
    const upload = cb => {
      httpClient.post({ url, formData, json }, (err, res, body) => {
        if (err) cb(err);
        else if (res.statusCode >= 400) cb(body);
        else cb(null, body, res);
      });
    };
    if (typeof cb === "function") upload(cb);
    else
      return new Promise((resolve, reject) =>
        upload((err, data) => {
          if (err) reject(err);
          else resolve(data);
        })
      );
  };

  return Client;
};
