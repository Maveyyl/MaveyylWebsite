(function(app) {

	app.settings = {};
	app.settings.routeStructure = [
		{
			name: "Home",
			description: "Home",
			path: "/home",
			templateUrl: "templates/home_view.html",
			navbarPosition: "left",
			useAsDefault: true
		},
		{
			name: "Godot",
			description: "Godot",
			path: "/godot",
			templateUrl: "templates/godot_view.html",
			navbarPosition: "left"
		},
		{
			name: "MachineLearning",
			description: "Machine Learning",
			path: "/machine_learning_home",
			templateUrl: "templates/machine_learning_view.html",
			navbarPosition: "left",
			children: [
				{
					name: "PolynomialRegression",
					description: "Polynomial Regression",
					path: "/polynomial_regression",
					templateUrl: "templates/polynomial_regression_view.html",
					directives: [app.polynomialRegressionComponent]
				}
			]
		},
		{
			name: "Links",
			description: "Links",
			path: "/links",
			templateUrl: "templates/links_view.html",
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
		app[view_info.name+"ViewComponent"] = ng.core.Component({
			templateUrl: view_info.templateUrl,
			directives: view_info.directives
		})
		.Class({
			constructor:(function(a){ 
				return function(){
					console.log(a.name);
				} 
			})(view_info) 
		});

		// create route config for the view
		routeConfig.push({
			path: view_info.path,
			component: app[view_info.name+"ViewComponent"],
			name: view_info.name,
			useAsDefault: view_info.useAsDefault || false
		});
	}



	// Pipe filter used to separate left navbar items and right navbar items
	app.NavbarFilter = ng.core.Pipe({
		name: "NavbarFilter"
	}).
	Class({
		constructor: function(){},
		transform: function(value, args){
			return value.filter(function(e,i){
				// default is left
				if( !e.navbarPosition )
					e.navbarPosition = "left";
				return e.navbarPosition === args[0];
			});
		}
	});

	// main component
	app.mainComponent = ng.core.Class({
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
	app.mainComponent = ng.router.RouteConfig(routeConfig)(app.mainComponent);
	app.mainComponent = ng.core.Component({
		selector: 'maveyyl-website-app',
		templateUrl: 'templates/main_view.html',
		directives: [ng.router.ROUTER_DIRECTIVES],
		pipes: [app.NavbarFilter]
	})(app.mainComponent);



})(window.app || (window.app = {}));