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
			var _this = this;
			Promise.all([
				SystemJS.import('lib/phaser/2.4.8/phaser.js'),
				SystemJS.import('app/QLearningExperiment1/constants.js'),
				SystemJS.import('app/QLearningExperiment1/World.js'),
				SystemJS.import('lib/d3/3.5.16/d3.min.js'),
				SystemJS.import('app/graphUtils.js'),
			]).then(function(modules) {
				var constants = modules[1];
				var World = modules[2];
				_this.world_sprite_size = 26;

				_this.game = new Phaser.Game(constants.map_size * _this.world_sprite_size +1 , constants.map_size * _this.world_sprite_size + 1, Phaser.AUTO, 'experiment-1-phaser', { preload: preload, create: create, update: update });

				function preload () {
					_this.game.load.image('logo', 'img/phaser.png');
					_this.game.load.image('dead_plant', 'img/dead_plant.png');
					_this.game.load.image('food', 'img/food.png');
					_this.game.load.image('grass', 'img/grass.png');
					_this.game.load.image('plant', 'img/plant.png');
					_this.game.load.image('creature', 'img/creature.png');
				}

				function create () {
					_this.world = new World();

					// var logo = _this.game.add.sprite( _this.game.world.centerX, _this.game.world.centerY, 'logo');
					// logo.anchor.setTo(0.5, 0.5);

					_this.sprites = new Array(_this.world.map_size);
					for(var y=0;y<_this.world.map_size;y++){
						_this.sprites[y] = new Array(_this.world.map_size).fill(undefined);
						for(var x=0;x<_this.world.map_size;x++){
							_this.game.add.sprite( 1+x*_this.world_sprite_size,1+ y*_this.world_sprite_size, "grass");
						}
					}

					// allow app to still work if focus is lost
					_this.game.stage.disableVisibilityChange = true;
					// will resize at best the canvas and keep aspect ratio
					_this.game.scale.scaleMode = 2;

					_this.update_per_tick = 100;
					_this.stats_update = _this.update_per_tick*10;
					_this.cumul_error = 0;
					_this.cumul_near_food = 0;
					_this.cumul_eat = 0;
					_this.cumul_behavior = 0;

					_this.avg_error = [];
					_this.avg_near_food = [];
					_this.avg_eat = [];
					_this.avg_behavior = [];

					_this.iterations = [];

				}

				function update(e){
					if( _this.world.creature.nn.J.length % _this.stats_update === 0 ){
						_this.avg_error.push( _this.cumul_error / _this.stats_update );
						_this.avg_near_food.push( _this.cumul_near_food / _this.stats_update );
						_this.avg_eat.push( _this.cumul_eat / (_this.cumul_near_food+1) );
						_this.avg_behavior.push( _this.cumul_behavior / _this.stats_update );


						_this.iterations.push( _this.world.creature.nn.J.length );
						_this.cumul_error = 0;
						_this.cumul_near_food = 0;
						_this.cumul_eat = 0;
						_this.cumul_behavior = 0;

						app.graphUtils.generic2DGraph("agv-error", _this.iterations,  _this.avg_error, 200);
						app.graphUtils.generic2DGraph("agv-near_food", _this.iterations,  _this.avg_near_food, 200);
						app.graphUtils.generic2DGraph("agv-eat", _this.iterations,  _this.avg_eat, 200);
						app.graphUtils.generic2DGraph("agv-behavior", _this.iterations,  _this.avg_behavior, 200);

						if( _this.iterations.length === 50 ){
							var avg_error_tmp = [];
							var avg_near_food_tmp = [];
							var avg_eat_tmp = [];
							var avg_behavior_tmp = [];
							var iterations_tmp = [];

							for(var i=0;i<50;i=i+2){
								avg_error_tmp.push( (_this.avg_error[i] + _this.avg_error[i+1])/2 ) ;
								avg_near_food_tmp.push( (_this.avg_near_food[i] + _this.avg_near_food[i+1])/2 ) ;
								avg_eat_tmp.push( (_this.avg_eat[i] + _this.avg_eat[i+1])/2 ) ;
								avg_behavior_tmp.push( (_this.avg_behavior[i] + _this.avg_behavior[i+1])/2 ) ;
								iterations_tmp.push( (_this.iterations[i] + _this.iterations[i+1])/2 ) ;
								// console.log(_this.iterations[i],  _this.iterations[i+1], iterations_tmp[iterations_tmp.length-1]);
							}

							_this.avg_error = avg_error_tmp;
							_this.avg_near_food = avg_near_food_tmp;
							_this.avg_eat = avg_eat_tmp;
							_this.avg_behavior = avg_behavior_tmp;
							_this.iterations = iterations_tmp;
								_this.stats_update = _this.stats_update*2;
						}
					}

					for(var i=0;i<_this.update_per_tick;i++){
						_this.world.update();
						_this.cumul_error += _this.world.creature.nn.J[ _this.world.creature.nn.J.length -1];
						_this.cumul_near_food += _this.world.creature.near_food;
						_this.cumul_eat += _this.world.creature.just_ate;
						_this.cumul_behavior += _this.world.creature.random;
					}

					for(var y=0;y<_this.world.map_size;y++){
						for(var x=0;x<_this.world.map_size;x++){
							if( _this.sprites[y][x] !== undefined){
								_this.sprites[y][x].destroy();
								_this.sprites[y][x] = undefined;
							}

							if( _this.world.map[y][x].entity_type === constants.entities.creature )
								_this.sprites[y][x] = _this.game.add.sprite( 1+x*_this.world_sprite_size, 1+y*_this.world_sprite_size, "creature");

							if( _this.world.map[y][x].entity_type === constants.entities.plant && !_this.world.map[y][x].entity.dead )
								_this.sprites[y][x] = _this.game.add.sprite( 1+x*_this.world_sprite_size, 1+y*_this.world_sprite_size, "plant");

							if( _this.world.map[y][x].entity_type === constants.entities.plant && _this.world.map[y][x].entity.dead )
								_this.sprites[y][x] = _this.game.add.sprite( 1+x*_this.world_sprite_size, 1+y*_this.world_sprite_size, "dead_plant");

							if( _this.world.map[y][x].entity_type === constants.entities.food )
								_this.sprites[y][x] = _this.game.add.sprite( 1+x*_this.world_sprite_size, 1+y*_this.world_sprite_size, "food");
						}
					}
				}

			});
		},
		ngOnDestroy: function(){
			this.game.destroy();
		}
	});

})(window.app || ( window.app = { components:{} } ));