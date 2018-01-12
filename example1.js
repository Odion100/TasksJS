const app = require('tasks').app();
const PORT = parseInt(Math.random()*parseInt(Math.random()*10000))

app.initService({
	route:'/viewService',
	port:PORT
})

app.loadService('loadBalancer', {
	route:'/loadBalancer',
	port:5500,
	host:'localhost'
})

app.loadService('testService', {
	route:'/viewService',
	port:4500,
	host:'localhost'
})

app.config(function(){
	var config = this;
	var loadBalancer = this.useService('loadBalancer');

	loadBalancer.clones.register({
		route:'/viewService',
		port:PORT,
		host:'localhost'
	}, function(err, results){
		if(err){
			console.log(err)
		}else{
			console.log(results)
			config.next()
		}
	})

	loadBalancer.clones.on('shared_event', function(data){
		console.log(data+PORT)
	})
})

app.module('db', function(){
	var mod = this;
	var ts = this.useService('testService');
	var loadBalancer = this.useService('loadBalancer');


	/*ts.orders.on('test_message', function(data, event){
		console.log('recived event on port:'+PORT)
		loadBalancer.clones.assignHandler(event, function(err, results){
			if(err){
				console.log("I didn't handle the event")
			}else{							
				console.log("I handled the event, see: -----------")
			}
		})
	})*/
	mod.find = function(query, cb){
		ts.orders.getOrders({}, function(err, results){
			if(err){
				cb(err)
			}else{
				cb(null, results)
			}
		})		
	}

	mod.addOrder = function(){
		cb(null, {})
	}

})

app.serverMod('orders', function(){		
	var db = this.useModule('db');
	var loadBalancer = this.useService('loadBalancer');
	var _orders = this

	_orders.getOrders = function(query, cb){
		db.find({}, function(err, results){
			if(err){
				cb(err)
			}else{
				cb(null, results)
			}
		})				
	}

	_orders.addOrder = function(data, cb){		

		cb(null, {results:'Sucessful callback from clone on port '+PORT+'!!!'})
		
		console.log('app._maps()----------------')
		console.log(app._maps())
		loadBalancer.clones.triggerEvent({name:'shared_event', data:'shared event is working on port:'})
	}
	for (var i = 0; i < 3; i++) {
		_orders.emit('test', {test_message:'Sucessful message from clone on port '+PORT+'!!!'})	
	}
	
	setInterval(function(){
		_orders.emit('test', {test_message:'Sucessful message from clone on port '+PORT+'!!!'})		
	},5000)
})

