var Model = require("../../lib/Model.js");

var User = new Model({
	schema: {
		"users": {
			id: "number",
			username: "varchar(24)",
			password: "varchar(24)"
		}
	},

	config: {

	}
});