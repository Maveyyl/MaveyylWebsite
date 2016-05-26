var constants = require("./constants.js");
var ml = require("../../lib/MLJS/ml.js");

module.exports = Creature;

/*************************************************************************
 * Creature
 ************************************************************************/
 function Creature(world, tile){
	this.world = world;
	this.tile = tile;
	this.type = constants.entities.creature;

	this.learning_rate = constants.learning_rate;
	this.regularization_parameter = constants.regularization_parameter;

	this.just_ate = false;
	this.near_food = false;
	this.last_meal = 0;

	this.epsilon = constants.epsilon_max;
	this.random = true;


	this.sensors = new Array(constants.sensors.count).fill(0);

	var theta = ml.ml_utils.nn_theta_create( constants.network );
	theta = ml.ml_utils.nn_theta_random_init( theta, constants.theta_init_lower_range, constants.theta_init_upper_range, true);

	var config = {
		learning_rate: this.learning_rate,
		regularization_parameter: this.regularization_parameter
	};

	this.nn = ml.linear_neural_network( [[]], [], theta, config);
	
}


/*
 * get_updated_sensors
 * computes en returns updates sensors of the creature in the world for a given tile
 */
Creature.prototype.get_updated_sensors = function(tile){
	var sensors = new Array(constants.sensors.count).fill(0);

	// for every direction
	var selected_tile;
	for(var direction=0;direction<constants.directions.count;direction++){
		selected_tile = tile;

		// for each tile in sight of sensors
		done = false;
		for(var t=0;t<constants.sensors_range && !done;t++){
			selected_tile = selected_tile.get_neighbour_tile( direction );

			if( selected_tile.entity_type !== constants.entities.none ){
				done = true; // terminate the sight loop because the creatue can't see tiles behind an object
				// set sensors according to object detected and detection distance
				if( selected_tile.entity_type === constants.entities.plant ){
					if( !selected_tile.entity.dead )
						sensors[direction] = Math.pow(constants.sensors_range -t,2) * constants.sensors_distance_detection_value;
					else
						sensors[direction+4] = Math.pow(constants.sensors_range -t,2) * constants.sensors_distance_detection_value;
				}
				if( selected_tile.entity_type === constants.entities.food ){
					sensors[direction+8] = Math.pow(constants.sensors_range -t,2) * constants.sensors_distance_detection_value;
				}
			}
		}
	}

	return sensors;
};
/*
 * get_predictions
 * computes and returns the predictions of the creature in the world for a given sensors and and for all possible actions
 */
Creature.prototype.get_predictions = function( sensors ){
	return this.nn.predict( sensors );
};


/*
 * compute_reward
 * computes and returns the reward of the creature in the world for a given tile and a given action
 */
Creature.prototype.compute_reward = function(tile, action){

	var reward = constants.rewards.neutral;
	var goal_reached = false;
	// if moving and nothing is on the target tile
	if( action < constants.actions.stay ){
		var tmp_tile = tile.get_neighbour_tile(action);
		if(  tmp_tile.entity_type === constants.entities.none ){
			// move reward
		}
		else{
			reward = constants.rewards.forbidden_action;
		}
	}
	// if not a move action
	else if ( action > constants.actions.stay ){
		// get neighbour tiles	
		var neighbour_tiles = new Array(4);
		for(var direction= 0;direction<constants.directions.count;direction++){
			neighbour_tiles[direction] = tile.get_neighbour_tile(direction);
		}

		// if hit action
		if( action === constants.actions.hit ){
			var hit = false;
			for(var direction= 0;direction<constants.directions.count;direction++){
				// if neighbour tile is an alive plant
				if( neighbour_tiles[direction].entity_type === constants.entities.plant && !neighbour_tiles[direction].entity.dead ){
					// hit reward
					hit = true;
				}
			}
			if( !hit )
				reward = constants.rewards.forbidden_action;
		}
		// if eat action
		else if( action === constants.actions.eat ){
			var eat = false;
			for(var direction= 0;direction<constants.directions.count;direction++){
				// if neighbour tile is food
				if( neighbour_tiles[direction].entity_type === constants.entities.food ){
					// eat reward
					reward = constants.rewards.eat;
					goal_reached = true;
					eat = true;
				}
			}
			if (!eat)
				reward = constants.rewards.forbidden_action;
		}
	}
	else{
		reward = constants.rewards.no_move;
	}

	// if( reward !== constants.rewards.eat ){
	// 	reward = reward - this.last_meal;
	// 	if( reward < 0 ) reward = 0;
	// }

	return reward;
};




/*
 * apply_action
 * apply a given action of the creature in its world
 */
Creature.prototype.apply_action = function(action){

	// if moving action
	if( action < constants.actions.stay ){
		var direction = action;
		var tile = this.tile.get_neighbour_tile(direction);

		// if nothing in the target tile
		if(  tile.entity_type === constants.entities.none ){
			// move to the target tile
			this.tile.set_empty();
			tile.set_entity(this);
		}
	}
	// if action that is not moving but not stay
	else if ( action > constants.actions.stay ){
		// get neighbour tiles	
		var neighbour_tiles = new Array(4);
		for(var direction= 0;direction<constants.directions.count;direction++){
			neighbour_tiles[direction] = this.tile.get_neighbour_tile(direction);
		}

		// if hit action
		if( action === constants.actions.hit ){
			for(var direction= 0;direction<constants.directions.count;direction++){
				if( neighbour_tiles[direction].entity_type === constants.entities.plant ){
					neighbour_tiles[direction].entity.get_hit();
				}
			}
		}
		// if eat action
		if( action === constants.actions.eat ){
			for(var direction= 0;direction<constants.directions.count;direction++){
				if( neighbour_tiles[direction].entity_type === constants.entities.food ){
					neighbour_tiles[direction].entity.get_eaten();
					this.just_ate = true;
					this.last_meal = 0;
				}
			}
		}
	}
	if( !this.just_ate )
		this.last_meal++;
};


Creature.prototype.update = function( verbose){
	this.epsilon = this.epsilon - constants.epsilon_step;
	if( this.epsilon < constants.epsilon_min ) this.epsilon = constants.epsilon_min;

	this.just_ate = false;
	this.near_food = false;

	// update sensors
	this.sensors = this.get_updated_sensors(this.tile);
	if( Math.max(...this.sensors.slice(8,12)) > 0  )
		this.near_food = true;
	

	// predict reward for all possible actions
	var predictions = this.get_predictions(this.sensors);

	// take a decision
	var action_choice;
	if( Math.random() < this.epsilon ){
		action_choice = Math.floor(Math.random()* constants.actions.count);
		this.random = true;
	}
	else{
		action_choice = predictions.indexOf( Math.max(...predictions) );
		this.random = false;
	}


	// compute reward
	var reward = this.compute_reward(this.tile, action_choice);

	// applying choosen action
	this.apply_action(action_choice);

	// update reward with futur possible reward
	if( !this.just_ate ){
		var next_sensors = this.get_updated_sensors(this.tile);
		var next_predictions = this.get_predictions(next_sensors);
		reward = reward + constants.discount_factor * Math.max(...next_predictions);
	}


	// learn
	var rewards = predictions.slice();
	rewards[action_choice] = reward;
	this.nn.online_gradient_descent ( this.sensors, rewards );


	if(verbose){
		console.log("Creature update");
		console.log("sensors: ", this.sensors);
		console.log("predictions: ", predictions);
		console.log("action: ", action_choice);
		console.log("reward: ", reward);
		console.log("greedy: ", !this.random, this.epsilon);
		console.log("error: ", this.nn.J[ this.nn.J.length-1]);
	}
};
