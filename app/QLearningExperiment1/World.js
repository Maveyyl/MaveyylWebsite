var constants = require("./constants.js");
var Tile = require("./Tile.js");
var Creature = require("./Creature.js");
var Plant = require("./Plant.js");

module.exports = World;

/*************************************************************************
 * World
 ************************************************************************/
function World(){
	this.map = [];
	this.map_size = constants.map_size;
	this.creature = undefined;

	this.plant_count = 0;
	this.plant_count_max = constants.plant_count_max;


	// instanciating the map	
	this.map = new Array(this.map_size);
	for(var y=0;y<this.map_size;y++){
		this.map[y] = new Array(this.map_size);
		for(var x=0;x<this.map_size;x++)
			this.map[y][x] = new Tile(this, [x,y]);
	}

	// spawn plants randomly
	while( this.plant_count < this.plant_count_max ) {
		var x = Math.trunc( constants.random()*this.map_size );
		var y = Math.trunc( constants.random()*this.map_size );
		
		if( this.map[y][x].empty ){
			this.map[y][x].set_entity( new Plant( this ));
			this.plant_count++;
		}
	}

	// creates creature and places it at random empty location
	while( this.creature === undefined ){
		var x = Math.trunc( constants.random()*this.map_size );
		var y = Math.trunc( constants.random()*this.map_size );
		
		if( this.map[y][x].empty ){
			this.map[y][x].set_entity( new Creature(this));
			this.creature = this.map[y][x].entity;
		}
	}
}

World.prototype.update = function(explore, verbose){
	// spawn plants randomly if needed
	while( this.plant_count < this.plant_count_max ) {
		var x = Math.trunc( constants.random()*this.map_size );
		var y = Math.trunc( constants.random()*this.map_size );
		
		if( this.map[y][x].empty ){
			this.map[y][x].set_entity( new Plant( this ));
			this.plant_count++;
		}
	}

	// update all tiles except the creature tile
	for(var y=0;y<this.map_size;y++){
		for(var x=0;x<this.map_size;x++){
			if( !this.map[y][x].empty && this.map[y][x].entity.type !== constants.entities.creature ){
				this.map[y][x].update();
			}
		}
	}

	// update creature
	this.creature.update();
};