console.log
angular.module('app', [
    'ui.router',
])
.config([
    '$urlRouterProvider',
    '$stateProvider',
    function($urlRouterProvider, $stateProvider){
        $urlRouterProvider.otherwise('/tasksJS');

        $stateProvider
            .state('tasksJS',{
                url:'/tasksJS',
                templateUrl:'templates/main.html'
            })
        
    }
])

.directive('tbl', function(){
    return {
        restrict : "E",
        templateUrl : "templates/tbl.html"
    };
})

.filter('$$unsafe', function($sce){ 

    return function(data){

        if(!isNaN(data) && data !== null){
            data = data.toString();
        }
        return $sce.trustAsHtml(data); 
    }
})
