//The purpose of the client factory is to have just one abstraction for sending request
//that will be used by all other modules. Even if I decide to change what module i use
//to actually send the request, the abstraction remains the same
const { Client, loadConnectionData, Service, connectWebSocket } = require("../Service/components");

module.exports = function TasksJSClient() {
  const client = this;
  Client.apply(client);

  client.loadService = async url => {};
  return Client;
};
