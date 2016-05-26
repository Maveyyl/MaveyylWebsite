var constants = require("./constants.js");
var Tile = require("./Tile.js");
var Plant = require("./Plant.js");
var Creature = require("./Creature.js");
var Food = require("./Food.js");

module.exports = World;

/*************************************************************************
 * World
 ************************************************************************/
function World(){
	this.map = [];
	this.map_size = constants.map_size;
	this.plant_count = constants.plant_count;
	this.creature = undefined;



	// instanciating the map	
	this.map = new Array(this.map_size);
	for(var y=0;y<this.map_size;y++){
		this.map[y] = new Array(this.map_size);
		for(var x=0;x<this.map_size;x++)
			this.map[y][x] = new Tile(this, [x,y]);
	}

	// randomly placing plants at creation of the world
	var plant_spawned = 0;
	while( plant_spawned < this.plant_count ){
		var x = Math.trunc( Math.random()*this.map_size );
		var y = Math.trunc( Math.random()*this.map_size );
		if( this.map[y][x].entity_type === constants.entities.none ){
			this.map[y][x].set_entity( new Plant(this, [x,y]) );
		}

		plant_spawned++;
	}
	
	while( this.creature === undefined ){
		var x = Math.trunc( Math.random()*this.map_size );
		var y = Math.trunc( Math.random()*this.map_size );
		
		if( this.map[y][x].entity_type === constants.entities.none ){
			this.map[y][x].set_entity(new Creature(this, [x,y]));
			this.creature = this.map[y][x].entity;
		}

	}
}

World.prototype.update = function(explore, verbose){
	for(var y=0;y<this.map_size;y++){
		for(var x=0;x<this.map_size;x++){
			if( this.map[y][x].update && this.map[y][x].entity_type !== constants.entities.creature ){
				this.map[y][x].update(explore, verbose);
			}
		}
	}
	this.creature.update(explore,verbose);
};