# TasksJS API Documentation

<details open>
   <summary><b><a href="https://github.com/Odion100/TasksJS/edit/tasksjs2.0/API.md#app">App</a></b></summary>
    
- [**.startService(options)**](https://github.com/Odion100/TasksJS/edit/tasksjs2.0/API.md#appstartserviceoptions) 
- [**.loadService(url)**](https://github.com/Odion100/TasksJS/edit/tasksjs2.0/API.md#apploadserviceurl) 
- [**.onLoad(callback)**](https://github.com/Odion100/TasksJS/edit/tasksjs2.0/API.md#apponloadcallback) 
- [**.ServerModule(name, constructor [,reserved_methods])**]() 
- [**.Module(name, constructor)**](https://github.com/Odion100/TasksJS/edit/tasksjs2.0/API.md#appmodulename-constructor) 
- [**.config(constructor)**](https://github.com/Odion100/TasksJS/edit/tasksjs2.0/API.md#appconfigconstructor) 
- [**.on(event, callback)**]() 
- [**.emit(event, payload)**]()

</details>

<details open>
   <summary><b><a href="https://github.com/Odion100/TasksJS/edit/tasksjs2.0/API.md#client">Client</a></b></summary>
    
- [**.loadService(url)**]() 

</details>

<details open>
   <summary><b><a href="https://github.com/Odion100/TasksJS/edit/tasksjs2.0/API.md">ClientModule</a></b></summary>
    
- [**[method]([,args...] [,callback])**]() 
- [**.on(name, constructor [,options])**]() 
- [**.emit()**]()  

</details>

<details open>
   <summary><b><a href="https://github.com/Odion100/TasksJS/edit/tasksjs2.0/API.md">ServerModule</a></b></summary>
    
- [**[method]([,args...] [,callback])**]() 
- [**.on(name, constructor [,options])**]() 
- [**.emit()**]()  

</details>

<details open>
   <summary><b><a href="https://github.com/Odion100/TasksJS/edit/tasksjs2.0/API.md#service">Service</a></b></summary>
    
- [**.startService(options)**]() 
- [**.ServerModule(name, constructor [,options])**]() 
- [**.Server()**]() 
- [**.WebSocket()**]() 

</details>

---

## Client


##
Client.loadService(url)
---

## App


## App.startService(options)


## App.loadService(url)


## App.onLoad(callback)


## App.ServerModule(name, constructor [,reserved_methods])

## App.Module(name, constructor)

## App.config(constructor)




---

## Service
Service is a TasksJS abstraction used to server objects that can be loaded by a TasksJS Client using the `Client.loadService(url)` method.

Call require("sht-tasks") and de-concatenate from the object it returns.

```javascript
const { Service } = require("sht-tasks");
```
The Service object has the following methods:

- ***Service.ServerModule(name, constructor [,reserved_methods])*** - Used to create or pass an object that is hosted by the Service. 
- ***Service.startService(options)*** - Used
- ***Service.Server()*** - Returns the expressJS app instance used to handle routing to the *Services*. 
- ***Service.WebSocket()*** - Returns socket.io WebSocket instance used to emit events from the *Services*. 

## Service.ServerModule(name, constructor [,reserved_methods])
- **Name** - String - 
Use the ```Service.ServerModule(name, constructor, [,options])``` method to register an object to be hosted by a *TasksJS Service*. This will allows you to load an instance of that object onto a client application, and call any methods on that object remotely.

```javascript
const { Service } = require("sht-tasks");

const Users = {};

Users.add = function (data, callback){
    console.log(data);
    callback(null, { message:"You have successfully called the Users.add method" });
}

Service.S

---
