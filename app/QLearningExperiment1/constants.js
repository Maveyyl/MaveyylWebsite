var constants = {};
module.exports= constants;

/*
 * Map
 */
constants.map_size = 15;
constants.plant_count = 30;
constants.plant_recover_steps = 10;


/*
 * Rewards
 */
constants.rewards = {
	neutral: 20,
	no_move: 0,
	forbidden_action: 0,
	eat: 100
};



/*
 * Entities
 */
constants.entities = {
	none: 0,
	creature: 1,
	plant: 2,
	dead_plant: 3,
	food: 4
};


constants.entities_render = [
	" ",
	"@",
	"T",
	"x",
	"o"
];

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
	stay: 4,
	hit: 5,
	eat: 6,
	count: 7
};



/*
 * Sensors
 */
constants.sensors = {
	plant_left: 0,
	plant_top: 1,
	plant_right: 2,
	plant_bottom: 3,
	dead_plant_left: 4,
	dead_plant_top: 5,
	dead_plant_right: 6,
	dead_plant_bottom: 7,
	food_left: 8,
	food_top: 9,
	food_right: 10,
	food_bottom: 11,
	count: 12
};

constants.sensors_range = 1;
constants.sensors_distance_detection_value= 25;


/*
 * Neural Network
 */
constants.network = [ constants.sensors.count, 15, constants.actions.count ];
constants.learning_rate = 0.0001;
constants.regularization_parameter = 0;
constants.discount_factor = 0.6;

constants.theta_init_upper_range = 1;
constants.theta_init_lower_range = -1;


constants.epsilon_max = 1;
constants.epsilon_min = 0.05;
constants.epsilon_step = 0.0001;