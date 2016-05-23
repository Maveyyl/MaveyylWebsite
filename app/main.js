(function(app) {
	document.addEventListener('DOMContentLoaded', function() {
		ng.platform.browser.bootstrap(app.components.mainComponent, [ng.router.ROUTER_PROVIDERS]);
	});
})(window.app || ( window.app = { components:{} } ));