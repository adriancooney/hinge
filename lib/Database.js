var EventEmitter = require("events").EventEmitter;

var Database = function(db) {
	this.db = db;
};

//Add the event emitter
Database.prototype = EventEmitter.prototype;

/**
 * Query builder. Create a new insert.
 * @param  {Object} data The data to insert. {field: value}
 * @return {this}      Database.
 */
Database.prototype.insert = function(data) {
	var insertTemplate = "INSERT INTO {{table}}({{fields}}) VALUES({{values}})",
		fields = [], values = [];

	for(var key in data) {
		fields.push("`" + key + "`");
		values.push(this.escape(data[key]));
	}

	insertTemplate = this._replace(insertTemplate, {
		fields: fields.join(", "),
		values: values.join(", ")
	});

	this.queryString = insertTemplate;

	return this;
};

/**
 * Query builder. Designates the table for the current insert function.
 * @param  {String} table The name of the table to insert into.
 * @return {this}      Database.
 */
Database.prototype.into = function(table) {
	if(!this.queryString) throw new Error("Please create a new query using Database#insert or Database#update etc.");
	if(!table) throw new Error("Please provide a table to insert into in Database#into or Database#from");

	this.queryString = this._replace(this.queryString, "table", table);

	return this;
};

/**
 * Query builder. Start a new select query.
 * @param  {Array} fields Array of fields to choose
 * @return {this}        Database
 */
Database.prototype.select = function(fields) {
	if(typeof fields == "string") fields = [fields];
	fields = (fields instanceof Array) ? fields.map(function(field) { return "`" + field + "`"; }).join(", ") : "*";

	//The base template
	var selectTemplate = "SELECT {{fields}} FROM {{table}}";

	this.queryString = this._replace(selectTemplate, "fields", fields);

	return this;
};

/**
 * Query builder. Same usage as Database#into.
 * @type {String} 	table	The table to insert into
 * @return {this}        Database
 */
Database.prototype.from = Database.prototype.into;

/**
 * Query builder. Add a where clause to the query builder.
 * @param  {Object} data Field:value object of the where clause
 * @return {this}      Database
 */
Database.prototype.where = function(data) {
	if(!data) throw new Error("Please provide fields and their values in Database#where");

	var where = [];

	for(var field in data)
		where.push("`" + field + "` = " + this.escape(data[field]));

	this.queryString = this.queryString + " WHERE " + where.join(" AND ");

	return this;
};

/**
 * Query Builder. Add a orderby clause to the query builder.
 * @param  {String} field The field to order by
 * @param  {"ASC"|"DESC"} sort  The sort order.
 * @return {this}       Database.
 */
Database.prototype.orderby = function(field, sort) {
	if(!field) throw new Error("Please provide a field to orderby in Database#orderby");

	var orderbyTemplate = "ORDER BY {{field}} {{sort}}";

	orderbyTemplate = this._replace(orderbyTemplate, "field", "`" + field + "`");
	orderbyTemplate = this._replace(orderbyTemplate, "sort", sort || "DESC");

	this.queryString = this.queryString + " " + orderbyTemplate;

	return this;
};

/**
 * Query builder. Add a limit clause to the query builder.
 * @param  {Number} top    The base limit.
 * @param  {Number} bottom The upper limit (optional)
 * @return {this}        Database
 */
Database.prototype.limit = function(top, bottom) {
	if(!top && top !== 0) throw new Error("Please provide a limit in Database#limit");

	var limitTemplate = "LIMIT {{limits}}";

	limitTemplate = this._replace(limitTemplate, "limits", (((top || top == 0) && bottom) ? [top, bottom] : [top]).join(", "));

	this.queryString = this.queryString + " " + limitTemplate;

	return this;
};

/**
 * Query builder. Executes the queued queries.
 * @param  {Function} callback Callback with results.
 * @return {this}      Database.
 */
Database.prototype.execute = function(callback) {
	if(!this.queryString) throw new Error("Please create a query for me to execute first!");

	this.query(this.queryString, callback);
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

/**
 * The interface with the database. Should be changed for different
 * databases.
 * @param  {String}   query    The query string.
 * @param  {Function} callback The callback function.
 */
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