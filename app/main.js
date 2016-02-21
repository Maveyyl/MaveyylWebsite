(function(app) {
	document.addEventListener('DOMContentLoaded', function() {
		ng.platform.browser.bootstrap(app.mainComponent, [ng.router.ROUTER_PROVIDERS]);
	});
})(window.app || (window.app = {}));