var constants = require("./constants.js");

function HexcerMap(){
	this.size = constants.map_size;
	this.map = constants.get_virgin_map_with_walls();
	this.init();
}
HexcerMap.prototype.init = function(){
	this.left_goal = {
		x: 1,
		y: 2,
		tile_type: 2
	};
	this.right_goal = {
		x: 11,
		y: 2,
		tile_type: 3
	};
	this.left_player = {
		x: 4,
		y: 2,
		tile_type: 4
	};
	this.right_player = {
		x: 8,
		y: 2,
		tile_type: 5
	};
	this.ball = {
		x: 6,
		y: 2,
		tile_type: 6
	};
}

HexcerMap.prototype.is_wall = function(x, y){
	return this.map[y][x] === constants.tiles.wall;
};
HexcerMap.prototype.is_left_goal = function(x, y){
	return this.left_goal.x === x && this.left_goal.y === y;
};
HexcerMap.prototype.is_right_goal = function(x, y){
	return this.right_goal.x === x && this.right_goal.y === y;
};
HexcerMap.prototype.is_left_player = function(x, y){
	return this.left_player.x === x && this.left_player.y === y;
};
HexcerMap.prototype.is_right_player = function(x, y){
	return this.right_goal.x === x && this.right_goal.y === y;
};
HexcerMap.prototype.is_ball = function(x, y){
	return this.ball.x === x && this.ball.y === y;
};

HexcerMap.prototype.get_map = function(){
	var map = constants.get_virgin_map_with_walls();

	var objects = [
		this.left_goal,
		this.right_goal,
		this.left_player,
		this.right_goal,
		this.ball
	];
	var x,y;
	for(var i=0;i<objects.length;i++){
		x = objects[i].x;
		y = objects[i].y;
		if( ! Array.isArray( map[y][x] ) )
			map[y][x] = [];
		map[y][x].push( objects[i].tile_type );
	}

	return map;
};


HexcerMap.prototype.get_sensors = function( player_perspective ){
	var i,x,y,objects;

	// creates 6 HercerMap, one of each kind of tile
	var maps = new Array(constants.sensors_count[0]);
	for(var i=0;i<maps.length;i++)
		maps[i] = constants.get_virgin_map_with_walls();

	// set the wall map
	for(y=0;y<constants.sensors_count[2];y++){
		for(x=0;x<constants.sensors_count[1];x++){
			maps[0][y][x] = (this.map[y][x] === constants.tiles.wall ? 1 : 0) * constants.sensor_activation_value;
		}
	}

	// if left player
	if( player_perspective === "left"){
		// set the positions of the objects to add in the maps
		objects = [
			this.left_goal,
			this.right_goal,
			this.left_player,
			this.right_goal,
			this.ball
		];

		// put the objects in the maps
		for(i=0;i<objects.length;i++){
			x = objects[i].x;
			y = objects[i].y;

			maps[i+1][y][x] = constants.sensor_activation_value;
		}
	}
	// if right player, perspective is mirrored
	else if( player_perspective === "right"){
		// right and left are mirrored
		objects = [
			this.right_goal,
			this.left_goal,
			this.right_goal,
			this.left_player,
			this.ball
		];

		// set the objects in the maps, positions are center mirrored
		for(i=0;i<objects.length;i++){
			x = constants.sensors_count[1] - objects[i].x;
			y = constants.sensors_count[2] - objects[i].y;

			maps[i+1][y][x] = constants.sensor_activation_value;
		}
	}

	return maps;
};



HexcerMap.prototype.apply_actions = function(left_action, right_action ){


	// mirror the action of the right player
	right_action = ( right_action + constants.actions.no_move/2) % constants.actions.no_move;
	
	// compute future new positions of the players

	// if new left position and new right position are the same
		// compute which one prevails randomly

		// set back the loosing player to its original position

		// if the ball was in one of the previous positions
			// set it to the new position
	// if new left position and new right position are not the same position
		// if ball was in previous left position
			// set it to new left position
		// if ball was in previous right position
			// set it to new right position

};