(function(app) {
	app.AppComponent =
		ng.core.Component({
			selector: 'maveyyl-website-app',
			template: '<h1>My First Angular 2 App</h1>'
		})
		.Class({
			constructor: function() {}
		});
})(window.app || (window.app = {}));