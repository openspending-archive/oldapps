/*jshint undef: true, browser:true, jquery: true, devel: true */
/*global OpenSpendings, vis4 */

/*
 * loads the data and initializes the bubblechart
 * you need to include the bubblechart.min.js first
 */
OpenSpendings.BubbleChart.Loader = function(config) {

	var me = this;

	me.config = config;

	/*
	 * is called by the constructor of the Loader
	 */
	me.loadData = function() {
        var me = this;

        me.rootNode = { label: me.config.rootNodeLabel };

	    OpenSpendings.BubbleChart.getTree(
			me.config.apiUrl,
			me.config.dataset,
			me.config.drilldowns,
			me.config.cuts,
			me.dataLoaded.bind(me),
			me.config.testDataPath
		);
	};

	/*
	 * is called by getTree() once the data is loaded
	 */
	me.dataLoaded = function(data) {
		var me = this,
			tree = OpenSpendings.BubbleChart.buildTree(data, me.config.drilldowns, me.rootNode);
		me.run(tree);
	};

	/*
	 * defines the local bubble styles (which override and extend the
	 * global styles that are passed along with the data nodes)
	 */
	me.bubbleStyles = {
		'root': { // Total
			color: '#999999'
		},
		'10': { // Helping Others
			color: '#f4714c'
		},
		'02': { // Defence
			color: '#999933'
		},
		'05': { // Environment
			color: '#006633'
		},
		'07': { // Health
			color: '#cc0066'
		},
		'03': { // Order & Safety
			color: '#0099cc'
		},
		'06': { // Our Streets
			color: '#cc6666'
		},
		'08': { // Culture
			color: '#cccc00'
		},
		'01': { // Running Government
			color: '#9900cc'
		},
		'09': { // Education
			color: '#3333cc'
		},
		'04': { // Country, Social Systems
			color: '#33cc33'
		}
	};

	/*
	 * initializes all stuff needed by the tooltips
	 */
	me.tooltipTimer = undefined;

	/*
	 * this function is called by the bubbles if the user hovers over them
	 */
	me.setTooltip = function(event) {
		var tt = $('#bubble-chart-wrapper .tooltip'), tthtml = '<div class="header"><div class="icon"></div><div class="title">'+event.node.label+' ('+event.node.id+')</div><div class="amount">'+OpenSpendings.BubbleChart.Utils.formatNumber(event.node.amount)+'&euro;</div></div>'+'<div class="row"><a>More Information</a></div>'+'<div class="row"><a>Add to Compare-O-Tron</a></div>';

		if (tt.length > 0) {
			tt.html(tthtml);
		} else {
			tt = $('<div class="tooltip">'+tthtml+'</div>');
			$('#bubble-chart-wrapper').append(tt);
		}
		$('#bubble-chart-wrapper .tooltip .icon').css({ background: event.target.color });
		event.mouseEventGroup.addMember(tt);
		tt.css({ left: (event.position.x-tt.width()*0.5)+'px', top: (event.position.y+ 10)+'px', opacity: 0 });
		me.tooltipTimer = new vis4.DelayedTask(2000, this, me.showTooltip.bind(me), tt);
	};

	/*
	 * shows a tooltip, is called delayed by setTooltip
	 */
	me.showTooltip = function(tt) {
		tt.animate({ opacity: 1 }, { duration: 300 });
		tt.show();
	};

	/*
	 * hides the tooltip for a specific node
	 */
	me.hideTooltip = function(event) {
		var tt = $('#bubble-chart-wrapper .tooltip');
		tt.css({ opacity: 0, left: '-500px' });
		tt.hide();
		event.mouseEventGroup.removeMember(tt);
		me.tooltipTimer.cancel();
	};

	/*
	 * run will be called by dataLoaded once, well, the data is loaded
	 */
	me.run = function(data) {
		var me = this;
		// initialize bubble chart
		var bubbleChart = new OpenSpendings.BubbleChart(
			me.config,
			me.setTooltip.bind(me),
			me.hideTooltip.bind(me)
		);
		bubbleChart.setData(data);
		// we'll store the instance for debugging purposes
		window.bubblechart = bubbleChart;
	};

	// override bubble styles
	if (me.config.hasOwnProperty('bubbleStyles')) {
		me.bubbleStyles = me.config.bubbleStyles;
	}

	me.loadData();

};
