var constants = require("./constants.js");

module.exports = Food;

/*************************************************************************
 * Food
 ************************************************************************/
function Food(world, tile){
	this.world = world;
	this.tile = tile;
	this.type = constants.entities.food;
}

Food.prototype.get_eaten = function(){
	this.tile.set_empty();
};

Food.prototype.update = function(explore, verbose){
	if( this.dead ){
		this.recover++;
		if( this.recover >= this.recover_steps )
			this.dead = false;
	}	
};