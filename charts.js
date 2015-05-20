/*

	charts.js

	business charts for morphic.js

	written by Jens Mönig
	jens@moenig.org

	Copyright (C) 2015 by Jens Mönig

	charts.js is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as
	published by the Free Software Foundation, either version 3 of
	the License, or (at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.


	prerequisites:
	--------------
	needs morphic.js and widgets.js


	I. hierarchy
	-------------
	the following tree lists all constructors hierarchically,
	indentation indicating inheritance. Refer to this list to get a
	contextual overview:

	Morph*
		BoxMorph*
			ChartMorph
		GridMorph
		LineMorph

	* from Morphic.js


	II. toc
	-------
	the following list shows the order in which all constructors are
	defined. Use this list to locate code in this document:

	GridMorph
	LineMorph
	ChartMorph

*/

// Global settings /////////////////////////////////////////////////////

/*global modules, newCanvas, Point, Morph, WorldMorph, Color, BoxMorph,
StringMorph, ScrollFrameMorph, MorphicPreferences, SliderMorph,
ToggleMorph, HandleMorph*/

modules.charts = '2012-Oct-18';

var GridMorph;
var LineMorph;
var ChartMorph;

WorldMorph.prototype.customMorphs = function () {
	// add examples to the world's demo menu

	return [
		new GridMorph(),
		new ChartMorph()
	];
};

// GridMorph ///////////////////////////////////////////////////////////

// I am a chart's coordinate system

// GridMorph inherits from Morph:


GridMorph.prototype = new Morph();
GridMorph.prototype.constructor = GridMorph;
GridMorph.uber = Morph.prototype;

GridMorph.prototype.colors = [
	new Color(195, 10, 0),
	new Color(0, 175, 175),
	new Color(255, 185, 50),
	new Color(100, 0, 235)
];

// GridMorph instance creation:

function GridMorph() {
	this.init();
}

GridMorph.prototype.init = function (x, y, xLines, yLines) {
	// additional attributes:
	this.backgroundColor = new Color(30, 30, 30);

	this.xUnits = x || (x === 0 ? 0 : 14);
	this.yUnits = y || (y === 0 ? 0 : 200);
	this.xInterval = xLines || 1;
	this.yInterval = yLines || 25;

	this.axesWidth = 1;
	this.lineWidth = 1;
	this.fontSize = 10;

	this.isFilled = true;

	this.columns = [
		'1998',
		'1999',
		'2000',
		'2001',
		'2002',
		'2003',
		'2004',
		'2005',
		'2006',
		'2007',
		'2008',
		'2009',
		'2010',
		'2011',
		'2012'
	];

	this.columnInterval = 1;

	this.rows = [
		'cherries',
		'apples',
		'bananas',
		'plums'
	];

	this.lines = [
		[190, 160, 40, 120, 30, 70, 82, 130, 163, 149, 138, 112, 186, 152,
			161],
		[3, 40, 30, 45, 35, 49, 37, 24, 31, 18, 74, 86, 98, 42, 37],
		[10, 180, 10, 85, 25, 79, 80, 82, 130, 64, 48, 50, 53, 78, 82],
		[40, 80, 90, 25, 15, 119, 110, 86, 75, 163, 156, 174, 23, 12, 23]
	];

	// initialize inherited attributes:
	GridMorph.uber.init.call(this);

	// override inherited attributes:
	this.noticesTransparentClick = true;
	this.color = new Color(50, 50, 50);
	this.setExtent(new Point(950, 280));
	this.createLabels();
	this.createLines();
	this.fixLayout();
};

GridMorph.prototype.fixLayout = function () {
	var	myself = this,
		colNo = 0,
		xunit = this.width() / this.xUnits;
	this.columnInterval = Math.max(
		Math.round(this.visibleBounds().width() / xunit / 5),
		1
	);
	this.children.forEach(function (m) {
		if (m instanceof LineMorph) {
			m.bounds = myself.bounds.copy();
			m.isFilled = myself.isFilled;
			m.drawNew();
		} else if (m.isXLabel) {
			if (colNo % myself.columnInterval === 0) {
				m.show();
				m.setCenter(new Point(
					myself.left() + colNo * xunit,
					myself.bottom() + myself.fontSize
				));
			} else {
				m.hide();
			}
			colNo += 1;
		}
	});
	this.changed();
};

