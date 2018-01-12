/*
var app = ngTasks.getApp();


angular.module('client', ['ngFileUpload'])

.service('client',['$http', 'Upload', '$$msgbox', function($http, $upload, $$msgbox){

    
}])
*/

// //this service will handle all requset to the database
// .service('$$db',['client', '$$msgbox', function(client, msgbox){

//   function collection(collName){
//         this.name = collName;

//       function find(request, callBack){
//             request.method = 'POST';
//             request.path ='/db/getData';
//             request.collName = this.name

//             client.requestHandler(request, function(err, orders){
//                 if (typeof callBack === 'function') {
//                     callBack(orders)
//                 }else{
//                     return orders
//                 }
//             })
//         }


//       function insert(request, callBack){
//             request.method = 'PUT';
//             request.path ='/db/insertData';
//             request.collName = this.name
//             client.requestHandler(request, function(err, orders){
//                 if (typeof callBack === 'function') {
//                     callBack(orders)
//                 }else{
//                     return orders
//                 }
//             })
//         }

//       function delete(request, callBack){
//             request.method = 'PUT';
//             request.path = '/db/deleteData';
//             request.collName = this.name
//             client.requestHandler(request, function(err, data){
//                 if (typeof callBack === 'function') {
//                     callBack(data)
//                 }else{
//                     return data
//                 }
//             })
//         }

//       function update(request, callBack){
//             request.method = 'PUT';
//             request.path = '/db/updateData';
//             request.collName = this.name
//             client.requestHandler(request, function(err, data){
//                 if (typeof callBack === 'function') {
//                     callBack(data)
//                 }else{
//                     return data
//                 }
//             })
//         }

//         this.replace = function(request, callBack){
//             request.method = 'PUT';
//             request.path = '/db/app/replace';
//             request.collName = this.name
//             client.requestHandler(request, function(err, data){
//                 if (typeof callBack === 'function') {
//                     callBack(data)
//                 }else{
//                     return data
//                 }
//             })
//         }

//         this.xlInsert = function(request, callBack){
//             request.path ='/db/excelFileHandler/insert';
//             request.collName = this.name
//             client.fileUploadHandler(request, function(err, orders){
//                 if (typeof callBack === 'function') {
//                     callBack(orders)
//                 }else{
//                     return orders
//                 }
//             })
//         }

//         this.xlUpdate = function(request, callBack){
//             request.path ='/db/excelFileHandler/update';
//             request.collName = this.name;
//             client.fileUploadHandler(request, function(err, orders){
//                 if (typeof callBack === 'function') {
//                     callBack(orders)
//                 }else{
//                     return orders
//                 }
//             })
//         }
//         this.xlDownload = function(request, callBack){
//             request.method = 'PUT';
//             request.path = '/db/app/setXlDownload';
//             request.collName = this.name;

//             client.requestHandler(request, function(err, data){
//                 if(err){
//                     callBack(null);
//                 }else if(data){
//                     window.open('db/app/xlDownload/'+ data._id)
//                     callBack(data);
//                 }else{
//                     msgbox.showMsg('Download Failed!!!')
//                 }
//             })
//         }

//         this.sysNotificationsChecks = function(){
//             request.path = '/sysnotifications/asinDataCheck'

//         }

//         return this
//     }

//     this.app = {};

//     this.app.getOrders = function(request, callBack){
//         request.method = 'PUT';
//         request.path = '/db/app/getOrders';

//         client.requestHandler(request, function(err, data){
//             if(err){
//                 callBack(null);
//             }else{
//                 callBack(data);
//             }
//         })
//     }
    
//     this.app.ordersDownload = function(request, callBack){
//         request.method = 'PUT';
//         request.path = '/db/app/ordersDownload';

//         client.requestHandler(request, function(err, data){
//             if(err){
//                 callBack(null);
//             }else{
//                 window.open('db/export/toexcel/'+ data._id +'/' + 'Orders Download ' + moment().format("MMM Do YY"))
//                 callBack(data);
//             }
//         })
//     }

//     this.app.xlDownload = function(request, callBack){
//         request.method = 'PUT';
//         request.path = '/db/app/setXlDownload';

//         client.requestHandler(request, function(err, data){
//             if(err){
//                 callBack(null);
//             }else{
//                 window.open('/db/app/xlDownload/' + request.setTasks.join(",") + '/' + data._id); 
//                 callBack(data);
//             }
//         })
//     }

//     this.boxing ={}

//     function cb(){
        
//     }
//     this.boxing.insertBoxes = function(request, callBack){
//         request.method = 'PUT';
//         request.path = '/db/boxing/insertBoxes';
//         request.collName = 'boxing'
//         client.requestHandler(request, function(err, data){
//             if(err){
//                 callBack(err);
//             }else{
//                 callBack(null, data);
//             }
//         })
//     }

//     this.boxing.addToBox = function(request, callBack){
//         request.method = 'PUT';
//         request.path = '/db/boxing/addToBox';
//         request.collName = 'boxes'
//         client.requestHandler(request, function(err, data){
//             if(err){
//                 callBack(err);
//             }else{
//                 callBack(null, data);
//             }
//         })
//     }

//     this.boxing.updateOrder = function(request, callBack){
//         request.method = 'PUT';
//         request.path = '/db/boxing/updateOrder';
//         request.collName = 'orders'
//         client.requestHandler(request, function(err, data){
//             if(err){
//                 callBack(err);
//             }else{
//                 callBack(null, data);
//             }
//         })
//     }
//     this.boxing.undoOrders = function(request, callBack){
//         request.method = 'PUT';
//         request.path = '/db/boxing/undoOrders';
//         request.collName = 'orders'
//         client.requestHandler(request, function(err, data){
//             if(err){
//                 callBack(err);
//             }else{
//                 callBack(null, data);
//             }
//         })
//     }
//     this.boxing.undoBoxing = function(request, callBack){
//         request.method = 'PUT';
//         request.path = '/db/boxing/undoBoxing';
//         request.collName = 'boxes'
//         client.requestHandler(request, function(err, data){
//             if(err){
//                 callBack(err);
//             }else{
//                 callBack(null, data);
//             }
//         })   
//     }
//     this.boxing.recordLabesl = function(request, callBack){
//         request.method = 'PUT';
//         request.path = '/db/boxing/recordLabesl';
        
//         client.requestHandler(request, function(err, data){
//             if(err){
//                 callBack(err);
//             }else{
//                 callBack(null, data);
//             }
//         })   
//     }
//     this.labelPrinter ={};

//     this.labelPrinter.printLabels = function(request, callBack){
//         request.method = 'PUT';
//         //request.path = 'http://localhost:1100/labelPrinter/printLabels';
//         request.path = 'http://dev7:1100/labelPrinter/printLabels';

//         client.requestHandler(request, function(err, data){
//             if(err){
//                 callBack();
//             }else{
//                 callBack(data);
//             }
//         })   
//     }

// }])

