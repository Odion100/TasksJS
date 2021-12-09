# TasksJS

TasksJS is an end-to-end framework for developing modular software systems in NodeJS and was designed with microservices architecture in mind. It's a wrapper on top of ExpressJS and Socket.io. With TasksJS instead of creating a server with many endpoints, you can create or have existing objects on a server that can be accessed on a client application. Basically any objects added to a TasksJS Service can be loaded and used by a TasksJS Client. 

TasksJS comes with the following objects that are used to for web application development: 
```javascript
const { 
    App,
    Service,
    Client,
    LoadBalancer,
    HttpClient,
 } = require("sht-tasks");
```

Call ```require("sht-tasks")``` and deconcatonate from the object it returns. The main  abstractions used for client-server communication are the following:

- ***Service*** - Used to create or pass an object that can be loaded and used on a client application. 
- ***Client*** - Used in a client application to load a *Service*, which contains all the objects added to the *Service*.
- ***App*** - Provides a modular interface and lifecycle methods for asynchronously creating and loading *Services*. 

---

# Quick Start

## Service.ServerModule(name, constructor/object)
Use the ```Service.ServerModule(name, constructor/object)``` method to add an object to a *TasksKJS Service*. This allows you to load an instance of that object on a client, and call any methods on that object remotely.

```javascript
const { Service } = require("sht-tasks");

const Users = {};

Users.add = function (data, cb){
    console.log(data);
    cb(null, { message:"You have successfully called the Users.add method" });
}

Service.ServerModule("Users", Users)
```
In the code above we created an object ```Users``` and gave it the add method. The ```Service.ServerModule(name, constructor/object)``` function takes the name assigned to the object as the first argument and the object itself as the second argument. 

Alternatively, you can use a constructor function instead of an object as the second argument. See in the example below. 
```javascript
const { Service } = require("sht-tasks");

const Users = {};

Users.add = function (data, cb){
    console.log(data);
    cb(null, { message:"You have successfully called the Users.add method" });
}

Service.ServerModule("Users", Users)

Service.ServerModule("Orders", function(){
   const Orders = this;
   
   Orders.find = function (start_date, end_date, cb){
      console.log(data);
      cb(null, { message:"You have successfully called the Users.add method" });
   }
})
```
In the *ServerModule* constructor function above the ` this ` value is the initial instance of the *ServerModule* object. Every method added to the ` this ` value will be accessible when the object is loaded by a *TasksJS Client*. Notice that the method we created ```Orders.find(start_date, end_date, cb)``` is expecting  3 parameters including a callback function as its last argument. By defualt all *ServerModule* methods will recieve a callback function as its last argument. Use the first argument of the callback function to respond with an error, and the second argument to send a success response. Note: *ServerModules* can be configured to use synchronous return values instead of asynchronoud callbacks.

## Service.startService(options)

Before we can access the objects registered by this *Service* from a client application, we need to call the ***Service.startService( options)*** function. This will start an **ExpressJS** Server and a **Socket.io** WebSocket Server, and set up routing for the *Service*. In the example below we added the ```Service.startService(options)``` function near the bottom, but the placement does not matter. 

```javascript
const { Service } = require("sht-tasks");

const Users = {};

Users.add = function (data, cb){
    console.log(data);
    cb(null, { message:"You have successfully called the Users.add method" });
}

Service.ServerModule("Users", Users)

Service.ServerModule("Orders", function(){
   const Orders = this;
   
   Orders.find = function (start_date, end_date, cb){
      console.log(data);
      cb(null, { message:"You have successfully called the Users.add method" });
   }
})

Service.startService({ route:"test/service", port: "4400", host:"localhost" })

```
Now lets see how these objects can be accessed from a client application.

## Client.loadService(url, [options])

The ***Client.loadService(url, [options])*** function can be used to load a *Service*. The function requires the url (string) of the *Service* you want to load as its first argument, and will return a promise that will resolve into an object containing all modules registered by that service. See below. ***NOTE:*** You must be within an async function in order to use the await keyword when returning a promise.
```javascript
   const { Client } = require("sht-tasks");
   
   const { Users, Orders} = await Client.loadService("http://localhost:4400/test/service");
   
   console.log(Users, Orders);
   
```
Now that we've loaded the *Service* that we created in the previous example, and have a handle on the *Users* and *Orders* modules registered by the *Service*, we can now call the methods we created on those objects. In the example below we demonstrate that the methods we created can optionally take a callback as its second argument or, if a callback is not used, it will return a promise. In the *Users.add(data, cb)* method we used a callback, but with the *Orders.search(data, cb)* method we left out the callback and used the await keyword.

```javascript
   const { Client } = require("sht-tasks");
   
   const { Users, Orders} = await Client.loadService("http://localhost:4400/test/service");
   
   console.log(Users, Orders);;
   
   Users.add({message:"User.add Test"}, function(err, results){
        if(err) console.log(err)
        else console.log(results)
   })
   
   const response = await Orders.search({ message: "Orders.search test" });
   console.log(response)
```
We can also receive events emitted from the modules we've loaded using the ***Client.loadService(url, [options])*** function. In the example below we're using the  *Users.on(event_name, cb)* method to listen for events coming from the *Service*.

```javascript
   const { Client } = require("sht-tasks");
   
   const { Users, Orders} = await Client.loadService("http://localhost:4400/test/service");
   
   console.log(Users, Orders);
   
   Users.add({message:"User.add Test"}, function(err, results){
        if(err) console.log(err)
        else console.log(results)
   })
   
   Users.on("new_user", function(event){
        console.log(event);
   })
   
   const response = await Orders.search({ message: "Orders.search test" });
   console.log(response)
```
Now all we have to do is go to our server application and use the *Users.emit(event_name, data)* method to emit a websocket event that can be received by client applications. Below, notice that we've added ```Users.emit("new_user", { message:"new_user event test" });``` at the end of the *Users.add* method, so the *new_user* event will be emitted every time the this method is called.
```javascript
const { Service } = require("sht-tasks");

Service.startService({
    route:"test/service",
    port: "4400",
    host:"localhost"
})

Service.ServerModule("Users", function(){
   const Users = this;
   
   Users.add = function (data, cb){
      console.log(data);
      cb(null, { message:"You have successfully called the Users.add method" });
      Users.emit("new_user", { message:"new_user event test" });
   }
})

Service.ServerModule("Orders", { 
   search: function (data, cb){
      console.log(data);
      cb(null, { message:"You have successfully called the Orders.search method" });
   }
})
```