GridMorph.prototype.drawNew = function () {
	// initialize my surface property
	var context, i, x, y, temp;

	temp = this.color;
	this.color = this.backgroundColor;
	GridMorph.uber.drawNew.call(this);
	this.color = temp;

	//this.image = newCanvas(this.extent());
	context = this.image.getContext('2d');

	context.lineWidth = this.axesWidth;
	context.strokeStyle = this.color.toString();

	// axes:
	context.beginPath();
	context.moveTo(this.axesWidth / 2, 0);
	context.lineTo(
		this.axesWidth / 2,
		this.height() - this.axesWidth / 2
	);
	context.lineTo(
		this.width(),
		this.height() - this.axesWidth / 2
	);
	context.stroke();

	context.lineWidth = this.lineWidth;

	// horizontal lines:
	if (this.yInterval) {
		for (i = 0; i <= this.yUnits; i += this.yInterval) {
			y = this.height()
				- (i * (this.height() / this.yUnits))
				+ this.lineWidth / 2;
			context.moveTo(0, y);
			context.lineTo(this.width(), y);
			context.stroke();
		}
	}

	// vertical lines:
	if (this.xInterval) {
		for (i = 0; i <= this.xUnits; i += this.xInterval) {
			x = i * (this.width() / this.xUnits)
				- this.lineWidth / 2;
			context.moveTo(x, 0);
			context.lineTo(x, this.height());
			context.stroke();
		}
	}
	this.fixLayout();
};

GridMorph.prototype.createLines = function () {
	var myself = this, lm, i = 0;
	this.lines.forEach(function (line) {
		lm = new LineMorph(
			myself.rows[i],
			myself.xUnits,
			myself.yUnits,
			line,
			myself.colors[i],
			this.isFilled
		);
		lm.setPosition(myself.position().copy());
		myself.add(lm);
		i += 1;
	});
};

GridMorph.prototype.createLabels = function () {
	var	myself = this, lm, i = 0;

	this.columns.forEach(function (col) {
		lm = new StringMorph(
			col,
			myself.fontSize,
			null,
			true,
			false
		);
		lm.isXLabel = true;
		lm.setColor(new Color(230, 230, 230));
		myself.add(lm);
		i += 1;
	});
};

GridMorph.prototype.mouseEnter = function () {
    this.children.forEach(function (child) {
        if (child instanceof LineMorph) {
            child.startStepping();
        }
    });
};


GridMorph.prototype.mouseLeave = function () {
    this.children.forEach(function (child) {
        if (child instanceof LineMorph) {
            child.stopStepping();
        }
    });
};

// LineMorph ///////////////////////////////////////////////////////////

// I am a line chart's line

// LineMorph inherits from Morph:


LineMorph.prototype = new Morph();
LineMorph.prototype.constructor = LineMorph;
LineMorph.uber = Morph.prototype;

// LineMorph instance creation:

function LineMorph(label, x, y, values, color, isFilled) {
	this.init(label, x, y, values, color, isFilled);
}

LineMorph.prototype.init = function (label, x, y, values, color, isFilled) {
	var rider;

	// additional attributes:
	this.label = label || '';
	this.xUnits = x || (x === 0 ? 0 : 5);
	this.yUnits = y || (y === 0 ? 0 : 200);
	this.values = values || [];
	this.isFilled = isFilled || false;

	this.lineWidth = 6;

	rider = new BoxMorph(this.lineWidth);
	this.add(rider);

	// initialize inherited attributes:
	LineMorph.uber.init.call(this);

	// override inherited attributes:
	this.color = color || new Color(255, 255, 255);
	this.setExtent(new Point(550, 280));
};

LineMorph.prototype.lineY = function (value) {
	var	yunit = this.height() / this.yUnits;
	return (this.height() - value * yunit) + this.top();
};

LineMorph.prototype.valueAt = function (x) {
	var	xunit = this.width() / this.xUnits,
		idx = Math.floor(x / xunit),
		left = idx * xunit,
		right = (idx + 1) * xunit;

	return this.values[idx] +
		((x - left) / (right - left)
			* (this.values[idx + 1] - this.values[idx]));
};

LineMorph.prototype.rider = function () {
	var rider, lbl;
	if (this.children[0]) {
		return this.children[0];
    }
    lbl = new StringMorph(
        this.yUnits,
        10,
        null,
        false,
        false,
        false,
        new Point(-1, -1),
        this.color.darker(50)
    );
    lbl.setColor(new Color(255, 255, 255));

    rider = new BoxMorph(lbl.height() / 2);

    rider.border = 1;
    rider.setExtent(lbl.extent().add(rider.border + 4));
    rider.drawNew = ChartMorph.prototype.drawGradient;
    rider.label = function () {return lbl; };

    rider.add(lbl);
    this.add(rider);
    return rider;
};

