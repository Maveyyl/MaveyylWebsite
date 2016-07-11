(function(app) {

	app.components.mnist = ng.core.Component({
		selector: 'mnist',
		templateUrl: "templates/machine_learning/mnist.html",
	})
	.Class({
		constructor: function(router){
			if( app.settings.verbose )
				console.log("Mnist");
		},
		ngOnInit: function(){
			var _this = this;


			Promise.all([

			]).then(function(modules) {
				
			});
		},
		ngOnDestroy: function(){

		}
	});



})(window.app || ( window.app = { components:{} } ));