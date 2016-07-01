var constants = require("./constants.js");

module.exports = Tile;

/*************************************************************************
 * Tile
 ************************************************************************/
function Tile(world, pos){
	this.world = world;
	this.pos = pos;

	this.empty = true;
	this.entity = undefined;
}
Tile.prototype.update = function(){
	if( this.entity && this.entity.update )
		this.entity.update();
};
Tile.prototype.set_entity = function( entity ){
	this.entity = entity;
	this.empty = false;
	entity.tile = this;
};
Tile.prototype.set_empty = function(){
	if( !this.empty )
		this.entity.tile = undefined;
	this.entity = undefined;
	this.empty = true;
};

Tile.prototype.get_neighbour_tile = function( direction){
	var new_pos = this.get_neighbour_pos(direction);

	return this.world.map[new_pos[1]][new_pos[0]];
};
Tile.prototype.get_neighbour_pos = function( direction ){
	if( direction >= constants.directions.count )
		return position;

	var x = this.pos[0] + (direction===constants.directions.left?-1:0) + (direction===constants.directions.right?1:0);
	var y = this.pos[1] + (direction===constants.directions.top?-1:0) + (direction===constants.directions.bottom?1:0);

	x = (x+this.world.map_size)%this.world.map_size;
	y = (y+this.world.map_size)%this.world.map_size;

	return [x,y];
};


