var constants = require("./constants.js");

module.exports = Plant;

/*************************************************************************
 * Plant
 ************************************************************************/
function Plant(world){
	this.world = world;
	this.tile = undefined;
	this.type = constants.entities.small_plant;

}

Plant.prototype.get_fed = function(){
	if( this.type === constants.entities.small_plant )
		this.type = constants.entities.medium_plant;
	else if( this.type === constants.entities.medium_plant )
		this.type = constants.entities.big_plant;
};
Plant.prototype.get_eaten = function(){
	this.tile.set_empty();
	this.world.plant_count--;
};
Plant.prototype.get_size = function(){
	if( this.type === constants.entities.small_plant )
		return 1;
	else if( this.type === constants.entities.medium_plant )
		return 2;
	else if( this.type === constants.entities.big_plant )
		return 3;
}

Plant.prototype.update = function(explore, verbose){
	
};
