var Register = {
	models: [],
	routes: [],

	registerModel: function(model) {
		this.models.push(model);
	},

	getDatabase: function() {
		return Database
	}
};