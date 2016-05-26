(function(app) {

	app.components.homeTest = ng.core.Component({
		selector: 'home-test',
		templateUrl: "templates/home_test.html",
	})
	.Class({
		constructor: function(router){
			if( app.settings.verbose )
				console.log("HomeTest");

			
		},
		ngOnInit: function(){
			Promise.all([
				SystemJS.import('app/graphUtils.js'),
				SystemJS.import('lib/d3/3.5.16/d3.min.js'),				
			]).then(function(modules) {
				app.graphUtils.generic2DGraph("graph", [0,1,2], [0,1,2], 600,300);
			});
			
			// app.graphUtils.generic2DGraph("graph", [0,1,2], [0,1,2], 600,300);
			// var _this = this;
			// this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'phazer-game-test', { preload: preload, create: create });

			// function preload () {
			// 	_this.game.load.image('logo', 'img/phaser.png');
			// }

			// function create () {
			// 	var logo = _this.game.add.sprite( _this.game.world.centerX, _this.game.world.centerY, 'logo');
			// 	logo.anchor.setTo(0.5, 0.5);
			// }
		},
		ngOnDestroy: function(){
			// this.game.destroy();
		}
	});

})(window.app || ( window.app = { components:{} } ));