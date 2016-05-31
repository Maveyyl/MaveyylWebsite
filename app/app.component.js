(function(app) {

	app.settings = {
		verbose : true
	};
	app.settings.routeStructure = [
		{
			name: "HomePage",
			description: "Home",
			path: "/home",
			templateUrl: "templates/home_page.html",
			navbarPosition: "left",
			useAsDefault: true,
			directives: [ app.components.homeTest ]
		},
		{
			name: "GodotPage",
			description: "Godot",
			path: "/godot",
			templateUrl: "templates/godot/godot_page.html",
			navbarPosition: "left"
		},
		{
			name: "MachineLearningPage",
			description: "Machine Learning",
			path: "/machine_learning_home",
			templateUrl: "templates/machine_learning/machine_learning_page.html",
			navbarPosition: "left",
			children: [
				{
					name: "QLearningExperimentsPage1",
					description: "Q Learning Experiments1",
					path: "/q_learning_experiments1",
					templateUrl: "templates/machine_learning/q_learning_experiment_1_page.html",
					directives: [app.components.qLearningExperiment1]
				},
				{
					name: "QLearningExperimentsPage2",
					description: "Q Learning Experiments2",
					path: "/q_learning_experiments2",
					templateUrl: "templates/machine_learning/q_learning_experiment_2_page.html",
					directives: [app.components.qLearningExperiment2]
				}
			]
		},
		{
			name: "LinksPage",
			description: "Links",
			path: "/links",
			templateUrl: "templates/links_page.html",
			navbarPosition: "right"
		}
	];

	// generate views' components
	var routeConfig = [];
	// for each views
	for ( var i=0;i<app.settings.routeStructure.length;i++){
		var rt = app.settings.routeStructure[i];
		// create view component and route config
		create_view(app, routeConfig, rt);
		// if view has children
		if( rt.children ){
			// for each children
			for( var y=0;y<rt.children.length;y++){
				// create view component and route config
				create_view(app, routeConfig, rt.children[y]);
			}
		}
	}

	// function creating component and routeConfig for a view
	function create_view(app, routeConfig, view_info){
		// create component for a view
		app.components[view_info.name] = ng.core.Component({
			templateUrl: view_info.templateUrl,
			directives: view_info.directives
		})
		.Class({
			constructor:(function(a){ 
				return function(){
					if( app.settings.verbose )
						console.log(a.name);
				} 
			})(view_info) 
		});

		// create route config for the view
		routeConfig.push({
			path: view_info.path,
			component: app.components[view_info.name],
			name: view_info.name,
			useAsDefault: view_info.useAsDefault || false
		});
	}


	// Pipe filter used to separate left navbar items and right navbar items
	app.pipes = app.pipes || {};
	app.pipes.NavbarFilter = ng.core.Pipe({
		name: "NavbarFilter"
	}).
	Class({
		constructor: function(){},
		transform: function(value, args){
			return value.filter(function(e,i){
				// default is left
				if( !e.navbarPosition )
					e.navbarPosition = "left";
				return e.navbarPosition === args;
			});
		}
	});

	// main component
	app.components.mainComponent = ng.core.Class({
		// inject router object in main component constructor
		constructor: [ng.router.Router, function(router){
			console.log("main");
			var _this = this;
			this.router = router;
		}],
		ngOnInit: function(){
			this.settings = app.settings;
		}
	});
	app.components.mainComponent = ng.router.RouteConfig(routeConfig)(app.components.mainComponent);
	app.components.mainComponent = ng.core.Component({
		selector: 'maveyyl-website-app',
		templateUrl: 'templates/main_page.html',
		directives: [ng.router.ROUTER_DIRECTIVES],
		pipes: [app.pipes.NavbarFilter]
	})(app.components.mainComponent);



})(window.app || ( window.app = { components:{} } ));