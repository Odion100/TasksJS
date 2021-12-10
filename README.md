# TasksJS

TasksJS is an end-to-end framework for developing modular software systems in NodeJS and is designed with microservices architecture in mind. It's a wrapper on top of ExpressJS and Socket.io. With TasksJS instead of creating a server with many endpoints, you can create or have existing objects on a server that can be accessed from a client application. Basically any objects added to a TasksJS Service can be loaded and used by a TasksJS Client. 

TasksJS comes with the following objects that are used for web application development: 
```javascript
const { 
    App,
    Service,
    Client,
    LoadBalancer,
    HttpClient,
 } = require("sht-tasks");
```

Call ```require("sht-tasks")``` and deconcatonate from the object it returns. The main  abstractions used for client-to-server interactions are the following:

- ***Service*** - Used to create and host objects that can be loaded and used by a TasksJS Client. 
- ***Client*** - Used in a client application to load a *Service*, which contains all the objects added to the *Service*.
- ***App*** - Provides a modular interface and lifecycle methods for asynchronously creating and loading *Services*. 

---

# Quick Start

## Service.ServerModule(name, constructor/object, [options])
Use the ```Service.ServerModule(name, constructor/object)``` method to register an object to be hosted by a *TasksJS Service*. This will allows you to load an instance of that object onto a client application, and call any methods on that object remotely.

```javascript
const { Service } = require("sht-tasks");

const Users = {};

Users.add = function (data, callback){
    console.log(data);
    callback(null, { message:"You have successfully called the Users.add method" });
}

Service.ServerModule("Users", Users)
```
In the code above we assigned an object to the variable ```Users``` and gave it an add method. The ```Service.ServerModule(name, constructor/object)``` function takes the name assigned to the object as the first argument and the object itself as the second argument. 

Alternatively, you can use a constructor function instead of an object as the second argument. In the example below we create another *ServerModule* called 
"Orders". 
```javascript
const { Service } = require("sht-tasks");

const Users = {};

Users.add = function (data, callback){
    console.log(data);
    callback(null, { message:"You have successfully called the Users.add method" });
}

Service.ServerModule("Users", Users)

Service.ServerModule("Orders", function(){
   const Orders = this;
   
   Orders.find = function (arg1, arg2, callback){
      console.log(data);
      callback(null, { message:"You have successfully called the Users.add method" });
   }
})
```
In the *ServerModule* constructor function above, the `this` value is the initial instance of the *ServerModule* object. Every method added to the ` this ` value will be accessible when the object is loaded by a *TasksJS Client*. Notice that the method we created, ```Orders.find = function(arg1, arg2, callback)...```, has  3 parameters including a callback function as the last argument. By defualt all *ServerModule* methods will recieve a callback function as its last argument. Use the first parameter of the callback function to respond with an error, and the second parameter to send a success response. Note: *ServerModule* methods can be configured to work with synchronous return values instead of asynchronous callbacks.

## Service.startService(options)

Before we can access the objects hosted by this *Service* from a client application, we need to call the ```Service.startService(options)``` function. This will start an **ExpressJS** Server and a **Socket.io** WebSocket Server, and set up routing for the *Service*. In the example below we added the ```Service.startService(options)``` function at the bottom, but the order does not matter. 

```javascript
const { Service } = require("sht-tasks");

const Users = {};

Users.add = function (data, callback){
    console.log(data);
    callback(null, { message:"You have successfully called the Users.add method" });
}

Service.ServerModule("Users", Users)

Service.ServerModule("Orders", function(){
   const Orders = this;
   
   Orders.find = function (start_date, end_date, callback){
      console.log(data);
      callback(null, { message:"You have successfully called the Users.add method" });
   }
})

Service.startService({ route:"test/service", port: "4400", host:"localhost" })
```
Now lets see how these objects can be loaded into a client application.

## Client.loadService(url, [options])

The ```Client.loadService(url)``` function can be used to load a TasksJS *Service*. This method requires the url (string) of the *Service* you want to load as the first argument, and will return a promise that will resolve into an object that containing all the modules hosted by that service. See below. **NOTE: You must be within an async function in order to use the ```await``` keyword when returning a promise.**
```javascript
   const { Client } = require("sht-tasks");
   
   const { Users, Orders } = await Client.loadService("http://localhost:4400/test/service");
   
   console.log(Users, Orders);
```
Now that we've loaded the *Service* that we created in the previous example, and have a handle on the *Users* and *Orders* objects hosted by the *Service*, we can now call any method on those objects. In the example below, we demonstrate that the methods on the ServerModule objects can optionally take a callback as the last argument or, if a callback is not used, it will return a promise. With the ```Users.add(data, callback)``` method we used a callback, but with the ```Orders.find(data, callback)``` method we left out the callback function and used the ```await``` keyword to return a promise.

```javascript
   const { Client } = require("sht-tasks");
   
   const { Users, Orders } = await Client.loadService("http://localhost:4400/test/service");
   
   console.log(Users, Orders);;
   
   Users.add({ message:"User.add Test" }, function(err, results){
        if(err) console.log(err)
        else console.log(results)
   })
   
   const response = await Orders.find("hello", "world");
   
   console.log(response) 
```
## Sending and Receiving Websocket Events
We can also receive WebSocket events emitted from the remote objects we've loaded using the ```Client.loadService(url)``` function. In the example below we're using the  ```Users.on(event_name, callback)``` method to listen for events coming from the "Users" *ServerModule*.

```javascript
   const { Client } = require("sht-tasks");
   
   const { Users, Orders } = await Client.loadService("http://localhost:4400/test/service");
   
   console.log(Users, Orders);
   
   Users.add({ message:"User.add Test" }, function(err, results){
        if(err) console.log(err)
        else console.log(results)
   })
   
   Users.on("new_user", function(event){
        console.log(event);
   })
   
   const response = await Orders.find({ message: "Orders.find test" });
   
   console.log(response)
```
Now let's go to our server application and call the ```Users.emit(event_name, data)``` method to emit a websocket event that can be received by its corresponding Clients. Below, notice that we've added ```Users.emit("new_user", { message:"new_user event test" })``` at the end of the ```Users.add``` method, so the ```new_user``` event will be emitted every time this method is called.
```javascript
const { Service } = require("sht-tasks");

const Users = {};

Users.add = function (data, callback){
    console.log(data);
    callback(null, { message:"You have successfully called the Users.add method" });
    Users.emit("new_user", { message:"new_user event test" });
}

Service.ServerModule("Users", Users)

Service.ServerModule("Orders", function(){
   const Orders = this;
   
   Orders.find = function (start_date, end_date, callback){
      console.log(data);
      callback(null, { message:"You have successfully called the Users.add method" });
   }
})

Service.startService({ route:"test/service", port: "4400", host:"localhost" })
```
