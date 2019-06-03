# TasksJS
Framework for microservice software systems

# Overview

TasksJS is a JavaScript framework designed for developing micro-service software systems in nodeJS. With TasksJS your system is comprised of blocks of code, called components and services that can be developed, deployed and maintained separately, yet which all work seamlessly together as a single software system. Services are your codes that run in the backend, while components are those parts of your system with which the user interfaces. 

TasksJS’ services and components have a module API which allows you to create a module (or object) that can easily be loaded and used in another module running elsewhere. This abstraction allows the developer to focus on simply creating objects that comprises the software system, rather than on how clients and services should communicate. 

# Quick Start
## First Create An App

```
const app = require(“sht-tasks”).app() 

```

---
## Then Initialize the Service

```
app.initService({
    route : "/orders",
    port  : 5000,
    host  : "localhost"
})
```
The ``` app.initService(options) ``` method is used to initialize a  new instance of a server that will handle client-to-server communications between services. Pass an object as the first parameter of this method with three required properties: route, port and host. These values will be used by others services to load and use the modules you create in this service. See the ```app.loadService(name, options)``` method. 

---
## Create a ServerModule (serverMod)
Software development in TasksJS simply comes down to  the creation of modules. Modules serve as containers for your code, while at the same time are used to construct objects whose methods and events can be accessed by others modules. Use the ``` app.severMod(name, constructorFn) ``` method to create a *ServerModule*.

```
app.serverMod("queue", function(){
     const queue = this;

     queue.addJob = function(data, cb){
        //do somthing then call the callBack function
        //use the first parameter of the cb function to respond with an error 
        //otherwise pass null as the first parameter and pass a success response as the second parameter

        cb(null, { message: "Job added successfully"})
     }
})
```

In the code above we created a *ServerModule* named queue and assigned the ``` this ``` object of its constructor function to a constant with the same name. The ``` this ``` object represents the module. Every method added to the ```this``` object can be called from others services. *ServerModules* can also emit web socket events that can be listened to from others services. Use the ```this.emit(eventName, data) ``` method to emit an event. 

```
app.serverMod("queue", function(){
    const queue = this;

	queue.addJob = function(data, cb){
		//do somthing then call the callBack function
		//use the first parameter of the cb function to respond with an error 
		//otherwise pass null as the first parameter and pass a success response as the second parameter

		cb(null, { message: "Job added successfully"})

		//Emit an event 
		queue.emit("new_job", {example: "this is a job"})
   }
})
```
          
---
## Loading and Using a Another Service
Create a new TasksJS service in another file following the same step we did above. 

```
const app = require(“sht-tasks”).app() 

app.initService({
  route : "/worker",
  port  : 5100,
  host  : "localhost"
})
```
Now let's load the service we previously created into this file using the ``` app.loadService(name, options) ``` method.

```
const app = require(“sht-tasks”).app() 

app.initService({
    route : "/worker",
    port  : 5100,
    host  : "localhost"
})

.loadService(“orders”, {
    route : "/orders",
    port  : 5000,
    host  : "localhost"
})
```

The first parameter of the ``` app.loadService(name, options) ``` method is a name that will be assigned to the service (object) once it has been loaded. The second parameter is an object with the properties route, port and host, identifying the service that is to be loaded.  

In this file, instead of creating another *ServerModule*,  let's create a simple *Module* named "worker" using the ``` app.module(name, constructorFn)``` method. Inside the module we can access the service we just loaded using the ``` this.useService(name) ``` method.

```
app.module("worker", function (){
	const orders = this.useService("orders");
})
```

Now that we have the orders service assigned to a constant called orders, we can easily access any *ServerModule* we've created in that service. We can call any method created on the *ServerModule*, and listen for events emitted from it. 

```
app.module("worker", function (){
    const orders = this.useService("orders");

    orders.queue.addJob({
         title : “wash dishes",
         due_date : Date()
    }, function (err, results ){
         if(err){
               console.log(err);
         }else{
               console.log(results);
         }
    })

    orders.queue.on("new_job", function (event){
        console.log(event.data)
    }) 
})
```

This is how client-to-sever communication is handled in TasksJS. No need to write http requests or websocket events manually. Just create objects that can easily load and use other objects in your software system. 

---
## TasksJS app API

- ``` app.initService(options) ```:
- ``` app.loadService(name, options) ```:
- ``` app.loadComponent(name, options) ```:
- ``` app.onLoad(handlerFn) ```:
- ``` app.config(configFn) ```:
- ``` app.module(name, constructorFn) ```:
- ``` app.severMod(name, constructorFn) ```: (services)
- ``` app.scope(name, constructorFn) ```: (components)

---
## TasksJS module API
There are three different kinds of modules in TasksJS: 

- **Modules:** Modules are simply containers for code that can be used by other modules within the same component or service. 
- **ServerModules:** ServerModules are modules that can be used by modules in others services and components. 
- **ScopeModules:** ScopeModules applies the module object as a scope to a custom HTML tag, and can be loaded and used by modules in other components. 

All modules have the following API:

- ``` this.useModule(name) ```:
- ``` this.useService(name) ```:
- ``` this.useComponent(name) ```: (components only)
- ``` this.useScope(name) ```: (components only)
- ``` this.useConfig(name) ```:
- ``` this.emit(name) ```: (ServerModules only)
