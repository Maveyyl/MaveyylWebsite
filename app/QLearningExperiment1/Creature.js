var constants = require("./constants.js");
var ml = require("../../lib/MLJS/ml.js");

module.exports = Creature;

/*************************************************************************
 * Creature
 ************************************************************************/
 function Creature(world){
	this.world = world;
	this.tile = undefined;

	this.type = constants.entities.creature;

	this.learning_rate = constants.learning_rate;
	this.regularization_parameter = constants.regularization_parameter;

	this.random_behavior_probability = constants.epsilon_max;
	
	this.experience_replay = constants.experience_replay;
	if( this.experience_replay ){
		this.experiences = [];
		this.experience_pool_size = constants.experience_pool_size;
		this.experience_replay_count = constants.experience_replay_count;
	}


	this.sensors = new Array(constants.sensors.count).fill(0);

	// var theta = ml.ml_utils.nn_theta_create( constants.network );
	// theta = ml.ml_utils.nn_theta_random_init( theta, constants.theta_init_lower_range, constants.theta_init_upper_range, true);



	// this.nn = ml.linear_neural_network( [[]], [], theta, config);

	function random_init(input, output){
		var r = constants.random()*2 - 1;
		r = r * 2 / ( input + output );
		return r;
	}


	this.nn = new ml.NeuralNetwork( ml.ml_utils.MSE, ml.ml_utils.MSE_derivative );
	for(var i=1;i<constants.network.length;i++){
		this.nn.add_layer(
			new ml.FullyConnectedLayer( constants.network[i-1], constants.network[i], random_init, ml.ml_utils.ReLU, ml.ml_utils.ReLU_derivative)
		);
	}

	var config = {
		learning_rate: this.learning_rate,
		regularization_parameter: this.regularization_parameter
	};
	this.gd = new ml.GradientDescent( config );
	this.gd_ctx = this.gd.init_gradient_descent_ctx()  ;

	// keep track of what the creature has done, useful for statistics
	this.track = {
		reward: 0,
		random_behavior: false,
		forbidden_action: false,
		did_nothing: false,
		fed_plant: false,
		ate_plant: false,
		plant_nearby: false,
		small_plant_nearby: false,
		medium_plant_nearby: false,
		big_plant_nearby: false
	};
	
}


/*
 * get_updated_sensors
 * computes en returns updates sensors of the creature in the world for a given tile
 */
