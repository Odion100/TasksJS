const app = require('./tasks').app();

app.initService({
	route:'/service',
	port:4567
})
.module('db', function(){
	
	this.find = function(query, cb){
		cb(null, {test:'this is a test message!'})
	}

	this.addOrders = function(){
		cb(null, {})
	}

})

.serverMod('orders', function(){		
	var db = this.useModule('db');
	var orders = this

	orders.getOrders = function(query, cb){
		db.find({}, function(err, results){
			if(err){
				cb(err)
			}else{
				cb(null, results)
			}
		})
					
	}

	orders.addOrder = function(data, cb){
		var new_order = db.createOrder(data)

		db.insert(new_order, function(err, results){
			if(err){
				cb(err)
			}else{
				cb(null, results)
			}
		})
	}
	
	setInterval(function(){
		orders.emit('test_message', {test_message:'testing from example2!'})		
	},10000)
})