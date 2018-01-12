angular.module('msgbox', [])

.service('msgbox', function(){
    var msgbox = this;

    msgbox.reset = function(){
        //Default msgbox values
        msgbox.show = false;
        msgbox.enabled = true;

        msgbox.message = '';

        msgbox.button1 = {
            caption:'Ok',
            clickAction:msgbox.reset,
            show:true
        }

        msgbox.button2 = {
            caption:'Cancel',
            clickAction:msgbox.reset,
            show:false
        }

        msgbox.msgBack = {
            clickAction:msgbox.reset,
            show:true,            
            style:''
        }

        
    }

    msgbox.showMsg = function(msg, btn1Opt, btn2Opt, msgBackOpt){        
        msgbox.message = msg;

        if(btn1Opt){
            var pNames = Object.getOwnPropertyNames(btn1Opt);
            for (var i = 0; i < pNames.length; i++) {
                msgbox.button1[pNames[i]] = btn1Opt[pNames[i]]
            }

        }
        if(btn2Opt){
            var pNames = Object.getOwnPropertyNames(btn2Opt);
            for (var i = 0; i < pNames.length; i++) {
                msgbox.button2[pNames[i]] = btn2Opt[pNames[i]]
            }
            
        }
        if(msgBackOpt){
            var pNames = Object.getOwnPropertyNames(msgBackOpt);
            for (var i = 0; i < pNames.length; i++) {
                msgbox.msgBack[pNames[i]] = msgBackOpt[pNames[i]]
            }
            
        }

        msgbox.show = true;
    }

    //executes a multiTaskHandler while msgbox is disabled
    //so if you have a long multiTaskHandler with some msgbox there in 
    msgbox.disableWhile = function(mth, callBack, args){        
        
        msgbox.enabled = false;
        var cb = function(err, results){
            msgbox.reset();
            if(err){
                callBack(err);
            }else{
                callBack(null, results);
            }
        }

        args = (Array.isArray(args)) ? args : [args];

        args.unshift(cb);

        mth.runTasks.apply(mth.runTasks, args)    
    }

    msgbox.reset();
})


//this directive will tabke an attribute the will be used to choose between different msgbox templates
//or perhaps i can user ng-switch and values in the controller to switch between msgbox types
.directive('msgbox', function(){
    return {
        restrict : "E",
        templateUrl : "templates/msgbox.html"
    };
})

