 var Model = function(data) {
	if(!data) throw new Error("Please supply model configuration");
	if(!data.schema) throw new Error("Please provide a model schema.");

	for(var key in data)
		this[key] = data[key];
};

Model.prototype._define = function(definition) {

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

Model.prototype.query = function(query, callback) {

};

Model.prototype.insert = function(data) {

};

module.exports = Model;