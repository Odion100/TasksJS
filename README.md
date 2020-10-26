## TasksJS

TasksJS is an end-to-end framework for developing microservices software systems in NodeJS. It's a wrapper on top of ExpressJS and Socket.io. Use TasksJS to create objects with methods on a server application, and to load and use those objects in a client applications. 

TasksJS comes with several objects that can be used to facilitating web application development: 
```
const { 
    App,
    HttpClient,
    LoadBalancer,
    Client,
    Service,
    ServerManager,
 } = require("TasksJS")();
```

Notice that ` require("TasksJS") ` exports a factory function. Call that function and deconcatonate from the object it returns. The main  abstractions used for client-server communication are the following:


- ***Service*** - Used to register objects with methods on a server application that can be loaded and used on a client application. 
- ***Cllient*** - Used in the client application to load a *Service* which contains all the objects registered by the *Service*.
- ***App*** - Provides a modular interface and lifecycle methods for asynchronously creating and loading *Services*. 

---

# Quick Start
## Service.ServerModule(name, constructor || object, [options])

Use ***Service.ServerModule(name, constructor || object, [options])*** function to register an object on the server that can be loaded and used on the client. See the following example.

```
const { Service } = require("TasksJS")();

Service.ServerModule("Users", function(){
   const Users = this;
   
   Users.add = function (data, cb){
      console.log(data);
      cb(null, { message:"You have successfully called the Users.add method" });
   }

})

```
In the code above we created a *ServerModule* passing the name "Users" and a constructor function as the first two arguments. In the constructor function the ` this ` value is assigned to a variable which is also named Users. Every method added to the ` this ` value will be accessible from a client application running TasksJS.

The  ***ServerModule(name, constructor, [options])*** function can also take an object instead of a constructor function as it's second argument. See below:

```
const { Service } = require("TasksJS")();

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

Before we can access the objects registered by this *Service* and use their methods from a client applicaiton, we need to call the ***Service.startService( options)*** function. In the example below we added the ***Service.startService(options)*** function near the top, but the placement does not matter. 

```
const { Service } = require("TasksJS")();

Service.StartService({
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
The ***Service.startService(name, options)*** function starts an **ExpressJS** Server and **Socket.io** WebSocket Server under the hood, and sets up routing for the applicaiton. Now lets see how these objects can be accessed from a client application.


## Client.loadService(url)

The ***Client.loadService(url)*** function can be used to load objects registered by a remote service. 

First, we destructure the ***SeverModule*** function from the ***TasksJS*** instance. We then use the ***ServerModule.startService(options)*** function to initialize an Express and SocketIO server that will handle routing and mapping HTTP request and WebSocket events to each ServerModule instance created. Keep in mind that the ***ServerModule.startService*** function  must be called before any modules are created.

```

ServerModule("queue", function(){
     const queue = this;
     
     queue.addJob = function(data, cb){
          //do somthing then call the callBack function 
         //use the first parameter of the cb function to respond with an error 
         //use the second parameter of the cb function to send a success response
        cb(null, { message: "Job added successfully"}) 
     }
})

```

In the code above we created a ***ServerModule*** named queue and assigned the ` this ` object of its constructor function to a constant with the same name. The ` this ` object represents the module. Every method added to the ` this ` object can be called from other services across the web. 

ServerModules can also emit web socket events that can be listened to by other services. Use the ***this.emit(name, data)*** method to emit an event from the ***ServerModule***.

```
ServerModule("queue", function(){
     const queue = this;
     
     queue.addJob = (data, cb)=>{
         //do somthing then call the callBack function 
         //use the first parameter of the cb function to respond with an error 
         //use the second parameter of the cb function to send a success response
        cb(null, { message: "Job added successfully"});
        queue.emit("new_job", {message: "This is a job"});
     }
})

```


```
#### Service(url, [options])

With the TasksJS ***Service(url, [options])*** function on the client-side, you can load and call methods on objects that were created on the server-side using the ***ServerModule*** function. 

```
const { Service } = require("TasksJS");

```
The TasksJS ***Service***  function that requires the ***url*** (string) location of the service you want to load as its first parameter, and which will return an object promise that will eventually resolve into an object that is a replica of the backend Service created using the ***ServerModule*** function.

```
const myService = await Service(url)
 
const results = await myService.myModule.testMethod({ id: 52});

```

Following the example above, the object that was returned has a property called ```queue``` that is a replica of the module created using the ***ServerModule(name, constructor. [options])*** function.

### App()

The TasksJS ***App*** function returns an **app** object that provides an interface and lifecycle for loading and creating modules.
