
import ui.View;
import ui.TextView;
import ui.ImageView;

var defaults = {
	backgroundColor: 'white'
};

exports = Class(ui.View, function (supr) {

	this.init = function (opts) {
		opts = merge(opts, defaults);
		supr(this, 'init', [opts]);
		this.build();
	};

	this.build = function () {
		var bg = new ui.ImageView({
			superview: this,
			image: 'resources/images/sky.png',
			width: 576,
			height: 1024,
			x: 0,
			y: 0
		});

		var play = new ui.TextView({
			x: 140,
			y: 400,
			width: 300,
			height: 100,
			text: 'PLAY',
			superview: this,
			color: 'white'
		});
		play.on('InputSelect', bind(this, function () {
			this.emit('game:start');
		}));

		var title = new ui.TextView({
			x: 140,
			y: 100,
			width: 300,
			height: 100,
			color: 'white',
			text: 'Flappy Gleen',
			superview: this
		});

		
	};

});
