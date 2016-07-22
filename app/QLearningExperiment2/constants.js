var constants = {};
module.exports= constants;

var ml = require("../../lib/MLJS/ml.js");



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
 * Directions
 * tiles are hexagons with flat side left and right
 */
constants.directions = {
	left: 0,
	top_left: 1,
	top_right: 2,
	right: 3,
	bottom_right: 4,
	bottom_left: 5,
	count: 6
};

/*
 * Actions
 */
constants.actions = {
	move_left: 0,
	move_top_left: 1,
	move_top_right: 2,
	move_right: 3,
	move_bottom_right: 4,
	move_bottom_left: 5,
	no_move: 6,
	count: 7
};



/*
 * Tiles
 */
constants.tiles = {
	normal: 0,
	wall: 1,
	left_goal: 2,
	right_goal: 3,
	left_player: 4,
	right_player: 5,
	ball: 6
};
/*
 * Map
 * tiles are hexagons with flat side left and right
 * the direct tile bottom of another is the bottom right one
 * the direct tile top of another is the top left one
 */
constants.map_size = [13, 5];
constants.init_map = [
	[1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[1, 2, 0, 4, 0, 0, 6, 0, 0, 5, 0, 3, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
];
constants.get_virgin_map_with_walls = function(){
	return [
		[1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
	];
};
constants.get_virgin_map = function(){
	return [
		[1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		[1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
		[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
	];
};


/*
 * Sensors
 * Sensors will be a 3d map of size 6 x 13 x 6
 * 1 is  the map with the walls
 * 2 is the map with the left player
 * 3 is the map with the right player
 * 4 is the map with the left goal
 * 5 is the map with the right goal
 * 6 is the map with the ball
 */
constants.sensors_count = [ 
	6, 
	constants.map_size[0], 
	constants.map_size[1]
];
constants.sensor_activation_value = 100;



/*
 * Neural Network
 * 
 */
constants.create_NN = function(){

	var NN = new ml.NeuralNetwork( ml.ml_utils.MSE, ml.ml_utils.MSE_derivative );

	NN.add_layer( new ml.ConvLayer({
		input_unit_count: constants.sensors_count,
		output_unit_count: [ 10, 12, 3 ],
		window_unit_count: [ 3, 3 ],
		window_slide_range: [ 1, 1 ],
	}, weight_init_positive, ml.ml_utils.ReLU, ml.ml_utils.ReLU_derivative) );
	// NN.add_layer( new ml.MaxPoolingLayer({
	// 	input_unit_count: [ 20, 24, 24 ],
	// 	output_unit_count: [ 20, 12, 12 ],
	// 	window_unit_count: [ 2, 2 ],
	// }));

	NN.add_layer( new ml.FullyConnectedLayer(
		10*12*3, constants.actions.count,
		weight_init_positive, ml.ml_utils.ReLU, ml.ml_utils.ReLU_derivative
	));


	return NN;

}


constants.learning_rate = 0.5;
constants.regularization_parameter = 0;
constants.discount_factor = 0.8;

constants.experience_replay = true;
constants.experience_pool_size = 30000;
constants.experience_replay_count = 10;


constants.epsilon_max = 1;
constants.epsilon_min = 0.05;
constants.epsilon_step = 0.0001;

