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


HexcerMap.prototype.is_wall = function(pos){
	return 
	this.map[pos.y][pos.x] === constants.tiles.wall ||
	(
		pos.x < 0 || pos.x > this.size[0] ||
		pos.y < 0 || pos.y > this.size[1]
	);
};
HexcerMap.prototype.is_left_goal = function(pos){
	return this.left_goal.x === pos.x && this.left_goal.y === pos.y;
};
HexcerMap.prototype.is_right_goal = function(pos){
	return this.right_goal.x === pos.x && this.right_goal.y === pos.y;
};
HexcerMap.prototype.is_left_player = function(pos){
	return this.left_player.x === pos.x && this.left_player.y === pos.y;
};
HexcerMap.prototype.is_right_player = function(pos){
	return this.right_goal.x === pos.x && this.right_goal.y === pos.y;
};
HexcerMap.prototype.is_ball = function(pos){
	return this.ball.x === pos.x && this.ball.y === pos.y;
};
HexcerMap.prototype.is_empty = function(pos){
	return 
	!this.is_wall(pos) && 
	!this.is_left_player(pos) && 
	!this.is_right_player(pos);
};
HexcerMap.prototype.is_left_player_winning = function(){
	return this.ball.x === this.right_goal.x && this.ball.y === this.right_goal.y ;
};
HexcerMap.prototype.is_right_player_winning = function(){
	return this.ball.x === this.left_goal.x && this.ball.y === this.left_goal.y ;
};
HexcerMap.prototype.get_neighbour = function(pos, direction){
	var x = pos.x;
	var y = pos.y;

	switch(direction){
		case constants.directions.left:
			x--;
			break;
		case constants.directions.top_left:
			x--;
			y--;
			break;
		case constants.directions.top_right:
			x++;
			y--;
			break;
		case constants.directions.right:
			x++;
			break;
		case constants.directions.bottom_right:
			x++;
			y++;
			break;
		case constants.directions.breakbottom_left:
			x--;
			y++;
			break;
	}
	return {x:x, y:y};
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
	var left_player_new_pos = this.get_neighbour( this.left_player, left_action );
	if( this.is_empty( left_player_new_pos ) )
		var left_player_new_pos = this.left_player;
	var right_player_new_pos = this.get_neighbour( this.right_player, right_action );
	if( this.is_empty( right_player_new_pos ) )
		var right_player_new_pos = this.right_player;


	// if new left position and new right position are the same
	if( left_player_new_pos.x === right_player_new_pos.x && left_player_new_pos.y === right_player_new_pos.y ){
		// compute which one prevails randomly
		var new_pos = left_player_new_pos;
		var r = Math.random();

		// if the ball was in one of the previous positions
		if( 
			( this.ball.x === this.left_player.x && this.ball.y === this.right_player.y ) ||
			( this.ball.x === this.right_player.x && this.ball.y === this.right_player.y ) 
		){
			// set it to the new position
			this.ball.x = new_pos.x;
			this.ball.y = new_pos.y;
		}

		// set the winning player to its new position
		if( r < 0.5 ){
			this.left_player.x = new_pos.x;
			this.left_player.y = new_pos.y;
		}
		else{
			this.right_player.x = new_pos.x;
			this.right_player.y = new_pos.y;
		}
	}
	// if new left position and new right position are not the same position
	else{		
		// if ball was in previous left position
		if(  this.ball.x === this.left_player.x && this.ball.y === this.right_player.y ) {
			// set it to new left position
			this.ball.x = left_player_new_pos.x;
			this.ball.y = left_player_new_pos.y;
		}
		// if ball was in previous right position
		else if( this.ball.x === this.right_player.x && this.ball.y === this.right_player.y ) {
			// set it to new right position
			this.ball.x = right_player_new_pos.x;
			this.ball.y = right_player_new_pos.y;
		}

		// set players to their new positions
		this.left_player.x = left_player_new_pos.x;
		this.left_player.y = left_player_new_pos.y;
		this.right_player.x = right_player_new_pos.x;
		this.right_player.y = right_player_new_pos.y;
	}

};