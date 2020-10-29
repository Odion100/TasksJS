# TasksJS

TasksJS is an end-to-end framework for developing microservices software systems in NodeJS. It's a wrapper on top of ExpressJS and Socket.io. Use TasksJS to create objects with methods on a server application, and to load and use those same objects in a client application. 

TasksJS comes with several objects that are used to facilitate web application development: 
```
const { 
    App,
    HttpClient,
    LoadBalancer,
    Client,
    Service,
    ServerManager,
 } = require("sht-tasks");
```

Call ` require("sht-tasks") `and deconcatonate from the object it returns. The main  abstractions used for client-server communication are the following:

- ***Service*** - Used to register an object with methods on a server application that can be loaded and used on a client application. 
- ***Client*** - Used in a client application to load a *Service*, which contains all the objects registered by the *Service*.
- ***App*** - Provides a modular interface and lifecycle methods for asynchronously creating and loading *Services*. 

---

# Quick Start
## Service.ServerModule(name, constructor || object, [options])

Use ***Service.ServerModule(name, constructor || object, [options])*** function to register an object on the server that can be loaded and used on the client. Follow the example below. 

```
const { Service } = require("sht-tasks");

Service.ServerModule("Users", function(){
   const Users = this;
   
   Users.add = function (data, cb){
      console.log(data);
      cb(null, { message:"You have successfully called the Users.add method" });
   }
})
```
In the code above we created a *ServerModule* by passing the string "Users" and a constructor function as the first two arguments of the ***Service.ServerModule(name, constructor || object, [options])*** method. In the constructor function the ` this ` value is assigned to a variable which is also named Users. Every method added to the ` this ` value will be accessible from a client application running TasksJS. Notice that the method we created (Users.add) is expecting some data and a callback function as its first and second parameters. Use the first argument of the callback function to send an error and the second argument to send a success response.

The  ***Service.ServerModule(name, constructor || object, [options])*** function can take an object instead of a constructor function as it's second argument. See below. We've added another *ServerModule* with the name "Orders" and an object as it's constructor.

```
const { Service } = require("sht-tasks");

Service.ServerModule("Users", function(){
   const Users = this;
   
   Users.add = function (data, cb){
      console.log(data);
      cb(null, { message:"You have successfully called the Users.add method" });
   }
})

Service.ServerModule("Orders", { 
     search: function (data, cb){
        console.log(data);
        cb(null, { message:"You have successfully called the Orders.search method" });
     }
})
```

## Service.startService(options)

Before we can access the objects registered by this *Service* and use their methods from a client application, we need to call the ***Service.startService( options)*** function. This will start an **ExpressJS** Server and a **Socket.io** WebSocket Server, and set up routing for the application. In the example below we added the ***Service.startService(options)*** function near the top, but the placement does not matter. 

```
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
   }
})

Service.ServerModule("Orders", { 
   search: function (data, cb){
      console.log(data);
      cb(null, { message:"You have successfully called the Orders.search method" });
   }
})
```
Now lets see how these objects can be accessed from a client application.

## Client.loadService(url, [options])

The ***Client.loadService(url, [options])*** function can be used to load a *Service*. The function requires the url (string) of the *Service* you want to load as its first argument, and will return a promise that will resolve into an object containing all modules registered by that service. See below. ***NOTE:*** You must be within an async function in order to use the await keyword when returning a promise.
```
   const { Client } = require("sht-tasks");
   
   const { Users, Orders} = await Client.loadService("http://localhost:4400/test/service");
   
   console.log(Users, Orders);
   
```
Now that we've loaded the *Service* that we created in the previous example, and have a handle on the *Users* and *Orders* modules registered by the *Service*, we can now call the methods we created on those objects. In the example below we demonstrate that the methods we created can optionally take a callback as its second argument or, if a callback is not used, it will return a promise. In the *Users.add(data, cb)* method we used a callback, but with the *Orders.search(data, cb)* method we left out the callback and used the await keyword.

```
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

```
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
```
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
