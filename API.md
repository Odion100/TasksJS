   **IN WORKING PROGRESS**

# TasksJS API Documentation

Welcome to the docs! Following is a list of the objects used and created when developing web APIs with TasksJS. TasksJS is an end-to-end framework for developing modular, microservices software systems in NodeJS. Check out [**Quick Start**](https://github.com/Odion100/TasksJS#quick-start) for an example of how simple it is to develope object-orientated APIs with TasksJS. 

<details>
   <summary><b><a href="https://github.com/Odion100/TasksJS/blob/tasksjs2.0/API.md#app">App</a></b></summary>
    
- [**startService(options)**](https://github.com/Odion100/TasksJS/blob/tasksjs2.0/API.md#appstartserviceoptions) 
- [**loadService(name, url)**](https://github.com/Odion100/TasksJS/blob/tasksjs2.0/API.md#apploadserviceurl) 
- [**onLoad(callback)**](https://github.com/Odion100/TasksJS/tasksjs2.0/API.md#apponloadcallback) 
- [**ServerModule(name, constructor [,reserved_methods])**]() 
- [**Module(name, constructor)**](https://github.com/Odion100/TasksJS/tasksjs2.0/API.md#appmodulename-constructor) 
- [**config(constructor)**](https://github.com/Odion100/TasksJS/tasksjs2.0/API.md#appconfigconstructor) 
- [**on(event, callback)**]() 
- [**emit(event, payload)**]()

</details>

<details>
   <summary><b><a href="https://github.com/Odion100/TasksJS/tasksjs2.0/API.md#client">Client</a></b></summary>
    
- [**loadService(url)**]() 

</details>

<details>
   <summary><b><a href="https://github.com/Odion100/TasksJS/tasksjs2.0/API.md#service">Service</a></b></summary>
    
- [**startService(options)**]() 
- [**ServerModule(name, constructor [,options])**]() 
- [**Server()**]() 
- [**WebSocket()**]() 

</details>

<details>
   <summary><b><a href="https://github.com/Odion100/TasksJS/tasksjs2.0/API.md#service">LoadBalancer</a></b></summary>
    
- [**startService(options)**]() 
- [**ServerModule(name, constructor [,options])**]() 
- [**Server()**]() 
- [**WebSocket()**]() 
- [**clones**]()
  - [**register(options)**]()  
  - [**dispatch(event)**]()
  - [**assignDispatch(event)**]()

</details>

---

<details>
   <summary><b><a href="https://github.com/Odion100/TasksJS/tasksjs2.0/API.md">ClientModule</a></b></summary>
    
- [**[created_method]([args...] [,callback])**]() 
- [**on(name, constructor [,options])**]() 
- [**emit()**]()  

</details>

<details>
   <summary><b><a href="https://github.com/Odion100/TasksJS/tasksjs2.0/API.md">ServerModule</a></b></summary>
    
- [**[created_method]([args...] [,callback])**]() 
- [**on(name, constructor [,options])**]() 
- [**emit()**]()  

</details>

---

## App 
  **App** combinds the both functionalites of TasksJS Service and Client into one object, while also providing a module interface and lifecycle events. Access the App instance by deconcatanating from the object return when loading TasksJS `require("sht-tasks")`.
  
  ```javascript
const { App } = require("sht-tasks");
```
  
## App.ServerModule(name, constructor [,reserved_methods])
Use **App.ServerModule(name, constructor)** function to create or pass an object that can be loaded by a TasksJS Client. 
 - ***name*** (string) - name assigned to the module or object
 - ***constructor*** (object/function) - 


## App.startService(options)


## App.loadService(name, url)


## App.onLoad(callback)


## App.Module(name, constructor)

## App.config(constructor)


---

## Client


## Client.loadService(url)

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
````

Service.startService

---
