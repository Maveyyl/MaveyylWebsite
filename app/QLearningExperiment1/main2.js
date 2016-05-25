var World = require("./World.js");




var world = new World();
// world.render();


var max_iter = 100000;
var avg_iter = 5000;
var avg = 0;

var greedy_behavior = 0;
var ate_food = 0;
var ignored_food = 0;
for(var i=0;i<max_iter;i++){
	world.update(false);
	avg += world.creature.nn.J[i];
	if( i%avg_iter === 0){
		process.stdout.write("Learning... " + Math.round((i/max_iter)*10000)/100 + "   \t/\t" +  Math.round(10000)/100+'\t\t'+ avg/avg_iter + '\t\t\r');
		avg = 0;
	}

	if(world.creature.random === false ){
		greedy_behavior++;
		if( world.creature.near_food && !world.creature.just_ate )
			ignored_food++;
		else if( world.creature.near_food && world.creature.just_ate )
			ate_food++;
	}
}



for(var i=0;i<10;i++){
	world.update( true);
	world.render();
}

avg = 0;
for(var i=world.creature.nn.J.length-avg_iter;i<world.creature.nn.J.length;i++){
	avg += world.creature.nn.J[i];
	if( i%avg_iter === 0){
		console.log(avg/avg_iter);
		avg = 0;
	}
}

var greedy_behavior_ratio = greedy_behavior / max_iter;
var ate_food_ratio = Math.round(ate_food /(ate_food+ignored_food)*100)/100;
var near_food_ratio = Math.round((ate_food+ignored_food)/max_iter*100)/100;
console.log("greedy behavior ratio: ", greedy_behavior_ratio);
console.log("ate food when available: " ,  ate_food_ratio);
console.log("food available: " , near_food_ratio );

var f1_score = 2* ate_food_ratio * near_food_ratio / ( ate_food_ratio + near_food_ratio );
// console.log(avg/(world.creature.nn.J.length%1000));
console.log("f1_score: ", f1_score);

