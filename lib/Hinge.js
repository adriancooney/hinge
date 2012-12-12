var Model = require("./Model"),
	Database = require("./Database"),
	Router = require("./Router");

var Hinge = {
	init: function(app, db) {
		this.app = app;
		this.db = db;

		this.plugs = {
			Router: new Router(app),
			Database: new Database(db)
		};

		Hinge.expose();

		return Hinge;
	},

	/**
	 * Expose the plugs to Hinge variable
	 * @param  {Boolean} globally Expose the variables globally (optional)
	 */
	expose: function(globally) {
		if(!this.plugs) throw new Error("Please initilize Hinge using Hinge.init");

		for(var plug in this.plugs) {
			if(globally) global[plug] = this.plugs[plug];
			Hinge[plug] = this.plugs[plug];
		}
	},

	/**
	 * Globalize the plugs
	 */
	globalize: function() {
		Hinge.expose(true);
	},

	listen: function() {
		this.app.listen.apply(this.app, arguments);
	}
};

module.exports = Hinge;

