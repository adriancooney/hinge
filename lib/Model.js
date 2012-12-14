var Model = function(data, db) {
	if(!db) throw new Error("Please supply db when creating a new Model.");
	if(!data.schema) throw new Error("Please provide a model schema.");

	this.schema = data.schema;
	if(data.relationships) this.relationships = data.relationships;

};

Model.prototype.typeCast = function(val, type) {
	return this.Type(val, type).value;
};

/**
 * Typecast and test types of data. Returns object
 * with information about the data. Example:
 *
 * Example:
 * 		Model.Type(5, "int");
 *
 * Returns:
 * 		{
 * 			value: 5, //Type casted value
 * 			inputType: "int", //Input values
 * 			inputData: 5,
 * 			type: "number", //Actual type
 * 			matched: true //Did it match the provided type
 * 		}
 * 	
 * @param {string|int|float} val  The value to be tested/casted
 * @param {string} type The expected type/type to be casted
 */
Model.prototype.Type = function(val, type) {
	//Lower the case and remove all whitespace
	type = type.replace(/\s/g, "").toLowerCase();

	//Regex for testing the types
	var typeTests = {
		nonvariable: /(int(?:eger)?|number|bool(?:ean)?|string|float)/
	};

	function res(err, cast, actualType) {
		return (err) ? {
			value: null,
			inputType: type,
			inputData: val,
			type: typeof val,
			matched: false
		} : {
			value: cast,
			inputType: type,
			inputData: val,
			type: actualType,
			matched: true
		}
	}

	//Test for non variable types such as INT or integer
	if(typeTests.nonvariable.test(type)) {
		//Set the true type
		type = RegExp.$1;

		switch(type) {
			case "int": case "integer": case "number":
				if((typeof val === "number" || parseInt(val)) && !val.toString().match(/\./)) //Careful, 0.001 (float) matchs to "number"
				   return res(false, parseInt(val), "number");
				else 
					return res(true); //Error! Input type does not match
			break;

			case "float":
				if((typeof val === "number" || parseFloat(val)) && val.toString().match(/\./))
					return res(false, parseFloat(val), "float");
				else
					return res(true);
			break;

			case "string":
				if(typeof val === "string")
					return res(false, val, "string");
				else 
					return res(true);
			break;

			case "boolean": case "bool":
				if(val.toString().replace(/\s/g, "").toLowerCase().match(/(true|false)/))
					return res((RegExp.$1 == "true") ? true : false, "boolean");
				else 
					return res(true);
			break;
		}
	}
};

Model.prototype.create = function(data, callback) {
	var inserts = {};

	//Create an object and funnel fields to their particular tables
	for(var field in data) {
		var table = this.associateFieldWithTable(field);

		if(!table[0]) throw new Error("Field '" + field + "' has not been defined in the schema in Model#create");

		if(!inserts[table[0]]) {
			inserts[table[0]] = {};
		}

		inserts[table[0]][field] = data[field];
	}

	//Convert inserts to an array to recur over
	var recurArr = [];
	for(var table in inserts) recurArr.push([table], inserts[table]);

	(function recur(arr, i, callback) {

	})(inserts, 0)
};

Model.prototype.getTableToIterate = function() {

};

Model.prototype.orderTablesBasedOnImportance = function() {
	var rels = {};

	//Create a table of which relationship recurs the most
	for(var rel in this.relationships) {
		rels[rel] = (this.relationships[rel]) ? 1 : rels[rel] + 1;
		rels[this.relationships[rel]] = (this.relationships[rel]) ? 2 : this.relationships[rel] + 2;
	}

	console.log("RELS: ", rels)

	var relsArr = [];
	//Push into an ordered array
	for(var rel in rels) {
		if(relsArr.length < 1) relsArr.push(rel);
		else if(rels[rel] < rels[relsArr[relsArr.length - 1]]) relsArr.push(rel);
		else if(rels[rel] > rels[relsArr[0]]) relsArr.unshift(rel);
		else relsArr.forEach(function(val, i) {
			if(rels[rel] > rels[val] && ((relsArr[i+1]) ? rels[rel] < rels[relsArr[i+1]] : false)) 
				relsArr = relsArr.splice(0, i).concat([rel].concat(relsArr.splice(i+1, relsArr.length)));
		});
		console.log("ITERATION: ", relsArr)
	}

	this._relationshipsOrdered = relsArr;

	return relsArr;
};

Model.prototype.associateFieldWithTable = function(field) {
	for(var table in this.schema) {
		for(var _field in this.schema[table]) {
			if(field == _field) return [table, table + "." + field];
		}
	}
};

Model.prototype.join = function(model) {

};

module.exports = Model;