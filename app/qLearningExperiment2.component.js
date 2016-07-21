(function(app) {

	app.components.qLearningExperiment2 = ng.core.Component({
		selector: 'q-learning-experiment-2',
		templateUrl: "templates/machine_learning/q_learning_experiment_2.html",
	})
	.Class({
		constructor: function(router){
			if( app.settings.verbose )
				console.log("QLearningExperiment2");
		},
		ngOnInit: function(){
			var _this = this;

		},
		ngOnDestroy: function(){
		}
	});


	

})(window.app || ( window.app = { components:{} } ));