## TasksJS

*Note:* TasksJS and this readem file are currently undergoing renovations

TasksJS is a framework for creating object-oriented web APIs. 
Instead of creating several endpoints for handling client-server communication, as you do with Express, with TasksJS you create objects on the server that can be loaded and used on the client.  Simple as that!

TasksJS comes with several abstractions to facilitate web app development: 

```
const { 
    App,
    Client,
    LoadBalancer,
    ServerModule,
    Service,
 } = require("TasksJS")();
```
Notice that ` require("TasksJS") ` exports a factory function. You then call that function to return a ***TasksJS*** instance which consists of several objects and functions. The main  abstractions used for client-server communication are the following:

- ***ServerModule*** - Used to create objects on the server that can be loaded and used on the client. 
- ***Service*** - Used on the client to load a *Service* object from the server consisting of one or more *ServerModule*.
- ***App*** - Provides a modular interface and lifecycle for loading services, asynchronous configurations and module initialization. 

---

# Quick Start
#### ServerModule(name, constructor, [options])

With the TasksJS ***ServerModule(name, constructor, [options])*** function you can create objects on the server that can be loaded and used on the client. Here's an example of a *ServerModule* in action.

```
const { ServerModule } =  require("TasksJS")();

ServerModule.startService({ route, port, host });

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
The  ***ServerModule(name, constructor, [options])*** function can take an object instead of a constructor function as the second parameter. See below:

```
ServerModule("queue", { 
     addJob: function (data, cb){
        cb(null, { message: "Job added successfully"});
        this.emit("new_job", {message: "This is a job"});
     }
})

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
