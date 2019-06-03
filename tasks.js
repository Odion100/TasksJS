var multiTaskHandler = require('multitaskhandler')
var obj = require('obj-handler')

function tasks(){

    var io = require("socket.io-client");
    var tasks = {}, modules = {}, services = {}, _server, _host, _client = client(), mods = [], serverMods = [], initAsync = [], initSync = [], appName = '';
    
    tasks.loadService = loadService;
    tasks.module = addModule;            
    tasks.config = config;        
    tasks.serverMod = serverMod;
    tasks.client = _client;
    tasks.initService = initService;
    tasks.initComplete = registerHandler;
    tasks._maps = getMaps;    
    tasks.onLoad = onLoad;
    function getMaps(){
        return _server.maps()
    }

    function serverMod(serverModName, _modConstructor){            

        serverMods.push({            
            modConstructor:_modConstructor,
            dependencies:[],
            dependents:[], 
            service_dependencies:[],           
            name:serverModName,  
        })
        setInit()
                                                
        return tasks                                                               
    }

    function serverModFactory(mod){
        var thisMod = {}, config_all = {}, config_options = {}        

        thisMod._class = 'serverMod';
        thisMod._name = mod.name;            

        thisMod.config = config;
        thisMod.configAll = configAll;
        
        thisMod.useModule = useModule;       
        thisMod.useService = useService;

        function useService(serviceName){
            return passService(serviceName, mod);                      
        }

        function useModule(modToUse){                      
            return getMod(modToUse, mod);                        
        }

        function config(name, options){
            config_options[name] = options;
        }

        function configAll(options){
            config_all = options;
        }        
          
        var  _nsp = randomStr();
                
        var nsp = _server.io.of('/'+_nsp);
        
        thisMod.nsp = nsp;

        thisMod.emit = function(eventName, data){            
            nsp.emit('dispatch', {
                id:randomStr(10),
                name:eventName, 
                data:data,
                sent_by:appName+'.'+mod.name,
                sent_at:Date()
            });
        }

        mod.modConstructor.apply(thisMod, []);        
        //loop through all properties on serverMod
        obj(thisMod).forEach(function(value, pName){            
            if(['config', 'configAll', 'handle', 'emit', 'useModule', 'useService'].indexOf(pName) === -1 && typeof thisMod[pName] === 'function'){ 
                
                config_options[pName] = config_options[pName] || {};

                //loop through all config options on config_all object
                obj(config_all).forEach(function(opt){                    
                    //apply config_all options for each serverMod method where config_options have not already been set
                    config_options[pName][opt] = config_options[pName][opt] || config_all[opt];                    
                })               
                
                //all request to serverMod are PUTs by default
                config_options[pName].request_method = config_options[pName].request_method || 'PUT';
            }
        })                        
        
        _server.addRoute(mod.name, thisMod, config_options, _nsp);                             
    }

    function initModules(next) {
        
        for (var i = 0; i < mods.length; i++) {            
            modFactory(mods[i])
        }

        for (var i = 0; i < serverMods.length; i++) {            
            serverModFactory(serverMods[i]);
        }
        //by clearing these arrays more modules can be added after the original initialization
        initSync = [];
        initAsync = []; 
        is_set = false;
        next();
    }

    function getMod(modName, user){        
        //basically record the modName as a dependency
        if(user.dependencies.indexOf(modName) === -1){
            user.dependencies.push(modName);
        }
        //record the thisMode as a dependent of modName
        if(modules[modName].dependents.indexOf(user.name) === -1){
            modules[modName].dependents.push(user.name);
        }

        return modules[modName].mod;                
    }

    function passService(serviceName, user){
        //record dependencies;        
        if(user.service_dependencies.indexOf(serviceName) === -1){
            user.service_dependencies.push(serviceName);
        }
        if(services[serviceName].dependents.indexOf(user.name) === -1){
            services[serviceName].dependents.push(user.name);
        }

        return services[serviceName].service; 
    }

    function modFactory(mod){
        var thisMod = {}, events = {};     
        thisMod.useModule = useModule;        
        thisMod.useService = useService;        
        thisMod.emit = emit;
        thisMod.on = on;

        thisMod._instance = {};
        thisMod._instance.usedBy = 'app';
        thisMod._class = 'module';
        thisMod._name = mod.name;

        function useService(serviceName){
            return passService(serviceName, mod);                      
        }

        function useModule(modToUse){              
            return getMod(modToUse, mod);                        
        }        

        function emit(eventName, emitter, emitData){            
            if(events[eventName]){
                subs.forEach(function(sub){sub()})
            }                           
        }

        function on(eventName, handler){                                    
            events[eventName] = events[eventName] || {};            
                        
            events[eventName].subscribers = events[eventName].subscribers || [];
            events[eventName].subscribers.push(handler)                
        }

        mod.modConstructor.apply(thisMod, []);
        modules[mod.name].mod = thisMod;         
    }

    var is_set = false;
    //modules need to be initialized only after services have been loaded
    //so we're collect modules, services, and config init functions to be run in
    //a paricular sequence. this is handled by multiTaskHandler in inti function below
    function setInit(){
         //setTimeout will inti app after all modules are added to the modules array above            
        if(!is_set){
            //because js is "single threaded", this will only run at next avialable moment when all fns have executed
            is_set = true; 
            setTimeout(init, 1)
        }
        
    }
    function addModule(modName, modConstructor){    
        modules[modName] = {            
            modConstructor:modConstructor,
            dependencies:[],
            dependents:[],
            service_dependencies:[],
            name:modName,  
        }
  
        mods.push(modules[modName])    
        setInit()  
        return tasks 
    }      
    
    function loadService(name, option){   
        var uri = 'http://' + option.host +':'+ option.port + option.route 

         services[name] = {                                                                            
            dependents:[],
            name:name,
            uri:uri,
            connection_attemps:0,
            service:{}                            
        };  

        initAsync.unshift(new getService(uri, name).run);
        setInit();

        _serv = name;
        return tasks
    }    

    var _serv = undefined;
    function onLoad(handler){    
        services[_serv].onLoad = configHandler(handler).run;
        return tasks
    }

    function getService(url, name){
             
        return {//run will be called by the mth
            run:function(next){
                _client.request({
                    method:'GET',
                    url:url
                }, function(err, data){
                    if (err) {
                        services[name].connection_attemps++;
                        console.log(appName+' -- FAILED CONNECTION TO SERVICE: '+name +'---(after '+services[name].connection_attemps+' attempts)');                                
                        //console.log(err);
                        //user can check for the existance of connectionErr property inside modules to check if the service has loaded correctly
                        //so that the app can optionally be made to work even when some services fail                        
                        services[name].service.connectionErr = true;
                        services[name].service.err = err;

                        //try to establish connection up to ten times
                        if(services[name].connection_attemps < 10){                            
                            setTimeout(function(){                                
                                getService(url, name).run();                            
                            }, services[name].connection_attemps*1500);
                        }
                        
                    }else{                    
                        console.log(appName+' -- SUCCESSFUL CONNECTION TO SERVICE: '+name +'---(after '+services[name].connection_attemps+' attempts)');

                        services[name].service.connectionErr = false;
                        services[name].service.err = null;
                        createServiceAPI(services[name], data);  
                        
                        if(typeof services[name].onLoad === 'function'){
                            services[name].onLoad()
                        }                                          
                    }
                    if(typeof next === 'function'){next()}                    
                })
            }
        }
    }

    function createServiceAPI(serviceHolder, api){

        var service = serviceHolder.service, maps = api.maps;
        //each map in apis.maps describes a backend serverMod
        for (var i = 0; i < maps.length; i++) {
            //serverModRequestHandler creates replica of the backend serverMod api 
            //that will send a request to that serverMod's method
            service[maps[i].modName] = new serverModRequestHandler(maps[i], api.host, serviceHolder.name)             
        }        
    }

    function serverModRequestHandler(map, host, serviceName){
        //handles request to backend server mod

        //use maps (an array) to regenerate backend  api
        //a map contains info on how to call a backend serverMod and what methods it has
        var serverMod = {}, path = 'http://' + host + '/' + map.route.join('/'), method_names = map.methods;

        for (var i = 0; i < method_names.length; i++) {                
            serverMod[method_names[i]] = reqHandler(method_names[i] , map.config[method_names[i]].request_method).run
        }

        var  attempts = 0;
        function mapErrHandler(new_api, req, callBack, handler){  
        //continually attempt to make the request to a new service api                  
            attempts++;
            if(attempts >= 3){                
                throw "tasksJS ERROR: Invalid Map!!! FAILED TO CONNECT TO APP AFTER "+attempts+" ATTEMPTS!!!"
            }else{
                var new_maps = new_api.maps;

                //use new_maps to update the path for each serverMod of this service
                for (var i = 0; i < new_maps.length; i++) {
                    
                    var new_route = new_maps[i].route.join('/');                        
                    //loop throuhg each serverMod in the service and use _updatePath method to update the route to the serverMod
                    services[serviceName].service[new_maps[i].modName]._updatePath(new_route, new_api.host, new_maps[i].nsp);
                }

                if(typeof services[serviceName].onLoad === 'function'){
                    //run onLoad Handler first
                    services[serviceName].onLoad(function(){
                        //use this handle on reqHandler to resend the request
                        handler.run(req.data, function(err, data){
                            callBack(err, data);
                            attempts = 0;
                        })
                    })
                }else{
                    //use this handle on reqHandler to resend the request
                    handler.run(req.data, function(err, data){
                        callBack(err, data);
                        attempts = 0;
                    })
                } 
                                            
            }              
        }

         //paths used for single and multi file uploads
        var sfPath = 'http://' + host + '/sf/' + map.route.join('/');
        var mfPath = 'http://' + host + '/mf/' + map.route.join('/');

        function reqHandler(method_name, request_method){                                
            var handler =  {
                run:function(data, callBack){
                    //make sure data is empty object by default
                    function cb(err, data){
                        if (err) {
                            //console.log(err);
                            if (err.invalidMap) {
                                mapErrHandler(err, req, callBack, handler)                          
                            }else{
                                if(typeof callBack === 'function'){callBack(err)}                                
                            }                                                            
                        }else{                                
                            if(typeof callBack === 'function'){callBack(null, data)}                                                        
                        }
                    } 
                                           
                    data = (data === null || data === undefined)?{}:data;                        
                    var req = {
                        method:request_method,                            
                        data:data
                    }

                    if(data.file){
                        req.url = sfPath+'/'+method_name,                    
                        _client.upload(req, cb);
                    }else if(data.files){
                        req.url = mfPath+'/'+method_name,                    
                        _client.upload(req, cb);
                    }else{
                        req.url = path+'/'+method_name,
                        _client.request(req, cb);    
                    }                        
                }
            }
            return handler
        }           

        serverMod._updatePath = function(new_route, new_host, new_nsp){
            path = 'http://' + new_host + '/' + new_route
            socket.disconnect();
            socket = initSocketConnection(new_nsp)                
        }  

        function reconnectService(){            

            _client.request({
                method:'GET',
                url:services[serviceName].uri
            }, function(err, new_api){
                if(err){
                    console.log(err);
                    //pass the job onto getService function                    
                    getService(services[serviceName].uri, serviceName).run();
                }else{
                    var new_maps = new_api.maps;

                    //use updated new_maps to update the path for each serverMod of this service
                    for (var i = 0; i < new_maps.length; i++) {
                        
                        var new_route = new_maps[i].route.join('/');                        
                        //loop throuhg each serverMod in the service and use _updatePath method to update the route to the serverMod
                        services[serviceName].service[new_maps[i].modName]._updatePath(new_route, new_api.host, new_maps[i].nsp);
                    }

                    if(typeof services[serviceName].onLoad === 'function'){
                        services[serviceName].onLoad()
                    } 
                }
            })
        }
        /*-------------WebScoket Event Handling-----------------------*/   
        eventHandlers = {};

        serverMod.on = function(eventName, handler){
            eventHandlers[eventName] = eventHandlers[eventName] || {};
            eventHandlers[eventName].subscribers = eventHandlers[eventName].subscribers || [];
            eventHandlers[eventName].subscribers.push(handler)
        }

        function dispatch(e){
            if(eventHandlers[e.name]){
                e.received_by = appName;
                e.received_at = Date();  
                eventHandlers[e.name].subscribers.forEach(function(sub){
                    sub(e);
                })
            }
        }
        
        function initSocketConnection(name_space){
            var socket = io.connect(name_space)
           
            socket.on('dispatch', function (data) {
                //console.log(data);  
                dispatch(data)
            });

            socket.on('disconnect', function(data){
                console.log('on disconnect------------!')
                dispatch({
                    name:'disconnect',
                    data:data
                })
                socket.disconnect()
                reconnectService()                  
            })

            socket.on('connect', function(data){
                //console.log('on connect------------!')
                //console.log(data)
            })
            return socket
        }

        var socket = initSocketConnection(map.nsp)
       
       return serverMod
    }   

    function configHandler(handler){

        return {//will be called by mth
            run:function(next){
                //if config is used next needs to be called for app to start

                var configMod = {}                
                
                configMod.next = function(){
                    if(typeof next === 'function'){next()}
                }

                configMod.done = configMod.next
                
                configMod.useService = function useService(serviceName){
                    return services[serviceName].service;
                }

                handler.apply(configMod);
            }
        }
    }

    function config(handler){
        initSync.push(new configHandler(handler).run)
        setInit();
        return tasks
    }

    function init(){
        //last fn to call is intiMods 
        initSync.push(initModules);        
        multiTaskHandler().addMultiTask(initSync).addMultiTaskAsync(initAsync).runTasks(loadComplete)
    }
    
    function initService(options){
        appName = options.route;
        _host = options.host || 'localhost';
        _server  = require('./server')(options.route, options.port, _host, options.validation);          
    
        tasks.server = _server.server;  
        return tasks
    }
    
    // emit load event when component has fully loaded
    var handlers = []
    function registerHandler(cb){
        handlers.push(cb)
        return tasks
    }        

    function loadComplete(){        
        handlers.forEach(function(cb){
            cb();            
        });
    }
    return tasks
}

