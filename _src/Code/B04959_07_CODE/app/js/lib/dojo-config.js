var package_path = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
var dojoConfig = {
	//The location.pathname.replace() logic below may look confusing but all its doing is
	// enabling us to load the api from a CDN and load local modules from the correct location.
	packages: [{
			name: "application",
			location: package_path + '/js/lib'
        },
		{
			name: "d3",
			location: "http://cdnjs.cloudflare.com/ajax/libs/d3/3.5.5",
			main: "d3.min"
        },
		{
			name: 'vega',
			location: 'http://vega.github.io/vega/',
			main: 'vega.min'
      }, {
			name: 'cedar',
			location: package_path + '/js/cedar',
			main: 'cedar'
      }]
};