LineMorph.prototype.drawNew = function () {
	// initialize my surface property
	var context, rider;

	this.image = newCanvas(this.extent());
	context = this.image.getContext('2d');
	context.strokeStyle = this.color.toString();
	context.lineWidth = this.lineWidth;
	context.lineJoin = 'round';

	this.linePath(context);
	context.stroke();

	if (this.isFilled) {
		this.fill(context);
	}

	rider = this.rider();
	rider.borderColor = this.color.darker(40);
	rider.color = this.color.lighter(30);
	rider.drawNew();
	rider.hide();
};

LineMorph.prototype.linePath = function (context) {
	var i, x, y;

	for (i = 0; i < this.values.length; i += 1) {
		if (this.values[0] !== null) {
			x = i * (this.width() / this.xUnits);
			y = this.height()
				- (this.values[i] * (this.height() / this.yUnits));
			if (i === 0) {
				context.moveTo(x, y);
			} else {
				context.lineTo(x, y);
			}
		}
	}
};

LineMorph.prototype.fill = function (context) {
	var halftone = this.color.copy();
	halftone.a = 0.2;

	context.fillStyle = halftone.toString();
	context.beginPath();
	this.linePath(context);
	context.lineTo(this.width(), this.height());
	context.lineTo(0, this.height());
	context.closePath();
	context.fill();
};

LineMorph.prototype.startStepping = function () {
	var myself = this;
	this.rider().show();
	this.step = function () {
		var	pos = myself.world().hand.position(),
			value = this.valueAt(pos.x - this.left()),
			rider = this.rider();
		rider.label().setText(Math.round(value));
		rider.label().setCenter(rider.center());
		rider.setCenter(new Point(
			pos.x,
			myself.lineY(value)
		));
		rider.show();
	};
};

LineMorph.prototype.stopStepping = function () {
	this.step = null;
	this.rider().hide();
};

LineMorph.prototype.isShowing = function () {
	return this.isVisible;
};

LineMorph.prototype.toggleFading = function () {
	if (this.isShowing()) {
		this.hide();
	} else {
		this.show();
	}
	this.rider().hide();
};

// ChartMorph //////////////////////////////////////////////////////////

// ChartMorph inherits from BoxMorph:

ChartMorph.prototype = new BoxMorph();
ChartMorph.prototype.constructor = ChartMorph;
ChartMorph.uber = BoxMorph.prototype;

// ChartMorph instance creation:

function ChartMorph() {
	this.init();
}

ChartMorph.prototype.init = function () {
	this.label = 'Sales by Product';
	this.padding = 10;

	ChartMorph.uber.init.call(
		this,
		0, // rounding
		1, // 1.000001, // shadow bug in Chrome,
		new Color(20, 20, 20)
	);
	this.color = new Color(50, 50, 50);
	this.edge = 10;
	this.contents = new GridMorph();
	this.labelMorph = null;
	this.zoomer = null;
	this.frame = null;
	this.legend = null;
	this.isDraggable = false;
	this.buildParts();
	this.setExtent(new Point(500, 400));
	this.handle = new HandleMorph(this, 275, 225, 4, 4);
};

ChartMorph.prototype.buildParts = function () {
	var grid = this.contents, i, lm, last, myself = this;

	this.labelMorph = new StringMorph(
		this.label,
		grid.fontSize * 2,
		null,
		true,
		false
	);
	this.labelMorph.setColor(new Color(230, 230, 230));
	this.add(this.labelMorph);

	this.legend = new Morph();
	this.legend.color = new Color(80, 80, 80);
	this.add(this.legend);
	this.contents.children.forEach(function (c) {
		if (c instanceof LineMorph) {
			lm = new ToggleMorph(
				'checkbox',
				c,
				'toggleFading',
				c.label,
				'isShowing',
				null,
				null
			);
			lm.color = c.color;
			lm.highlightColor = c.color.lighter();
			lm.pressColor = c.color.darker();
			lm.drawNew();
			lm.label.setColor(new Color(250, 250, 250));
			myself.legend.add(lm);
			if (last) {
				lm.setPosition(last.fullBounds().topRight().add(
					new Point(myself.padding, 0)
				));
			} else {
				lm.setPosition(
					myself.legend.position().add(myself.padding)
				);
			}
			last = lm;
		}
	});

	this.frame = new ScrollFrameMorph(this.contents, 10);
	this.frame.alpha = 0;
	this.frame.isDraggable = false;
	this.frame.acceptsDrops = false;
	this.frame.scrollY = function () {};
	this.frame.mouseScroll = function (amount) {
		this.scrollX(amount * MorphicPreferences.mouseScrollAmount);
		this.adjustScrollBars();
	};
	this.add(this.frame);

	this.zoomer = new SliderMorph();
	this.zoomer.orientation = 'vertical';
	this.zoomer.size = 10;
	this.zoomer.target = this;
	this.zoomer.action = 'zoom';
	this.add(this.zoomer);

	// create new y-axis labels:
	for (i = 0; i < grid.yUnits; i += grid.yInterval) {
		lm = new StringMorph(
			(i === 0 ? '0' : i.toString()),
			grid.fontSize,
			null,
			true,
			false
		);
		lm.isYLabel = true;
		lm.setColor(new Color(230, 230, 230));
		this.add(lm);
	}
};

