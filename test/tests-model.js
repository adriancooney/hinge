var Model = require("../index.js").Model,
	assert = require("assert");

describe("Model", function() {

	describe("Initlizing a new Model", function() {
		it("should generate a new Model", function() {
			var m = new Model({
				schema: {
					"users": {
						"id": "int"
					}
				}
			})
		});
	});

	//Initlize a sample model
	var mod = new Model({
		schema: {}
	});

	describe("#Type", function() {

		it("should match types", function() {
			assert.deepEqual(mod.Type(1, "int"), {
				value: 1,
				inputType: "int",
				inputData: 1,
				type: "number",
				matched: true
			});
		});

		it("should not match types", function() {
			assert.deepEqual(mod.Type(1, "string"), {
				value: null,
				inputType: "string",
				inputData: 1,
				type: "number",
				matched: false
			});
		});
	});

	describe("#typeCast", function() {
		it("should type cast string int to number", function() {
			var num = mod.typeCast("1", "number");

			assert.equal(num, 1);
		});
	});
});