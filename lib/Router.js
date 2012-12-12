var Router = function(app) {
	if(!app) throw new Error("Please provide server app.");

	this.app = app;

	//The hooks array
	this.hooks = [];
};

/**
 * A proxy to the server.requestMethod
 * @param {String} Method    Method of the request
 * @param {unicorn} Arguments The parameters to be proxied to the server.requestMethod.
 */
Router.prototype.add = function(method, path) {

	var callbacks = Array.prototype.splice.call(arguments, 2, arguments.length); //Remove the method and path and leave callbacks

	console.log("Compiling route: " + method.toUpperCase() + "\t" + path + "\t(" + callbacks.length + ")");

	if(!this.app[method.toLowerCase()]) throw new Error("Bad method '" + method + "' when compiling route '" + path + "'.");

	//And add the route to the server
	this.app[method.toLowerCase()].apply(this.app, [path].concat(callbacks));
};

["get", "post", "put", "delete"].forEach(function(method) {
	Router.prototype[method] = function() {
		Array.prototype.unshift.call(arguments, method);
		this.add.apply(this, arguments);
	};
});

/**
 * Add hooks to routes when compiling route so middleware can be called if it matches a path.
 *
 * Example:
 * 		Router.hook(regex, function(route) {
 * 			return {
 * 				method: "GET",
 * 				middleware: function(req, res, next) {
 * 				
 * 				}
 * 			}
 * 		});
 * 		
 * @return {[type]} [description]
 */
Router.prototype.hook = function(regex, fn) {
	this.hooks.push([regex, fn]);
};

/**
 * Iterate over the hooks and return if one matches
 * @param  {String} route Route to test hook against
 * @return {Object|false}       Returns object if hook matches or false.
 */
Router.prototype.runHooks = function(route) {
	//Pop the argument
	var argz = Array.prototype.filter.call(arguments, function() { return true; }),
		data; //Init the variable to return

	//Pop the route
	argz.shift();

	//Run over the hooks
	this.hooks.forEach(function(hook) {
		var regex = hook[0],
			fn = hook[1],
			match = regex.exec(route);

		//If the route matches, run the middleware
		if(match) {
			var fndata = fn(route, match);

			if(!fndata.callback) throw new Error("Bad hook '" + regex.toString() + "'. Does not return a callback");
			else data = fndata;
		}
	});

	return (data) ? data : false;
};

/**
 * Group functions under specific path.
 *
 * Example:
 * 		Router.group("user/", {
 * 			"GET": function() {},
 *
 * 			":userid": {
 * 				//Middleware
 * 				"all": function(req, res, next) {
 * 					this.user = Model.getUser();
 * 				},
 * 				
 * 				"GET": function(req, res) {
 * 					res.send(this.user);
 * 				}
 * 			}
 * 		});
 * 		
 * @param  {[type]} path [description]
 * @param  {[type]} obj  [description]
 * @return {[type]}      [description]
 */
Router.prototype.group = function(root, routes) {
	var path = root,
		that = this;

	//Recur down the object
	(function recur(path, routes, middleware) {

		//Iterate over the routes
		for(var route in routes) {
			//Test the hooks
			var hook = that.runHooks(route);

			//If is a method, add it
			if(typeof routes[route] == "function" && route !== "all") {
				var argz = [(hook) ? hook.parsed : route, path].concat(middleware.concat((hook) ? hook.callback : []));
				argz.push(routes[route]);

				//It's a method
				that.add.apply(that, argz);
			} else {
				recur(path + "/" + ((hook) ? hook.parsed : route), routes[route], 
				      (hook || route == "all") ? middleware.concat(hook.callback) : middleware);
			}
		}
	})(path, routes, []);
};

/**
 * Interface a router with a model.
 * @param  {String} path   The root path for the model. For example: 'user' GET user, POST user, GET users
 * @param  {Model} model  The model to interface with.
 * @param  {Object} config Configure the interface.
 */
Router.prototype.interfaceWith = function(path, model, config) {
	var rootPath = path,
		group = {};

	//Install the routes
	//Create a new model
	this.add("post", rootPath, function(req, res) {

	});

	this.add("get", rootPath + "s", function(req, res) {

	})
};

module.exports = Router;