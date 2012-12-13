var express = require("express"),
	app = express(),
	mysql = require("mysql").createConnection({
		  host: "localhost",
		  user: "root",
		  password: "root",
		  database: "testing"
	});


var Hinge = require("../lib/Hinge.js").init(app, mysql);

//Globalize the plugs
Hinge.globalize();

//Add permission hook to routes
//Any routes with ! prefix need to be authorized
Router.hook(/^!(\w+)/, function(route, regex) {
	return {
		parsed: regex[1],
		callback: function(req, res, next) {
			console.log("Authorizing!");
			next();
		}
	}
});

Router.group("/user", {
	"!GET": function(req, res) {
		res.send("Authorized!");
	},

	"david": {
		"all": function(req, res, next) {
			//Context sensitive middleware
			console.log("Catchall!");
			next();

		},

		"GET": function(req, res) {
			res.send("Lo!");
		}
	},

	"!jeremy": {
		"GET": function() {

		}
	}
});

Database.on("error", function(err) {
	console.log("DATABASE ERROR: ", err);
})

Database.insert({username: "adrian", age: 17})
		.into("users").execute();

Database.select(["username", "age"])
		.from("users")
		.where({username: "adrian"})
		.orderby("username", "ASC")
		.limit(0, 10)
		.execute(function(err, rows) {
			console.log("DATA: ", rows);
		});

console.log(Database);

Hinge.listen(3000);


