var constants = {};
module.exports= constants;




/*
 * Rewards
 */
constants.rewards = {
	neutral: 0,
	no_action: 0,
	forbidden_action: 0,
	goal: 100
};



/*
 * Entities
 */
constants.entities = {
	none: 0,
	creature: 1,
	small_plant: 2,
	medium_plant: 3,
	big_plant: 4
};


/*
 * Directions
 */
constants.directions = {
	left: 0,
	top: 1,
	right: 2,
	bottom: 3,
	count: 4
};

/*
 * Actions
 */
constants.actions = {
	move_left: 0,
	move_top: 1,
	move_right: 2,
	move_bottom: 3,
	feed_plants: 4,
	eat_plants: 5,
	do_nothing: 6,
	count: 7
};



/*
 * Sensors
 */
constants.sensors = {
	small_plant_left: 0,
	small_plant_top: 1,
	small_plant_right: 2,
	small_plant_bottom: 3,

	medium_plant_left: 4,
	medium_plant_top: 5,
	medium_plant_right: 6,
	medium_plant_bottom: 7,

	big_plant_left: 8,
	big_plant_top: 9,
	big_plant_right: 10,
	big_plant_bottom: 11,

	something_left: 12,
	something_top: 13,
	something_right: 14,
	something_bottom: 15,

	count: 16,
};
constants.sensor_activation_value = 100;
constants.sensor_distance_detection = 3;


/*
 * Map
 */
constants.map_size = 15;
constants.plant_count_max = 20;



/*
 * Neural Network
 */
constants.network = [ constants.sensors.count, 20, constants.actions.count ];
constants.learning_rate = 0.00001;
constants.regularization_parameter = 0;
constants.discount_factor = 0.8;

constants.theta_init_upper_range = 1;
constants.theta_init_lower_range = -1;

constants.experience_replay = true;
constants.experience_pool_size = 50000;
constants.experience_replay_count = 8;


constants.epsilon_max = 1;
constants.epsilon_min = 0.05;
constants.epsilon_step = 0.0001;