// ChartMorph layout:

ChartMorph.prototype.fixLayout = function () {
	var grid = this.contents, inset, i, y, myself = this;

	if (this.labelMorph) {
		this.labelMorph.setCenter(this.center());
		this.labelMorph.setTop(this.top() + this.border + this.padding);
	}
	if (this.legend) {
		this.legend.setExtent(new Point(
			this.width() - this.border,
			this.padding * 2 + 15
		));
		this.legend.setBottom(
			this.bottom() - this.border - this.edge - this.padding
		);
	}
	if (this.frame) {
		inset = new StringMorph(
			grid.yUnits,
			grid.fontSize,
			null,
			false,
			false
		).width() + this.border + 3 + this.padding;
		this.frame.silentSetPosition(new Point(
			this.left() + inset,
			this.labelMorph.bottom() + this.border + this.padding
		));
		this.frame.bounds.corner = this.legend.topRight().subtract(new Point(
			18 + this.padding,
			this.padding
		));
		this.frame.drawNew();
		this.contents.setExtent(new Point(
			this.frame.width(),
			this.frame.height() - 30
		));
		this.frame.adjustScrollBars();

		// position y-axis labels:
		this.children.forEach(function (m) {
			if (m.isYLabel) {
				i = parseFloat(m.text);
				y = grid.height() - (i * (grid.height() / grid.yUnits))
					+ grid.top();
				m.setCenter(new Point(0, y));
				m.setRight(myself.frame.left() - 2);
			}
		});
	}
	if (this.zoomer) {
		this.zoomer.silentSetPosition(this.frame.topRight().add(
			new Point(5, 0)
		));
		this.zoomer.bounds.corner = new Point(
			this.right() - this.border - this.padding,
			this.contents.bottom()
		);
		this.zoomer.start = this.frame.width();
		this.zoomer.stop = this.contents.xUnits / 3 * this.width();
		this.zoomer.value = this.zoomer.start;
		this.zoomer.updateTarget();
		this.zoomer.size = (this.zoomer.stop - this.zoomer.start) / 5;
		this.zoomer.drawNew();
		this.zoomer.changed();
	}
};

ChartMorph.prototype.zoom = function (w) {
	var	xunit = this.contents.width() / this.contents.xUnits,
		offsetRatio = (this.frame.left() - this.contents.left()) / xunit;
	this.contents.setWidth(w);
	xunit = this.contents.width() / this.contents.xUnits;
	this.contents.setLeft(this.frame.left() - (xunit * offsetRatio));
	this.frame.scrollX(0);
	this.frame.adjustScrollBars();
};

// ChartMorph drawing:

ChartMorph.prototype.drawGradient = function () {
	var	context,
		gradient;
	this.image = newCanvas(this.extent());
	context = this.image.getContext('2d');
	if ((this.edge === 0) && (this.border === 0)) {
		BoxMorph.uber.drawNew.call(this);
		return null;
	}
	gradient = context.createLinearGradient(0, 0, 0, this.height());
	gradient.addColorStop(0, this.color.lighter(30).toString());
	gradient.addColorStop(1, this.color.darker(30).toString());
	context.fillStyle = gradient;
	context.beginPath();
	this.outlinePath(
		context,
		Math.max(this.edge - this.border, 0),
		this.border
	);
	context.closePath();
	context.fill();
	if (this.border > 0) {
		gradient = context.createLinearGradient(0, 0, 0, this.height());
		gradient.addColorStop(0, this.borderColor.lighter(30).toString());
		gradient.addColorStop(1, this.borderColor.darker(30).toString());
		context.lineWidth = this.border;
		context.strokeStyle = gradient;
		context.beginPath();
		this.outlinePath(context, this.edge, this.border / 2);
		context.closePath();
		context.stroke();
	}
};

ChartMorph.prototype.drawNew = function () {
	this.drawGradient();
	this.fixLayout();
};
