var constants = require("./constants.js");

module.exports = Food;

/*************************************************************************
 * Food
 ************************************************************************/
function Food(world, tile){
	this.world = world;
	this.tile = tile;
	this.type = constants.entities.food;
	this.decay_steps = constants.food_decay_steps;
	this.decay = 0;
}

Food.prototype.get_eaten = function(){
	this.tile.set_empty();
};

Food.prototype.update = function(explore, verbose){
	if( constants.food_decay){
		this.decay++;
		if( this.decay >= this.decay_steps )
			this.tile.set_empty();
	}
};