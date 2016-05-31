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


			Promise.all([
				SystemJS.import('lib/phaser/2.4.8/phaser.js'),
				SystemJS.import('app/QLearningExperiment2/constants.js'),
				SystemJS.import('app/QLearningExperiment2/World.js'),
				SystemJS.import('lib/d3/3.5.16/d3.min.js'),
				SystemJS.import('app/graphUtils.js'),
			]).then(function(modules) {

				// besides constants are automatically being imported thanks to World.js we want constants to be readable from here
				_this.constants = modules[1];
				var World = modules[2];

				// sprites are 25x25 pixel but we want a pixel more just to separate the tiles with a line
				_this.world_sprite_size = 26;

				// we create a Phaser panel according to the sprite size and world map size
				_this.game = new Phaser.Game( 
					_this.constants.map_size * _this.world_sprite_size + 1, 
					_this.constants.map_size * _this.world_sprite_size + 1, 
					Phaser.AUTO, 
					'experiment-2-phaser', 
					{ 
						preload: preload, 
						create: create, 
						update: update
					}
				);

				// create a Phaser Time object to manage time efficiently
				_this.game.time = new Phaser.Time(_this.game);

				// function in charge of preloading assets of the Phaser game
				function preload () {
					_this.game.load.image('ground', 'img/experiment2/ground.png');
					_this.game.load.image('creature', 'img/experiment2/creature.png');
					_this.game.load.image('small_plant', 'img/experiment2/small_plant.png');
					_this.game.load.image('medium_plant', 'img/experiment2/medium_plant.png');
					_this.game.load.image('big_plant', 'img/experiment2/big_plant.png');
				}

				// function in charge of initializing the Phaser game
				function create () {
					// We create the world of our simulation
					// will randomply set objects and everything up according to constant.js data
					_this.world = new World();

					// we draw a ground sprite for every tile of the world
					// we also maintain an array of sprites to draw on the top of the ground tiles
					_this.sprites = new Array(_this.world.map_size);
					for(var y=0;y<_this.world.map_size;y++){
						_this.sprites[y] = new Array(_this.world.map_size).fill(undefined);
						for(var x=0;x<_this.world.map_size;x++){
							_this.game.add.sprite( 1 + x*_this.world_sprite_size, 1+ y*_this.world_sprite_size, "ground");
						}
					}

					// allow Phaser app to still work if focus is lost
					_this.game.stage.disableVisibilityChange = true;

					// will resize the Phaser app at best and keep aspect ratio
					_this.game.scale.scaleMode = 2;

					// how many logic update per phaser update we want to perform
					// this var represents how many simulation updates per second we want
					_this.updates_per_second = 1;
					// this is to keep track of the elapsed time since last simulation updates
					_this.elapsed_time_cumul = 0;
					// how often we want to compute stats and update graphes per simulation updates
					_this.stats_update = _this.updates_per_second * 100;
					// maximum number of dot to be displayed on graphes
					_this.max_graph_dots = 200;

					// var used to compute averages of stat graphes
					_this.cumul_error = 0;
					_this.cumul_random_behavior = 0;
					_this.cumul_plant_nearby = 0;
					_this.cumul_big_plant_nearby = 0;
					_this.cumul_eat = 0;
					_this.cumul_feed = 0;

					// raw data that we will provide to our graphes
					_this.avg_error = [];
					_this.avg_random_behavior = [];
					_this.avg_plant_nearby = [];
					_this.avg_big_plant_nearby = [];
					_this.avg_eat = [];
					_this.avg_feed = [];

					_this.iterations = [];


					// create graphes to display our stats
					_this.avg_error_graph = app.graphUtils.generic2DGraph("agv-error", _this.iterations,  _this.avg_error, 150);
					_this.avg_random_behavior_graph = app.graphUtils.generic2DGraph("agv-behavior", _this.iterations,  _this.avg_random_behavior, 150);
					_this.avg_plant_nearby_graph = app.graphUtils.generic2DGraph("agv-near-food", _this.iterations,  _this.avg_plant_nearby, 150);
					_this.avg_big_plant_nearby_graph = app.graphUtils.generic2DGraph("agv-eat", _this.iterations,  _this.avg_big_plant_nearby, 150);
					_this.avg_eat_graph = app.graphUtils.generic2DGraph("agv-near-plant", _this.iterations,  _this.avg_eat, 150);
					_this.avg_feed_graph = app.graphUtils.generic2DGraph("agv-hit", _this.iterations,  _this.avg_feed, 150);

					_this.nn_graph = app.graphUtils.neuralNetworkGraph("nn-graph", _this.constants.network, _this.world.creature.nn.theta, 500);

					window.creature = _this.world.creature;
				}

				function update(e){

					// computes how much simulation update must be done during this phaser update
					// according to elapsed time since last simulation update
					_this.elapsed_time_cumul += _this.game.time.elapsedMS;
					var updates_to_do = Math.floor( (_this.updates_per_second * _this.elapsed_time_cumul)/1000 ) ;

					_this.elapsed_time_cumul = _this.elapsed_time_cumul - (updates_to_do*1000/_this.updates_per_second);

					// for each simulation updates to be done
					for(var i=0;i<updates_to_do;i++){
						// if we've reached a sufficient amount of simulation update we compute our stats
						if( _this.world.creature.nn.iter_count % _this.stats_update === 0 ){

							// compute new stats and add them to data
							_this.avg_error.push( _this.cumul_error / _this.stats_update );
							_this.avg_random_behavior.push( _this.cumul_random_behavior / _this.stats_update );
							_this.avg_plant_nearby.push( _this.cumul_plant_nearby / _this.stats_update );
							_this.avg_big_plant_nearby.push( _this.cumul_big_plant_nearby / _this.stats_update );
							_this.avg_eat.push( _this.cumul_eat / (_this.cumul_plant_nearby+1) );
							_this.avg_feed.push( _this.cumul_feed / (_this.cumul_plant_nearby - _this.cumul_big_plant_nearby+1) );
							_this.iterations.push( _this.world.creature.nn.iter_count );

							// update the graphes displaying the stats
							_this.avg_error_graph.update( _this.iterations,  _this.avg_error);
							_this.avg_random_behavior_graph.update( _this.iterations,  _this.avg_random_behavior);
							_this.avg_plant_nearby_graph.update( _this.iterations,  _this.avg_plant_nearby);
							_this.avg_big_plant_nearby_graph.update( _this.iterations,  _this.avg_big_plant_nearby);
							_this.avg_eat_graph.update( _this.iterations,  _this.avg_eat);
							_this.avg_feed_graph.update( _this.iterations,  _this.avg_feed);
							// _this.nn_graph = app.graphUtils.neuralNetworkGraph("nn-graph", _this.constants.network, _this.world.creature.nn.theta, 700);
							_this.nn_graph.update( _this.world.creature.nn.theta);

							// reset the cumulatives in order to compute the next cycle of averages
							_this.cumul_error = 0;
							_this.cumul_random_behavior = 0;
							_this.cumul_plant_nearby = 0;
							_this.cumul_big_plant_nearby = 0;
							_this.cumul_eat = 0;
							_this.cumul_feed = 0;


							// if there's more than 200 dots to display per graph
							// compute averages couples of data and reduce the amount of data to 100
							if( _this.iterations.length === _this.max_graph_dots ){

								_this.avg_error = data_couple_average( _this.avg_error );
								_this.avg_random_behavior = data_couple_average( _this.avg_random_behavior );
								_this.avg_plant_nearby = data_couple_average( _this.avg_plant_nearby );
								_this.avg_big_plant_nearby = data_couple_average( _this.avg_big_plant_nearby );
								_this.avg_eat = data_couple_average( _this.avg_eat );
								_this.avg_feed = data_couple_average( _this.avg_feed );
								_this.iterations = data_couple_average( _this.iterations );

								// increase by 2 the number of update cycle before computing stats
								_this.stats_update = _this.stats_update*2;
							}

							// flush J or it can grow to millions of entries
							_this.world.creature.nn.J = [];
						}

						_this.world.update();
						_this.cumul_error += _this.world.creature.nn.J[ _this.world.creature.nn.J.length -1];
						_this.cumul_random_behavior += _this.world.creature.track.random_behavior;
						_this.cumul_plant_nearby += _this.world.creature.track.plant_nearby;
						_this.cumul_big_plant_nearby += _this.world.creature.track.big_plant_nearby;
						_this.cumul_eat += _this.world.creature.track.ate_plant;
						_this.cumul_feed += _this.world.creature.track.fed_plant;
					}

					// update the rendering
					if( _this.render )
						update_phaser_rendering( _this.game, _this.sprites, _this.world, _this.constants, _this.world_sprite_size)
				}

			});

			this.speed_times_2 = function(){
				this.updates_per_second = this.updates_per_second*2;
			},
			this.speed_divided_by_2 = function(){
				this.updates_per_second = this.updates_per_second/2;
			}
		},
		ngOnDestroy: function(){
			this.game.destroy();
		}
	});


	// function that computes average two entries by two entries and outputs a two times smaller array
	function data_couple_average( array ){
		var I = array.length/2;
		var array2 = new Array(I);
		for(var i=0;i<I;i++){
			array2[i] = (array[i*2] + array[i*2+1]) / 2;
		}

		return array2;
	}

	function update_phaser_rendering( game, sprites, world, constants, sprite_size){
		for(var y=0;y<world.map_size;y++){
			for(var x=0;x<world.map_size;x++){
				if( sprites[y][x] !== undefined){
					sprites[y][x].destroy();
					sprites[y][x] = undefined;
				}

				if( !world.map[y][x].empty ){
					if( world.map[y][x].entity.type === constants.entities.creature )
						sprites[y][x] = game.add.sprite( 1+x* sprite_size, 1+y*sprite_size, "creature");

					if( world.map[y][x].entity.type  === constants.entities.small_plant )
						sprites[y][x] = game.add.sprite( 1+x*sprite_size, 1+y*sprite_size, "small_plant");

					if( world.map[y][x].entity.type  === constants.entities.medium_plant )
						sprites[y][x] = game.add.sprite( 1+x*sprite_size, 1+y*sprite_size, "medium_plant");

					if( world.map[y][x].entity.type  === constants.entities.big_plant )
						sprites[y][x] = game.add.sprite( 1+x*sprite_size, 1+y*sprite_size, "big_plant");
				}
			}
		}

	}

})(window.app || ( window.app = { components:{} } ));