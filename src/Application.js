
import ui.StackView;
import src.TitleScreen as TitleScreen;
import src.GameScreen as GameScreen;
import device;

var boundsWidth = 576;
var boundsHeight = 1024;

var baseWidth = boundsWidth; //576
var baseHeight =  device.screen.height * (boundsWidth / device.screen.width); //864
var scale = device.screen.width / baseWidth; //1

exports = Class(GC.Application, function () {

	this.initUI = function () {


		this.view.style.scale = scale;

		var stackView = new ui.StackView({
			x: 0,
			y: 0,
			height: baseHeight,
			width: baseWidth,
			superview: this.view
		});

		var titleScreen = new TitleScreen({
			width: baseWidth,
			height: baseHeight
		});

		var gameScreen = new GameScreen({
			width: baseWidth,
			height: baseHeight
		});

		stackView.push(titleScreen);

		titleScreen.on('game:start', function () {
			stackView.push(gameScreen);
			gameScreen.emit('game:start');
		});

		gameScreen.on('game:end', function () {
			stackView.pop();
		});

	};
	
	this.launchUI = function () {};
});