Creature.prototype.get_updated_sensors = function(tile){
	var sensors = new Array(constants.sensors.count).fill(0);


	// for each directions
	for(var direction=0;direction<constants.directions.count;direction++){
		// scan the adjacent tile and set sensors accordingly
		var next_tile = tile.get_neighbour_tile( direction );
		if( !next_tile.empty && next_tile.entity.type === constants.entities.small_plant)
			sensors[direction] = constants.sensor_activation_value;
		else if( !next_tile.empty && next_tile.entity.type === constants.entities.medium_plant)
			sensors[direction+4] = constants.sensor_activation_value;
		else if( !next_tile.empty && next_tile.entity.type === constants.entities.big_plant)
			sensors[direction+8] = constants.sensor_activation_value;

		// set the "something near" sensors if next tile isn't empty
		if( !next_tile.empty )
			sensors[direction+12] = constants.sensor_activation_value;
		else{
			// else scan for a certain distance the next tiles
			for(var d=1;d<constants.sensor_distance_detection;d++){
				next_tile = next_tile.get_neighbour_tile( direction );
				if( !next_tile.empty )
					sensors[direction+12] = constants.sensor_activation_value / (d+1);
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
Creature.prototype.compute_reward = function(action){
	var reward = constants.rewards.neutral;
	
	// if did nothing
	if( action === constants.actions.do_nothing){
		reward = constants.rewards.no_action;
	}
	// if directional action
	else if( action < 4 ){
		var next_tile = this.tile.get_neighbour_tile(action);
		// if destination tile not empty, forbidden action
		if( !next_tile.empty )
			reward = constants.rewards.forbidden_action;
	}
	// if not directional action
	else {
		// if action is eating plants
		if( action === constants.actions.eat_plants  ){
			// for every directions
			for(var direction=0;direction<constants.directions.count;direction++){
				var next_tile = this.tile.get_neighbour_tile(direction);
				// if action is eating plants while there's a plant on the neighbour tile
				if( !next_tile.empty && 
					(next_tile.entity.type === constants.entities.small_plant ||
					next_tile.entity.type === constants.entities.medium_plant ||
					next_tile.entity.type === constants.entities.big_plant) ){
					reward += constants.rewards.goal * next_tile.entity.get_size();
				}
			}
		}
	}

	return reward;
};




/*
 * apply_action
 * apply a given action of the creature in its world
 */
Creature.prototype.apply_action = function(action){

	// here we compute some data to track
	for(var direction=0;direction<constants.directions.count;direction++){
		var next_tile = this.tile.get_neighbour_tile(direction);
		if( !next_tile.empty && 
			(next_tile.entity.type === constants.entities.small_plant ||
			next_tile.entity.type === constants.entities.medium_plant ||
			next_tile.entity.type === constants.entities.big_plant) ){
			this.track.plant_nearby = true;

			if( next_tile.entity.type === constants.entities.small_plant )
				this.track.small_plant_nearby = true;
			if( next_tile.entity.type === constants.entities.medium_plant )
				this.track.medium_plant_nearby = true;
			if( next_tile.entity.type === constants.entities.big_plant )
				this.track.big_plant_nearby = true;
		}
	}

	// if did nothing
	if( action === constants.actions.do_nothing){
		this.track.did_nothing = true;
	}
	// if directional action
	else if( action < 4 ){
		var next_tile = this.tile.get_neighbour_tile(action);
		// if destination tile not empty, forbidden action
		if( !next_tile.empty )
			this.track.forbidden_action = true;
		else{
			this.tile.set_empty();
			next_tile.set_entity(this);
		}
	}
	// if not directional action
	else {
		// for every directions
		for(var direction=0;direction<constants.directions.count;direction++){
				var next_tile = this.tile.get_neighbour_tile(direction);

			// if action is eating plants
			if( action === constants.actions.eat_plants  ){
				// if action is eating plants while there's a plant on the neighbour tile
				if( !next_tile.empty && 
					( next_tile.entity.type === constants.entities.small_plant ||
					next_tile.entity.type === constants.entities.medium_plant ||
					next_tile.entity.type === constants.entities.big_plant ) ){
					next_tile.entity.get_eaten();
					this.track.ate_plant = true;
				}
			}
			// if action is feeding plant
			if( action === constants.actions.feed_plants  ){
				// if action is feeding plants while there's a plant on the neighbour tile
				if( !next_tile.empty && 
					(next_tile.entity.type === constants.entities.small_plant ||
					next_tile.entity.type === constants.entities.medium_plant ) ){
					next_tile.entity.get_fed();
					this.track.fed_plant = true;
				}
			}
		}
	}



};


Creature.prototype.update = function( ){
	// resseting tracked data
	this.track = {
		reward: 0,
		random_behavior: false,
		forbidden_action: false,
		did_nothing: false,
		fed_plant: false,
		ate_plant: false,
		plant_nearby: false,
		small_plant_nearby: false,
		medium_plant_nearby: false,
		big_plant_nearby: false
	};

	// reduce each turn the probability of having a random behavior until a minimum probability
	if( this.random_behavior_probability > constants.epsilon_min )
		this.random_behavior_probability = this.random_behavior_probability - constants.epsilon_step;

	// update sensors
	this.sensors = this.get_updated_sensors(this.tile);
	
	// predict reward for all possible actions
	var predictions = this.get_predictions(this.sensors);

	// take a decision
	var action_choice;
	if( constants.random() < this.random_behavior_probability ){
		// random decision
		// console.log(z, ra, constants.actions.count, ra * constants.actions.count, Math.floor( ra * constants.actions.count) );
		action_choice = Math.floor( constants.random() * constants.actions.count);
		this.track.random_behavior = true;
	}
	else{
		var max = Math.max(...predictions);
		action_choice = predictions.indexOf( max );
		this.track.random_behavior = false;
	}


	// compute the base reward for the chosen action
	var reward = this.compute_reward(action_choice);
	this.track.reward = reward;
	// apply chosen action
	this.apply_action(action_choice);

	// computes sensor states after action has been applied
	var next_sensors = this.get_updated_sensors(this.tile);
	
	// if experience replay is activated
	if( this.experience_replay ){
		// memorizes experience
		this.experiences.push( {
			state: this.sensors.slice(),
			action: action_choice,
			reward: reward,
			next_state: next_sensors.slice()
		});
		// removes oldest experience if experience pool is limited and limit is reached
		if( this.experience_pool_size !== -1 && this.experiences.length > this.experience_pool_size ){
			this.experiences.shift();
		}
	}

	// update reward with future possible reward if goal action hasn't been reached
	if( reward < constants.rewards.goal ){
		var next_predictions = this.get_predictions(next_sensors);
		reward = reward + constants.discount_factor * Math.max(...next_predictions);
	}


	// preparing reward for the learning function
	var rewards = predictions.slice();
	rewards[action_choice] = reward;

	
	// learning phase
	// prepare the experiences to learn
	var experiences_to_learn = {
		X: [],
		Y: []
	};

	// add the current experience
	var x = this.sensors.slice();
	// x.unshift(1);
	experiences_to_learn.X.push(x);
	experiences_to_learn.Y.push(rewards);

	
	// if experience replay is activated learn the current experience and some previous experience at the same time
	if( this.experience_replay ){

		// repeat according to experience_replay_count
		for(var i=0;i<this.experience_replay_count;i++){
			// pick randomly an old experience from the experience pool
			var experience = this.experiences[  Math.floor( constants.random() * this.experiences.length ) ];
			
			var replay_reward = experience.reward;
			// update reward with future possible reward
			if( replay_reward < constants.rewards.goal ){
				var replay_next_prediction = this.get_predictions( experience.next_state );
				replay_reward += constants.discount_factor * Math.max(...replay_next_prediction);
			}
			
			// prepare and add the experience in the experience to learn list
			var replay_prediction = this.get_predictions( experience.state );
			var replay_rewards = replay_prediction.slice();
			replay_rewards[experience.action] = replay_reward;
			
			x = experience.state.slice();
			// x.unshift(1);
			experiences_to_learn.X.push(x);
			experiences_to_learn.Y.push(replay_rewards);
		}

	}

	// this.nn.check_gradient(experiences_to_learn.X, experiences_to_learn.Y, 0.00001);

	// proceed to the learning
	// this.nn.gradient_step( experiences_to_learn.X, experiences_to_learn.Y);
	this.gd.batched_gradient_descent( this.gd_ctx, experiences_to_learn.X, experiences_to_learn.Y, this.nn,  "compute_cost", "weights_update");

};
