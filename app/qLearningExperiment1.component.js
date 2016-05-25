(function(app) {

	app.components.qLearningExperiment1 = ng.core.Component({
		selector: 'q-learning-experiment-1',
		templateUrl: "templates/machine_learning/q_learning_experiment_1.html",
	})
	.Class({
		constructor: function(router){
			if( app.settings.verbose )
				console.log("HomeTest");
		},
		ngOnInit: function(){
			// app.graph_utils.generic_2D_graph("graph", [0,1,2], [0,1,2], 600,300);
			var _this = this;
			this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'experiment-1-phaser', { preload: preload, create: create });

			function preload () {
				_this.game.load.image('logo', 'img/phaser.png');
			}

			function create () {
				var logo = _this.game.add.sprite( _this.game.world.centerX, _this.game.world.centerY, 'logo');
				logo.anchor.setTo(0.5, 0.5);
			}
		},
		ngOnDestroy: function(){
			this.game.destroy();
		}
	});

})(window.app || ( window.app = { components:{} } ));