//express and middleware
const express = require('express');
const server = express();
var app = express();
const socketServer = require('http').Server(app);
const io = require('socket.io')(socketServer);


const bodyParser = require('body-parser')
server.use(express.static(__dirname + '/public'));
//server.use(bodyParser.json())
server.use(bodyParser.json({limit: '5mb'}));

const multer = require('multer');

const tempLocation = './temp'
const cwd = process.cwd();

var storage = multer.diskStorage({
    destination:function (req, file, cb) {
        cb(null, tempLocation)
    },

    filename: function (req, file, cb) {        
        cb(null, file.originalname)
    }
});

var fileHandler = multer({storage:storage}).single('file')

var tasks = {}, maps = [], validateConn, _host, _port, _socket_port = parseInt(Math.random()*parseInt(Math.random()*10000));
socketServer.listen(_socket_port)

server.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT ,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});

server.get('/:app/:mod/:serverMod/:fn', getHandler);
server.put('/:app/:mod/:serverMod/:fn', requestHandler);
server.post('/:app/:mod/:serverMod/:fn', requestHandler);

function requestHandler(req, res){
   if(validMap(req, res)){
        var app = req.params.app, mod = req.params.mod, fn = req.params.fn, serverMod = req.params.serverMod; 
        console.log('req.params------------------------------')
        console.log(req.params)

       // try{
            if(req.body.fileUpload){
                fileHandler(req, res, function(err){                                        
                    if(err){
                        console.log('fileHandler error');
                        console.log(err);
                        res.status(500).json(err);
                        return false
                    }

                    if(!(req.file)){
                        error = {errMsg:'No file was uploaded'};           
                        res.status(500).json(error);
                        return false;
                    }
                    
                    tasks[app][mod][serverMod][fn](req.body.data, function(err, results){
                        if(err){
                            res.status(500).json(err);
                            console.log(err)     
                        }else{
                            res.json(results);
                        }
                    })
                            
                }, req, res)
            }else{
                tasks[app][mod][serverMod][fn](req.body.data, function(err, results){
                    if(err){
                        res.status(500).json(err);
                        console.log(err)     
                    }else{
                        res.json(results);
                    }
                }, req, res) 
            }
                
       /* }catch(e){
            res.status(500).json(e);
            console.log(e.name);
            JSON.stringify(e.message);
        }*/
        
   }
   
}

function getHandler(req, res){
    if(validMap(req, res)){
        var app = req.params.app, mod = req.params.mod, fn = req.params.fn, serverMod = req.params.serverMod;

        try{
            tasks[app][mod][serverMod][fn](function(err, results){
                if(err){
                    res.status(500).json(err);
                    console.log(err)     
                }else{
                    res.json(results);
                }
            })
        }catch(e){
            res.status(500).json(e);
            console.log(e);
        }
            
    }        
}

function sendMaps(req, res){
    
    if(typeof validateConn === 'function'){
        console.log('validateConn----------------------------------------------------------')
    
        validateConn(req, res, function(err){
            console.log('err----------------------------------------------------------')
            console.log(err)
            if(err){
                res.status(500).json(err);
            }else{
                res.json({maps:maps, host:(_host+ ':' + _port)});
            }
        })
    }else{
        res.json({maps:maps, host:(_host+ ':' + _port)});      
    }
    
}
function sendMapsErr(req, res){
    res.status(500).json({maps:maps, host:(_host+ ':' + _port), invalidMap:true});  
}



function validMap(req, res){
    
    if(tasks[req.params.app]){
        if(tasks[req.params.app][req.params.mod]){
            if(tasks[req.params.app][req.params.mod][req.params.serverMod]){
                if(tasks[req.params.app][req.params.mod][req.params.serverMod][req.params.fn]){
                    return true
                }else{
                    sendMapsErr(req, res);
                }
            }else{
                sendMapsErr(req, res);
            }         
        }else{
            sendMapsErr(req, res);
        }
    }else{
        sendMapsErr(req, res);
    }
}

function randomStr(count){
    var text = ""; possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    count = count || Math.floor(Math.random() * 10) || 5;

    for (var i = 0; i < count; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}

//create a map that will be used to replicate the backend api on the client
function mapRoute(serverModName, serverMod, config, nsp){
    /// randomly generate routes to the server mod
    ///use random characters to generate map with random route object
    var map = {}, previous = randomStr(), next = randomStr(), methods;
    map.route = [];
    map.modName = serverModName;
    map.methods = Object.getOwnPropertyNames(config);
    map.config = config;
    map.nsp = "http://"+_host+":"+_socket_port+"/" +nsp;
    
    var obj = tasks;
    obj[previous] = {};
    map.route.push(previous);

    for (var i = 1; i < 2; i++) {
        obj[previous][next] = {};
        obj = obj[previous];       
        map.route.push(next);        
        previous = next;
        next = randomStr();   
    }
    obj[previous][next] = serverMod;
    map.route.push(next);
    maps.push(map);
    console.log(map)
    return map
 }

function addRoute(serverModName, serverMod, config, nsp){
    var _map =  mapRoute(serverModName, serverMod, config, nsp);
}
function getMaps(){
    return {maps:maps, host:(_host+ ':' + _port)}
}

function init(connPath, port, host, validationFn){
    validateConn = validationFn;    
    _host = host;
    _port = port;

    var _server = {};
    _server.addRoute = addRoute;
    _server.maps = getMaps
    _server.server = server;    
    _server.io = io;    

    server.get(connPath, sendMaps);    
    server.listen(port);
    console.log("server listening on " + (_host+ ':' + _port));

    return _server
}

module.exports = init; 

