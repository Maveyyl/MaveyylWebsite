var constants = require("./constants.js");

function HexcerMap(){
	this.size = constants.map_size;

	this.left_goal_pos = [1, 2];
	this.right_goal_pos = [11, 2];
	this.left_player_pos = [4, 2];
	this.right_player_pos = [8, 2];
	this.ball_pos = [6, 2];

	this.map = constants.get_virgin_map();

}

HexcerMap.prototype.is_wall = function(x, y){
	return this.map[y][x] === constants.tiles.wall;
};
HexcerMap.prototype.is_left_goal = function(x, y){

};
HexcerMap.prototype.is_right_player = function(x, y){

};
HexcerMap.prototype.is_left_player = function(x, y){

};
HexcerMap.prototype.is_right_player = function(x, y){

};

HexcerMap.prototype.get_map = function(){
	var map = constants.get_virgin_map();

	var objects = [
		this.left_goal_pos,
		this.right_goal_pos,
		this.left_player_pos,
		this.right_goal_pos,
		this.ball_pos,
	];

	for(var i=0;i<objects.length;i++){

	}
};