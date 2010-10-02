(function() {
/*
	Abstract the WDMMG data store (accessed via its api).
*/

// TODO: move this somewhere common for all code
this.WDMMG = {};

this.WDMMG.datastore = {
	config: {
		dataStoreApi: 'http://data.wheredoesmymoneygo.org/api',
	},

	'breakdown': {
	},
	'keys': {
	},

	getAggregate: function(aggregateSpec) {
		return this.breakdown[this.breakdownIdentifierString(aggregateSpec)];
	},

	breakdownIdentifierString: function(breakdownIdentifier) {
		var out = 'slice=' + breakdownIdentifier.dataset;
		// deep copy
		var keys = [].concat(breakdownIdentifier.breakdownKeys? breakdownIdentifier.breakdownKeys : []);
		// sort the keys as order does not matter for aggregation
		keys.sort();
		for(var i in keys) {
			out += '&breakdown-' + keys[i] + '=yes';
		}
		return out;
	},

	loadData: function(aggregateSpec, callback) {
		var aggregateString = this.breakdownIdentifierString(aggregateSpec);
		if (DEBUG) {
			this.breakdown[aggregateString] = dept_region;
			// TODO: make this generic ...
			this.keys['from'] = key_from['enumeration_values'];
			this.keys['region'] = key_region['enumeration_values'];
			callback();
		} else {
			var api_url = this.config.dataStoreApi + '/aggregate?' + aggregateString + '&callback=?';
			$.getJSON(api_url, function(data) {
				this.breakdown[breakdownIdentifier] = data;
				// need to do work to ensure we only call render after *all* data loaded
				var done = 2; // number of total requests
				$.each(data.metadata.axes, function(i,key) {
					var api_url = this.config.dataStoreApi + '/rest/key/' + key + '?callback=?';
					$.getJSON(api_url, function(data) {
						this.keys[key] = data['enumeration_values'];
						done -= 1;
						if(done == 0) {
							callback();
						}
					});
				});
			});
		}
	}
};

})();
