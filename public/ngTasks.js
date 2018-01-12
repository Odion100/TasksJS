 
function randomStr(count){
    var text = ""; possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    count = count || Math.floor(Math.random() * 10) || 5;

    for (var i = 0; i < count; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

var tasks = (function(window){        
    //multi Task handler Class
    //Async/sync task manager 
    function multiTaskHandler(mthModContructor, tasksList){
        var mth, syncTasks, asyncTasks, mthModule = {}, additionalTasks = [],  _return; 
        mth = this;

        //use mthModConstructon to create mthModule 
        if(typeof mthModContructor === 'function'){        
            mthModContructor.apply(mthModule, []);
            _return = mthModule._return; 
        }
             
        tasksList = tasksList || {};
        syncTasks = tasksList.syncTasks || Object.getOwnPropertyNames(mthModule);
        asyncTasks = tasksList.asyncTasks || [];    
       
        //remove _return from tasksList
        var r = syncTasks.indexOf('_return')
        if(r > -1){syncTasks.splice(r, 1)}      
            
        function taskRunner(mainCallback, mthModule, syncTasks, asyncTasks){  
        //console.log('_startTasks callBack: ' + mainCallback.toString())  

            var taskRunner, i;
            mainCallback = mainCallback || function(){}
            taskRunner = this;                

            if (syncTasks.indexOf('_endTasks') === -1) {syncTasks.push('_endTasks')}
            if (asyncTasks.indexOf('_startTasks') === -1) {asyncTasks.unshift('_startTasks')}

            mthModule._endTasks = function(err, results){
                if(typeof mainCallback === 'function'){
                    if(err || results){
                        mainCallback(err, results)
                    }else
                    if(typeof _return === 'function'){
                        mainCallback(err, _return())
                    }else{
                        mainCallback();
                    } 
                }
                    
                i = 0;
                return
            }  

            mthModule._startTasks = function(callBack){          
                callBack()
            }            

            i = 0;
            //execute each task (function) in the syncTasks array/object
            taskRunner.execSync = function(){    
                var fn = mthModule[syncTasks[i]];                                            
                                       
                function cb(err){         
                    if(err){                
                        if(typeof mainCallback === 'function'){mainCallback(err)}
                        return false
                    }

                    i++
                                        
                    taskRunner.execSync();              
                }   

                return fn(cb, mthModule._endTasks);                
            }
            
            //create a new instance
            taskRunner.execAsync = function(){
                var cb_counter = 0, return_val;                                
                
                for (var i = 0; i < asyncTasks.length; i++) {                
                    tasks_fn(asyncTasks[i]);                                                                                   
                }

                function tasks_fn(taskName){            
                    var fn = mthModule[taskName]                

                    function cb(err){
                        if(err){                
                            if(typeof mainCallback === 'function'){mainCallback(err)}
                            return false
                        }
                        //add the results to the correct property of the results obj                    
                        cb_counter++; 

                        //after running async tasks run sync tasks
                        if(cb_counter >= asyncTasks.length){                     
                            taskRunner.execSync();                            
                        }
                    }

                    return_val = fn(cb, mthModule._endTasks); 
                }    

                return return_val
            }

            return taskRunner            
        }

        function isValidTaskList(tasksNames){

            if(!(tasksNames instanceof Array)){
                throw 'tasksJS ERROR: setTasks & setTasksAsync functions must pass an array of strings'
            }

            for (var i = 0; i < tasksNames.length; i++) {
                if(!(mthModule[tasksNames[i]])){
                    return false
                }            
            }
            return true
        }
        
        mth.setTasks = function(syncList){        
            syncList = (syncList) ? Array.from(syncList) :Object.getOwnPropertyNames(mthModule);

            if(isValidTaskList(syncList)){
                //creates an new instance of tasks if contstructor was passed on init
                if(typeof mthModContructor === 'function'){
                    return new multiTaskHandler(mthModContructor, {syncTasks:syncList}) ;     
                }else{
                    syncTasks = syncList;
                }
            }else{
                throw 'tasksJS ERROR: multiTaskHandler Class ---> Invalid taskList!!!';
            }   
        }
        
        mth.setTasksAsync = function(asyncList, syncList){
            syncList = (syncList) ? Array.from(syncList) : [];
            asyncList = (asyncList) ? Array.from(asyncList) :Object.getOwnPropertyNames(mthModule);
            
            if(isValidTaskList(asyncList) && isValidTaskList(syncList)){
                //creates an new instance of tasks if contstructor was passed on init
                if(typeof mthModContructor === 'function'){
                    return new multiTaskHandler(mthModContructor, {syncTasks:syncList, asyncTasks:asyncList}) ;    
                }else{
                    syncTasks = syncList;
                    asyncTasks = asyncList;
                }
            }else{
                throw 'tasksJS ERROR: multiTaskHandler Class ---> Invalid taskList!!!';
            }        
        }

        mth.runTasks = function(){
            var args = [], callBack, i = 1, _mthModule = {};
            //seperate the callBack from the remaining arguments
            if(typeof arguments[0] === 'function'){
                callBack = arguments[0];                        
            }

            for (i; i < arguments.length; i++) {
                args.push(arguments[i])
            }        
            
            if (args.length > 0 && typeof mthModContructor === 'function'){
                //create new instance of the mthModule with new args
                mthModContructor.apply(_mthModule, args);
            }else{
                _mthModule = mthModule;
            }
            
            //add additional tasks to mthModule
            for (var i = 0; i < additionalTasks.length; i++) {
                _mthModule[additionalTasks[i].name] = additionalTasks[i].fn 
            }                    

           //create new instance of the taskRunner to run methods on the mthModule
           return new taskRunner(callBack, _mthModule, syncTasks, asyncTasks).execAsync();          
        }
        
        mth.addTask = function(name, fn){
            name = name || randomStr();
            additionalTasks.push({name:name, fn:fn})

            if(syncTasks.indexOf('_endTasks') === syncTasks.length - 1){
                syncTasks.pop();
                syncTasks.push(name);
                syncTasks.push('_endTasks');
            }else{
                syncTasks.push(name);    
            }
            
            return mth
        }

        mth.addTaskAsync = function(name, fn){
            name = name || randomStr();
            additionalTasks.push({name:name, fn:fn})
            asyncTasks.push(name);
            return mth   
        }
        //tasks an array of random fns to add to syncTasks list
        mth.addMultiTask = function(tasksArr){
            for (var i = 0; i < tasksArr.length; i++) {
                mth.addTask(null, tasksArr[i]);
            }
            return mth
        }
        //tasks an array of random fns to add to asyncTasks list
        mth.addMultiTaskAsync = function(tasksArr){
            for (var i = 0; i < tasksArr.length; i++) {
                mth.addTaskAsync(null, tasksArr[i]);
            }        
            return mth
        }

        //if mth is initialzed without a construnction don't add setArgs fn
        if(typeof mthModContructor === 'function'){
            mth.setArgs = function(){
                var args = [];
                for (var i = 0; i < arguments.length; i++) {
                    args.push(arguments[i]);
                }
                //overwrite mthModule with new one with args
                mthModContructor.apply(mthModule, args);
                return mth
            }    
        }
        

        //a subscription will exect the syncTasks every x seconds
        mth.createSubscription = function(seconds){
            
            var subscription = function(){
                var runningSub;
                
                var interval = (seconds) ? seconds * 1000: 1000;
                
                this.start = function(){ 
                    var args = [], callBack, i = 1, _mthModule = {};
                    //seperate the callBack from the remaining arguments
                    if(typeof arguments[0] === 'function'){
                        callBack = arguments[0];                        
                    }

                    for (i; i < arguments.length; i++) {
                        args.push(arguments[i]);
                    }        
                    
                    if (args.length > 0 && typeof mthModContructor === 'function'){
                        //create new mthModule with new args
                        mthModContructor.apply(_mthModule, args);
                    }else{
                        _mthModule = mthModule;
                    }
                                
                   //use setInterval to run taskRunner on repeat                   
                    runningSub = setInterval(new taskRunner(callBack, _mthModule, syncTasks, asyncTasks).execAsync, interval); 
                }

                this.end = function(){                
                    clearInterval(runningSub);
                }
            }           

            return new subscription()
        }   
        
        return mth
    }
    var ngService = angular.injector(['ng', 'ngFileUpload']).get             
    function tasks(){        
        var tasks = window.tasks || (window.tasks = {}), modules = {}, services = {}, mods = [], components = [], initAsync = [], initSync = [];
        
        tasks.loadService = loadService;
        tasks.module = addModule;                
        tasks.config = config;
        tasks.component = addComponent;
        tasks.ngService = ngService    

        function refreshComponents(){
            if(components[0]){
                angular.element($(components[0].name)[0]).scope().$digest()        
            }            
        }
        
        function componentInitializer(componentName, options){           
            var e = $(componentName)[0];
            var $scope = angular.element(e).scope();             
            var $compile = ngService('$compile');
            var $templateRequest = ngService('$templateRequest');

            $scope.$apply(function(){   
                //ensure modules is an array
                options.modules = Array.isArray(options.modules)?options.modules:[options.modules]
                options.modules.forEach(function(modName){
                    //copy selected modules to the scope of the service
                    $scope[modName] = modules[modName].mod;    
                })
                
                
                if(options.templateUrl){
                    $templateRequest(options.templateUrl)
                    .then(function(template){

                         $compile($(e).html(template).contents())($scope);

                    }, function(err){

                        console.log(err)
                    })
                }else if(options.template){
                    $compile($(e).html(options.template).contents())($scope);
                }
                console.log(componentName)                   
                
                console.log($scope)                   
            })                            
        } 

        function addComponent(componentName, options){                        
            components.push({name:componentName, options:options})
            
            setInit();

            return tasks
        }

        function initModules() {
            
            for (var i = 0; i < mods.length; i++) {                
                    modFactory(mods[i])                
            }

            for (var i = 0; i < components.length; i++) {
                componentInitializer(components[i].name, components[i].options)
            }
            
            //by clearing these arrays more modules can be added after the original initialization
            initSync = [];
            initAsync = [];            
            is_set = false;            
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
            console .log   ('user-------------------------')
            console .log   (user)
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

         function loadService(name, option, cb){   
            
            var uri = 'http://' + option.host +':'+ option.port + option.route       
            if(services[name]){
                //if the service already exists
                throw "tasksJS ERROR: SERVICE NAMING CONFLICT!!! Two Services cannot be assigned the same name: " + name;                                
            }

             services[name] = {                                                                            
                dependents:[],
                name:name,
                uri:uri                            
            }  

            initAsync.unshift(new getService(uri, name, cb).run)
            setInit();
            return tasks
        }  

        function getService(url, name, cb){
                 
            return {//run will be called by a mth
                run:function(nextTask){                    

                    _client.request({
                        method:'GET',
                        url:url
                    }, function(err, data){
                        if (err) {
                            console.log(err);
                            //user can check fo the existance of connectionErr property inside modules to check if the service has loaded correctly
                            //so that the app can optionally be made to work even when some services fail
                            services[name].service = {connectionErr:true, data:err};
                            if(typeof cb === 'function'){cb(err)};
                        }else{                    
                            //console.log(data);                                
                            console.log(data)
                            services[name].service = new createServiceAPI(data, name);
                            
                            if(typeof cb === 'function'){cb(null)}
                        }
                        nextTask();
                    })
                }
            }
        }           

        function createServiceAPI(apiMap, serviceName){
            var service = {}, maps = apiMap.maps;
            //each map in apiMaps.maps describes a backend serverMod
            for (var i = 0; i < maps.length; i++) {
                //serviceRequestHandler creates replica of the backend serverMod api 
                //that will send a request to that serverMod's method
                service[maps[i].modName] = new serviceRequestHandler(maps[i], apiMap.host, serviceName) 
                
            }

            return service
        }

        function serviceRequestHandler(map, host, serviceName){
            //handles request to backend server mod

            //use map to regenerate backend  api
            //a map contains info on how to call a backend serverMod and what methods it has
            var serverMod = {}, path = 'http://' + host + '/' + map.route.join('/'), method_names = map.methods;

            for (var i = 0; i < method_names.length; i++) {                
                serverMod[method_names[i]] = reqHandler(method_names[i] , map.config[method_names[i]].request_method).run
            }

            var  attempts = 0;
            function mapErrHandler(new_api, req, callBack, handler){                    
                attempts++
                if(attempts >= 3){                
                    throw "tasksJS ERROR: Invalid Map!!! FAILED TO CONNECT TO APP AFTER "+attempts+" ATTEMPTS!!!"
                }else{
                    var new_maps = new_api.maps;

                    //use updated new_maps to update the path for each serverMod of this service
                    for (var i = 0; i < new_maps.length; i++) {
                        
                        var new_route = new_maps[i].route.join('/');                        
                        //loop throuhg each serverMod in the service and use _updatePath method to update the route to the serverMod
                        services[serviceName].service[new_maps[i].modName]._updatePath(new_route, new_api.host, new_maps[i].nsp);
                    }
                    //use this handle on reqHandler to resend request
                    handler.run(req.data, function(err, data){
                        callBack(err, data);
                        attempts = 0;
                    })                        
                }              
            }            

            function reqHandler(method_name, request_method){

                var handler =  {
                    run:function(data, callBack){                        
                        var req = {
                            method:request_method,
                            url:path+'/'+method_name,
                            data:data
                        }
                        _client.request(req, function(err, data){
                            if (err) {
                                console.log(err);
                                if (err.invalidMap) {
                                    mapErrHandler(err, req, callBack, handler)                          
                                }else{
                                    if(typeof callBack === 'function'){callBack(err)}
                                    refreshComponents();     
                                }                                                            
                            }else{                                
                                if(typeof callBack === 'function'){callBack(null, data)}                            
                                refreshComponents();
                            }
                        })
                    }
                }
                return handler
            }            

            serverMod._updatePath = function(new_route, new_host, new_nsp){
                path = 'http://' + new_host + '/' + new_route
                socket.disconnect();
                socket = initSocketConnection(new_nsp)                
            } 
           /*-------------WebScoket Event Handling-----------------------*/                

           var eventHandlers = {};

            function dispatch(e){
                if(eventHandlers[e.name]){
                    eventHandlers[e.name].subscribers.forEach(function(sub){
                        sub(e.data, e)
                    })
                }
            }

            serverMod.on = function(eventName, handler){
                eventHandlers[eventName] = eventHandlers[eventName] || {};
                eventHandlers[eventName].subscribers = eventHandlers[eventName].subscribers || [];
                eventHandlers[eventName].subscribers.push(handler)
            }
                
            function reconnectService(){                

                _client.request({
                    method:'GET',
                    url:services[serviceName].uri
                }, function(err, new_api){
                    if(err){
                        console.log(err)
                    }else{
                        var new_maps = new_api.maps;

                        //use updated new_maps to update the path for each serverMod of this service
                        for (var i = 0; i < new_maps.length; i++) {
                            
                            var new_route = new_maps[i].route.join('/');                        
                            //loop throuhg each serverMod in the service and use _updatePath method to update the route to the serverMod
                            services[serviceName].service[new_maps[i].modName]._updatePath(new_route, new_api.host, new_maps[i].nsp);
                        }
                    }
                })
            }
            function initSocketConnection(name_space){
                var socket = io.connect(name_space)
                console.log(map.nsp)
                socket.on('dispatch', function (data) {
                    //console.log(data);  
                    dispatch(data)
                });

                socket.on('disconnect', function(data){
                    console.log('on disconnect------------!')
                    console.log(data) 
                    dispatch({
                        name:'disconnect',
                        data:data
                    })
                    reconnectService()                  
                })

                socket.on('connect', function(data){
                    console.log('on connect------------!')
                    console.log(data)
                })
                return socket
            }
           
           var socket = initSocketConnection(map.nsp)
           return serverMod
        }  

        function taskConfig(fn){

            return {//will be called by mth
                run:function(config_cb){
                    //if config is used config_cb needs to be called for app to start

                    var configMod = {}
                    
                    configMod.next = config_cb

                    configMod.useService = function useService(serviceName){
                        return services[serviceName].service
                    }

                    fn.apply(configMod);
                    if(configMod.devMode){console.log('TasksJS: - init');}
                    if(configMod.devMode){console.log('TasksJS tasks.config: this.next() must be called in order to continue initializing <--');}
                }
            }
        }

        function config(fn){
            initSync.push(new taskConfig(fn).run)
            setInit();
            return tasks
        }

        function init(){
            //last fn to call is intiMods 
            initSync.push(initModules);

            multiTaskHandler().addMultiTask(initSync).addMultiTaskAsync(initAsync).runTasks()
        }

        return tasks
    }


    var objHandler = function(obj){
        var handler = {}
        handler.cloneKeys = cloneKeys;
        handler.uniqueKeys = uniqueKeys;
        handler.sumOfKeys = sumOfKeys
        handler.findByKey = findByKey;
        handler.navigate = navigate;

        if(!Array.isArray(obj)){
            //obj.forEach & obj.forEachSync loops through each property on an object        
            handler.forEach = function(cb, descend){
                var pNames = Object.getOwnPropertyNames(obj), index = -1; 
                pNames.forEach(function(pName){
                    cb(obj[pName], pName)
                })
            }  
            handler.forEachSync = function(cb, descend){
                var pNames = Object.getOwnPropertyNames(obj), index = -1;             
                
                function next(){            
                    index =index++;
                    cb(obj[pNames[index]], pNames, next);
                }
                next()
            }      
        }else{
            //obj.forEachSync loops through each index of an array
            handler.forEach = function(cb){
                throw "obj ERROR: obj(OBJ).forEach is not an avialable method when handling an Array!!!"
            }
            handler.forEachSync = function(cb, descend){
                var index = (descend)? obj.length+1:-1;             
                
                function next(){            
                    index = (descend)? index-- : index++;
                    cb(obj[index], index, next);
                }
                next()
            }
        }

        function cloneKeys(keys, toObj){
            var copy = toObj || {};

            var pNames = keys || Object.getOwnPropertyNames(obj);
            
            for (var i = 0; i < pNames.length; i++) {
                copy[pNames[i]] = obj[pNames[i]];
            } 

            return copy
        };
        function uniqueKeys(key){
            var uniqueList = [], arr = obj;
            
            for (var i = 0; i < arr.length; i++) {
                if( uniqueList.indexOf(arr[i][key]) === -1 ){
                    uniqueList.push(arr[i][key]);
                }
            }
            return uniqueList
        };
        
        function sumOfKeys(key){
            var sum = 0, arr = obj; 

            for (var i = 0; i < arr.length; i++) {
                var num = arr[i][key]*1
                ; num = (isNaN(num))? 0:num; sum = sum + num 
            } 
            return sum
        }    
        function findByKey(key, searchArr, multi){
            var searchArr = (Array.isArray(searchArr)) ? searchArr : [searchArr]
            var results = [];

            for (var i = 0; i < obj.length; i++) {
                if(searchArr.indexOf(obj[i][key]) > -1 ) {
                    results.push(obj[i]);
                    if(!multi){break}
                }
            }

            return results
        }

        function navigate(pNames, start){
            var _obj = obj;

            for (var i = start || 0; i < pNames.length; i++) {
               _obj = _obj[pNames[i]]
            }
            return _obj
        }

        return handler
    }

    function obj(_obj){
        return new objHandler(_obj)
    }    

    function client(){

        var http = ngService('$http'), upload = ngService('Upload');

        var client = {};        
        client.request = request;        
               
        //request can only be made through the request obj and request handler
        function request(method, url, data){
            return {
                _id:uniqueNumber(),                
                cId:'clientId',                
                url:url,
                method:method,
                data:data
            };             
        }
        //request can only be made through the request obj and request handler
        function request (request, callBack){            
            http({
                method:request.method,
                url:request.url,
                data:request
            }).then(function successCallback(res){
                if (typeof callBack === 'function') {callBack(null, res.data)}                    
            }, function errorCallback(res){
                if(res.data){
                    if(res.data.errMsg){
                        console.log('dub requests')
                        showErrMsg(res.data.errMsg)
                    }                       
                }     
                
                if (typeof callBack === 'function') {callBack(res.data)}
                console.log(res);
            })
        }
        //borrowed code to create unique id from Date
        function uniqueNumber() {
            var date = moment()._d;
            
            // If created at same millisecond as previous
            if (date <= uniqueNumber.previous) {
                date = ++uniqueNumber.previous;
            } else {
                uniqueNumber.previous = date;
            }
            
            return date;
        }

        client.uniqueNumber = uniqueNumber;

        uniqueNumber.previous = 0;

        function showErrMsg(errMsg){
            if(errMsg){
                // $$msgbox.message = errMsg
                // $$msgbox.button2.show = false;
                // $$msgbox.show = true;                    
            }        
        }

        function fileUploadHandler(request, callBack){
            console.log(request)
            upload.upload({
                url:request.url,
                data:request
            }).then(function successCallback(res){
                if (typeof callBack === 'function') {callBack(null, res.data)}
                    console.log(res)
            }, function errorCallback(res){
                if(res.data){
                    if(res.data.errMsg){
                        console.log('dub requests')
                        showErrMsg(res.data.errMsg)
                    }

                } 


                if (typeof callBack === 'function') {callBack(res.data)}
                console.log(res);
            })
        }

        return client

    }
    
    var _tasks = {app:function(){return new tasks()}}, _client = client()    

    //replace this with on load fn
    /*_tasks.init(function(err){        
        if(err){
            console.log(err);
        }
    });*/
    return _tasks
})(window)




