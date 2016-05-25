var constants = require("./constants.js");
var Food = require("./Food.js");

module.exports = Plant;

/*************************************************************************
 * Plant
 ************************************************************************/
function Plant(world, tile){
	this.world = world;
	this.tile = tile;
	this.type = constants.entities.plant;

	this.dead = false;
	this.recover_steps = constants.plant_recover_steps;
	this.recover = 0;
}

Plant.prototype.get_hit = function(){
	this.dead = true;
	this.recover = 0;

	for(var direction=0;direction<constants.directions.count;direction++){
		var tile = this.tile.get_neighbour_tile(direction);
		if( tile.entity_type === constants.entities.none ){
			tile.set_entity( new Food(this.world, tile.pos) );
		}
	}
};

Plant.prototype.update = function(explore, verbose){
	if( this.dead ){
		this.recover++;
		if( this.recover >= this.recover_steps )
			this.dead = false;
	}	
};

Plant.prototype.render = function(){
	if( !this.dead )
		return constants.entities_render[ this.type ];
	else
		return constants.entities_render[ constants.entities.dead_plant ];
};

Plant.prototype.copy = function(world, tile){
	var plant =  new Plant(world,tile);

	plant.dead = this.dead;
	plant.recover = this.recover;

	return plant;
};