function client(){
    var http = require('request');
    var fs = require('fs');

    var client = {};        
    client.request = request;
    client.upload = fileUploadHandler;

    //request can only be made through the request obj and request handler
    function request(request, callBack){
        //console.log(request)
        http({
            method:request.method,
            url:request.url,
            body:request,
            json:true
        }, function(err, res, body){          
            if(err){
                console.log('err----------------------')
                console.log(err)
                if(typeof callBack === 'function'){callBack(err);}            
            }else if(res.statusCode >= 400){               
                console.log('REQUEST ERROR: STATUSCODE: ' + res.statusCode);   
                if(typeof callBack === 'function'){callBack(body);}     
            }else{
                if(typeof callBack === 'function'){callBack(null, body);}                
            }
        })
    } 

    function fileUploadHandler(request, callBack){
        //console.log('request.data----------------------')
        //console.log(request.data)
        http.post({
            url:request.url,
            formData:request.data,
            json:true
        }, function(err, res, body){
            if(err){
                console.log('err----------------------')
                console.log(err)
                if(typeof callBack === 'function'){callBack(err)}            
            }else if(res.statusCode >= 400){               
                console.log('REQUEST ERROR: STATUSCODE: ' + res.statusCode);   
                if(typeof callBack === 'function'){callBack(body)}     
            }else{
                if(typeof callBack === 'function'){callBack(null, body)}                
            }
        })
    }

    return client
}


function randomStr(count){
    var text = ""; possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    count = count || Math.floor(Math.random() * 10) || 5;

    for (var i = 0; i < count; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}


exports.app = function(){
    return new tasks()
};


