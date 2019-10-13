<<<<<<< HEAD
# TasksJS Overview
***Microservices*** - TasksJS is a JavaScript framework designed for developing micro-service software systems in nodeJS. It's an abstraction on top of expressJS, and Socket.io, allowing developers to simply create objects/modules whose methods and events can be accessed by other TasksJS modules across the web. You provide one static route and the app will handle routing the requests to your modules under the hood. This makes communication between numerous services a breeze.

***Organization*** - TasksJS offers a convenient abstraction for developing distribututed systems. With TasksJS your system is comprised of blocks of code, called components and services. These components and services can be developed, deployed and maintained separately, yet  all are able to work seamlessly together as a single software system. Services handle all operations on the backend, while components are used on the frontend of an application. TasksJS’ services and components have a modular API which offers an object-orientated way to think about developing web APIs. TasksJS allows us to focus on creating objects that comprises the software system, rather than on how clients and services should communicate. 

***RESTable*** - Use REST only where it's necessary. TasksJS will take care of all the routing and handle requests between services under the hood. Yet It's built on top of express making it easy to add RESTful routing where needed. What's more, with some slight configurations TasksJS can interpet and create RESTful routes from your modules. 

# Quick Start
## First Create An App

```
const app = require(“sht-tasks”).app() 
=======
## TasksJS

*Note:* TasksJS and this readem file are currently undergoing renovations

TasksJS is a framework for creating object-oriented web APIs. 
Instead of creating several endpoints for handling client-server communication, as you do with Express, with TasksJS you create objects on the server that can be loaded and used on the client.  Simple as that!

TasksJS comes with several abstractions for facilitating web app development: 

```
const { 
    App,
    Client,
    LoadBalancer,
    ServerModule,
    Service,
 } = require("TasksJS")();
>>>>>>> 46a7a1da714fb23378cc09d8d36efb7265a1f8cf
```
Notice that ` require("TasksJS") ` exports a factory function. You then call that function to return a ***TasksJS*** instance which consists of several objects and functions. The main  abstractions used for client-server communication are the following:

<<<<<<< HEAD
---
## Then Initialize the Service

```
app.initService({
    route : "/orders",
    port  : 5000,
    host  : "localhost"
})
```
The ``` app.initService(options) ``` method is used to initialize a  new instance of an express server that will handle creating routes and mapping requests between services. Pass an object as the first parameter of this method with three required properties: route, port and host. These values will be used by others services to load and use the modules you create in this service. See the ```app.loadService(name, options)``` method. 

---
## Create a ServerModule (serverMod)
Software development in TasksJS simply comes down to  the creation of modules. Modules serve as containers for your code, while at the same time are used to construct objects whose methods and events can be accessed by others modules across the web. Use the ``` app.severMod(name, constructorFn) ``` method to create a *ServerModule*.
=======
- ***ServerModule*** - Used to create objects on the server that can be loaded and used on the client. 
- ***Service*** - Used on the client to load a *Service* object from the server consisting of one or more *ServerModule*.
- ***App*** - Provides a modular interface and lifecycle for loading *Services* asynchronously, app configurations and module/object initialization. 

---
>>>>>>> 46a7a1da714fb23378cc09d8d36efb7265a1f8cf

# Quick Start
#### ServerModule(name, constructor, [options])

With the TasksJS ***ServerModule(name, constructor, [options])*** function you can create objects on the server that can be loaded and used on the client. Here's an example of a *ServerModule* in action.

```
const { ServerModule } =  require("TasksJS")();

<<<<<<< HEAD
In the code above we created a *ServerModule* named queue and assigned the ```this``` object of its constructor function to a constant with the same name. The ```this``` object represents the module. Every method added to the ```this``` object can be called from others services across the web. *ServerModules* can also emit web socket events that can be listened to by others services. Use the ```this.emit(eventName, data)``` method to emit an event. 
=======
ServerModule.startService({ route, port, host });
>>>>>>> 46a7a1da714fb23378cc09d8d36efb7265a1f8cf

```

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
<<<<<<< HEAD
```
          
---
## Loading and Using Another Service
Create a new TasksJS service in another file following the same steps we did above. 
=======
>>>>>>> 46a7a1da714fb23378cc09d8d36efb7265a1f8cf

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
<<<<<<< HEAD

The first parameter of the ``` app.loadService(name, options) ``` method is a name that will be assigned to the service (object) once it has been loaded. The second parameter is an object with the properties route, port and host, identifying the endpoint of the service that is to be loaded.  

In this file, instead of creating another *ServerModule*,  let's create a simple *Module* named "worker" using the ``` app.module(name, constructorFn)``` method. Inside the module we can access the service we just loaded using the ``` this.useService(name) ``` method.

```
app.module("worker", function (){
     const orders = this.useService("orders");
=======
The  ***ServerModule(name, constructor, [options])*** function can take an object instead of a constructor function as the second parameter. See below:

```
ServerModule("queue", { 
     addJob: function (data, cb){
        cb(null, { message: "Job added successfully"});
        this.emit("new_job", {message: "This is a job"});
     }
>>>>>>> 46a7a1da714fb23378cc09d8d36efb7265a1f8cf
})

```
#### Service(url, [options])

With the TasksJS ***Service(url, [options])*** function on the client-side, you can load and call methods on objects that were created on the server-side using the ***ServerModule*** function. 

```
const { Service } = require("TasksJS");

```
The TasksJS ***Service***  function that requires the ***url*** (string) location of the service you want to load as its first parameter, and which will return an object promise that will eventually resolve into an object that is a replica of the backend Service created using the ***ServerModule*** function.

<<<<<<< HEAD
- ``` app.initService(options) ```:
- ``` app.loadService(name, options) ```:
- ``` app.loadComponent(name, options) ```:
- ``` app.onLoad(handlerFn) ```:
- ``` app.config(configFn) ```:
- ``` app.module(name, constructorFn) ```:
- ``` app.severMod(name, constructorFn) ```: (services only)
- ``` app.scope(name, constructorFn) ```: (components only)
- ``` app.server ``` (the expressJS app handling routing)
=======
```
const myService = await Service(url)
 
const results = await myService.myModule.testMethod({ id: 52});
>>>>>>> 46a7a1da714fb23378cc09d8d36efb7265a1f8cf

```

Following the example above, the object that was returned has a property called ```queue``` that is a replica of the module created using the ***ServerModule(name, constructor. [options])*** function.

### App()

The TasksJS ***App*** function returns an **app** object that provides an interface and lifecycle for loading and creating modules.
