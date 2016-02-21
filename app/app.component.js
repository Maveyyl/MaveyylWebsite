(function(app) {

	app.settings = {};
	app.settings.routeStructure = [
		{
			name: "Home",
			description: "Home",
			path: "/home",
			templateUrl: "templates/home.html",
			useAsDefault: true
		},
		{
			name: "GodotHome",
			description: "Godot Home",
			path: "/godot_home",
			templateUrl: "templates/godot_home.html"
		},
		{
			name: "MachineLearningHome",
			description: "Machine Learning Home",
			path: "/machine_learning_home",
			templateUrl: "templates/machine_learning_home.html"
		}
	];

	var routeConfig = [];
	for ( var i=0;i<app.settings.routeStructure.length;i++){
		var rt = app.settings.routeStructure[i];
		app[rt.name+"Component"] = ng.core.Component({
			templateUrl: rt.templateUrl
		})
		.Class({constructor:(function(a){ return function(){console.log(a.name);} })(rt) });

		routeConfig.push({
			path: rt.path,
			component: app[rt.name+"Component"],
			name: rt.name,
			useAsDefault: rt.useAsDefault || false
		})
	}





	app.mainComponent = ng.core.Class({
		constructor: function(){
			console.log("Main");
		},
		ngOnInit: function(){
			this.settings = app.settings;
		}
	})
	app.mainComponent = ng.router.RouteConfig(routeConfig)(app.mainComponent);
	app.mainComponent = ng.core.Component({
		selector: 'maveyyl-website-app',
		templateUrl: 'templates/main.html',
		directives: [ng.router.ROUTER_DIRECTIVES],
	})(app.mainComponent);




})(window.app || (window.app = {}));