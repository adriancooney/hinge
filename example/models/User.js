var Hinge = require("../../lib/Hinge.js");

var User = new Hinge.Model({
	schema: {
		"users": {
			id: "int",
			username: "varchar(24)",
			password: "varchar(24)"
		},

		"user_meta": {
			user_id: "int",
			name: "varchar(255)",
			age: "int"
		}
	},

	relationships: {
		"user_meta.user_id" : "users.id",
		"users.id" : ""
	}
});

module.exports = User;