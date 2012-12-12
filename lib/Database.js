var EventEmitter = require("events").EventEmitter;

var Database = function(db) {
	this.db = db;
	this.queries = [];

	var that = this;
	this.__defineGetter__("latestQuery", function() {
		return that.queries[that.queries.length - 1] || undefined;
	});

	this.__defineSetter__("latestQuery", function(val) {
		that.queries[that.queries.length - 1] = val;
	});
};

//Add the event emitter
Database.prototype = EventEmitter.prototype;

Database.prototype.insert = function(data) {
	var insertTemplate = "INSERT INTO {{table}}({{fields}}) VALUES({{values}})",
		fields = [], values = [];

	for(var key in data) {
		fields.push(key);
		values.push(this.escape(data[key]));
	}

	insertTemplate = this._replace(insertTemplate, {
		fields: fields,
		values: values
	});

	this.queries.push(insertTemplate);

	return this;
};

Database.prototype.into = function(table) {
	if(!this.latestQuery) throw new Error("Please create a new query using Database#insert or Database#update etc.");

	this.latestQuery = this._replace(this.latestQuery, "table", table);

	return this;
};

Database.prototype.execute = function(callback) {
	if(this.queries.length < 1) throw new Error("Please create a query for me to execute first!");

	var that = this;
	this.queries.forEach(function(query) {
		that.query(query, callback);
	})
};

/**
 * Escape a string so it's suitable for inserting into a database.
 * @param  {String} string The string to be escaped
 * @return {String}        The escaped string
 */
Database.prototype.escape = function(string) {
	if(typeof this.db.escape == "function") return this.db.escape(string);
};

/**
 * Extremely simple templating system. Replace variables
 * wrapped in mustache style deliminators ({{ and }}) or
 * choose your own. Simple stuff.
 * 
 * @param  {String} string       String to replace.
 * @param  {String|Object} key   The string to replace of a key value store of replacements.
 * @param  {String} value        The value to replace with.
 * @param  {Array} deliminators An array of the escaped deliminators.
 * @return {String}              The formatted string.
 */
Database.prototype._replace = function(string, key, value, deliminators) {
	var values = (typeof key == "object") ? key : {},
		deliminators = deliminators || ["\\{\\{", "\\}\\}"],
		preDeliminator = deliminators[0],
		postDeliminator = deliminators[1];

	if(typeof key == "string" && value) { values[key] = value; console.log("SATISIFIED!"); }
	if(typeof key == "string" && !value) { throw new Error("Please provide value to insert."); }

	for(var key in values) {
		string = string.replace(new RegExp(preDeliminator + "\\s*" + key + "\\s*" + postDeliminator, "g"), values[key].toString());
	}

	return string;
};

Database.prototype.query = function(query, callback) {
	if(!query) throw new Error("Please provide a query to the Database#query function.");

	var that = this;
	this.db.query(query, function(err, results) {
		if(err) {
			that.emit("error", err);
			that.emit(err.code, err);
		}
		
		if(callback) callback.call(that, err, results);
	});
};

module.exports = Database;