const app = require('sht-tasks').app();
var obj = require('obj')
app.initService({
	route:'/loadBalancer',
	port:5500
})

app.serverMod('clones', function(){
	var _clones = this, clones = [], service_route = '', isInit = false;
	

	_clones.register = function(conn_data, cb){		
		console.log(conn_data)
		
		conn_data.host = conn_data.host || 'localhost'

		clones.push({	
			address: 'http://'+conn_data.host+':'+conn_data.port+conn_data.route,					
			port:conn_data.port,
			host:conn_data.host,
			route:conn_data.route,
			clone_index:clones.length-1,
			consecutive_failures:0,
			load_count:0,
			last_load_time:null,
			connection_errs:[]
		})
		
		cb(null, clones[clones.length-1])
		console.log('dkldsjsdlkjsljf')
		if(!isInit){
			init()
		}

	}

	//firing events from the loadBalancer allow sharing event between clones
	//that are all using the same loadBalancer instance
	_clones.emitEvent = function(e, cb){
		_clones.emit(e.name, e.data);
		cb()
	}

	_clones.assignHandler = function(event, cb){
		if(wasNotHandled(event)){											
			cb(null, event);					 			
		}else{
			cb({message:'event already assinged'})			
		}				
	}	

	var assingedEvents = []
	function wasNotHandled(event){
		var e = obj(assingedEvents).findByKey('id', event.id)[0];
		
		if(e){			
			return false
		}else{
			//record that the event was handler
			assingedEvents.push(event)	
			
			if(assingedEvents.length > 100){
				//remove last 50 elements to keep list short
				assingedEvents.splice(50)
			}
			return true
		}		
	}

	function connectionErrHandler(err){
		clones[i].consecutive_failures++;		
		if(clones[i].consecutive_failures > 1){
			clones.splice(i,1)
		}else{
			clones[i].connection_errs.push(err)			
		}		
	}

	function getService(url, cb){
		app.client.request({
			method:'GET',
			url:url
		}, function(err, results){
			if(err){				
				cb(err)
			}else{				
				cb(null, results)
			}
		})
	}
	var i = 0;
	function getNextService(cb){
		i++
		i = (i > clones.length-1)?0:i;
		
		var url = clones[i].address;
		getService(url, function(err, results){
			if(err){
				//this fn will keep attempting to get the next clone service in the case of error until all services are eliminated
				connectionErrHandler(err);
				if(clones.length === 0){
					cb({message:'service unavailable!'})
				}else{
					getNextService(cb)
				}
			}else{
				console.log('clones length:' + clones.length)
				console.log('clones index:' + i)
				console.log('clones port:' + clones[i].port)
				cb(null, results)
			}
		})	
	
	}

	function init(){
		isInit = true
		//this is the route that will be used to laod the service
		var route = clones[0].route
		console.log(route)
		app.server.get(route, function(req, res){
			console.log('here  1 ----------------------')

			if(clones.length > 0 ){
				getNextService(function(err, results){
					if(err){
						res.status(500).json(err)
					}else{
						res.json(results)
					}
				})	
			}else{
				res.status(500).json({message:'service unavailable!'})
			}
								
		})		
	}
		
})
