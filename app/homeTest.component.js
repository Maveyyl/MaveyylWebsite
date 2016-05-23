(function(app) {

	app.components.homeTest = ng.core.Component({
		selector: 'home-test',
		templateUrl: "templates/home_test.html",
	})
	.Class({
		constructor: function(router){
			console.log("homeTest");
		},
		ngOnInit: function(){
			app.graph_utils.generic_2D_graph("graph", [0,1,2], [0,1,2],200,200);
		}
	});

})(window.app || ( window.app = { components:{} } ));