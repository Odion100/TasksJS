
var service
var app = tasks.app()

app.loadService('views', {
	route:'/viewService',
	port:5500,
	host:'localhost'
})
 
.module('test1', function(){
	service = this.useService('views')
	var test1 = this	
	this.testMessage = 'Hello World!'
	this.runTest = function(){
		service.orders.getOrders({}, function(err, results){
			if(err){
				test1.testMessage = 'error respones---------------------'
			}else{
				test1.testMessage = 'succesful respones---------------------'
				setTimeout(function(){
            
            	//$("div[scope='testscope']").click()
            	//angular.element($("div[scope='test']")[0]).scope().$digest()
        	}, 1)
			}

		})
		console.log('this is a succesful test!!! ----     ')
		//test1.testMessage = "this is a succesful test!!! ----"
			
	}


	console.log(service)
	service.orders.on('test', function(data){
		console.log('data---------------')
		console.log(data)
	})
	
})

.module('test2', function(){
	service = this.useService('views')
	var test2 = this	
	this.testMessage = 'Hello World!'
	this.runTest = function(){
		service.orders.getOrders({}, function(err, results){
			if(err){
				test2.testMessage = 'error respones---------------------2'
			}else{
				test2.testMessage = 'succesful respones---------------------2'
				setTimeout(function(){
            
            	//$("div[scope='testscope']").click()
            	//angular.element($("div[scope='test']")[0]).scope().$digest()
        	}, 1)
			}

		})
		console.log('this is a succesful test!!! ----   2  ')
		//test2.testMessage = "this is a succesful test!!! ----"
			
	}


	console.log(service)
	/*service.orders.on('test', function(data){
		console.log('data---------------')
		console.log(data)
	})*/
	
})

.component('testscope', {	
	modules:['test1'],
	template:'<div>{{message}} </div><div>{{test1.testMessage}} </div> <button ng-click="test1.runTest()" >test</button><div>{{test1.testMessage}}</div>'
})
.component('testscope2', {	
	modules:['test2'],
	template:'<div>{{message}} </div><div>{{test2.testMessage}} </div> <button ng-click="test2.runTest()" >test</button><div>{{test2.testMessage}}</div>'
})

