
import ui.View;
import ui.TextView;
import src.ParallaxView as ParallaxView;
import src.Physics as Physics;
import math.util as util;
import ui.ImageView;
import ui.SpriteView as SpriteView;
import animate;
import AudioManager;

var defaults = {
	backgroundColor: 'red'
};
var score = 0;
var first = true;
var finish = false;

exports = Class(ui.View, function (supr) {

	this.init = function (opts) {
		opts = merge(opts, defaults);
		supr(this, 'init', [opts]);

		this.setupParallaxView();
		this.setupPlayer();
		this.loadSound();
		this.on('game:start' , function(){	
			this.startGame();
		});

	};

	this.setupParallaxView = function () {
		this.parallaxView = new ParallaxView({
			superview: this,
			height: this.style.height,
			width: this.style.width
		});

		this.parallaxView.addBackgroundView(new ui.ImageView({
			image: 'resources/images/sky.png',
			width: 576,
			height: 1024,
			x: 0,
			y: 0
		}));

		this.parallaxView.addLayer({
			distance: 10,
			populate: function (layer, x) {
				var view = layer.obtainView(ui.ImageView, {
					image: 'resources/images/ground.png',
					superview: layer,
					x: x,
					y: layer.style.height - 50,
					width: 200,
					height: 50
				});

				Physics.addToView(view, {
					group: 'ground'
				});

				view.setCollisionEnabled(true);
				return view.style.width;
			}
		});

		this.gameLayer = this.parallaxView.addLayer({
			distance: 10,
			populate : function (playerLayer, x){
				if(first) {
					first = false;
					return 500;
				}

				var pipeTrigger = playerLayer.obtainView(ui.View, {
					superview: playerLayer,
					backgroundColor: 'blue',
					x: x + 20,
					y: util.random(150 , playerLayer.style.height - 400),
					width: 0.1,
					height: util.random(150,300),
					
				});

				var pipe1 = playerLayer.obtainView(ui.ImageView, {
					superview: playerLayer,
					image: 'resources/images/tube.png',
					x: x,
					y: pipeTrigger.style.height + pipeTrigger.style.y + 5,
					width: 65,
					height: playerLayer.style.height - 50 - (pipeTrigger.style.height + pipeTrigger.style.y)
				});

				var pipe2 = playerLayer.obtainView(ui.ImageView, {
					superview: playerLayer,
					image: 'resources/images/tube2.png',
					x: x,
					y: 0,
					width:65,
					height: pipeTrigger.style.y
				})

				Physics.addToView(pipe1, {
					group: 'pipe'
				});
				Physics.addToView(pipe2, {
					group: 'pipe'
				});
				Physics.addToView(pipeTrigger, {
					group: 'pipeTrigger'
				});
				pipe2.setCollisionEnabled(true);
				pipe1.setCollisionEnabled(true);
				pipeTrigger.setCollisionEnabled(true);
				return pipe2.style.width * 6;
			}

		});
	};

	this.loadSound = function (){
		this.sound = new AudioManager({
			path: "resources/audio",
			files: {
				jump: { volume: 1, path: 'effects'},
				point: { vlolume: 1, path: 'effects'},
			}
		});
	};

	this.setupPlayer = function () {
		// this.player = new ui.View({
		// 	height: 50,
		// 	width: 50,
		// 	x: 0,
		// 	y: 0,
		// 	
		// 	backgroundColor: 'yellow'
		// });
		

		this.player = new SpriteView({
		  x: 0,
		  y: 0,
		  width: 65,
		  height: 65,
		  url: 'resources/images/gleen/gleen',
		  frameRate: 10,
		  defaultAnimation: 'fly',
		  loop: true,
		  autoStart: true,
		  zIndex: 99999,
		});
		
		Physics.addToView(this.player, {
			group: 'player',
			hitbox: {
				x: 0,
				y: 20,
				width: 50,
				height: 30,
			}
		});
		this.player.setCollisionEnabled(true);
		this.scoreBoard = new ui.TextView({
			superview: this,
			x: 120,
			y: 200,
			width: 320,
			height: 50,
			autoSize: false,
			size: 100,
			verticalAlign: 'middle',
			horizontalAlign: 'center',
			wrap: false,
			color: 'white'
		});

		this.over = new ui.TextView({
				superview: this,
				x: 120,
				y: 100,
				width: 320,
				height: 50,
				autoSize: false,
				size: 38,
				verticalAlign: 'middle',
				horizontalAlign: 'center',
				wrap: false,
				color: 'white',
			});

		this.on('InputStart', bind(this, function () {
			if(this.finish){
				this.emit('game:end');
			}else{
				this.player.velocity.y = -500;
				this.sound.play('jump');
			}
		}));
	};

	this.tick = function () {
		

		this.gameLayer.scrollTo(this.player.getLeft() - 50, 0);

		var hits = this.player.getCollisions('ground');
		for (var i = 0; i < hits.length; i++) {
			var hit = hits[i];
			if (this.player.getPrevBottom() <= hit.view.getTop()+ 10 && this.player.velocity.y >= 0) {
				this.player.position.y -= hit.intersection.height;
				this.player.velocity.y = 0;
				this.player.velocity.x = 0;
				this.player.acceleration.x = 0; 
				this.stopWorld();
				this.finish = true;

			}
			console.log(hits.length);
		}

		var hits2 = this.player.getCollisions('pipe');
		for (var i = 0; i < hits2.length; i++) {
			var hit = hits2[i];
			this.player.velocity.x = 0;
			this.player.acceleration.x = 0; 
			this.finish = true;
		}

		var hits3 = this.player.getCollisions('pipeTrigger');
		for (var i = 0; i < hits3.length; i++) {
			var hit = hits3[i];
				this.sound.play('point');
				score= score + 1;
				hit.view.setCollisionEnabled(false);
				hit.view.removeFromSuperview();
			
		}		
		
		this.scoreBoard.setText(score);
		if(this.finish == true){
			this.over.setText('Game Over');
		};
	};

	this.stopWorld = function(){
		this.player.velocity.x = 0;
		Physics.stop();
		this.player.pause();
	};


	this.startGame = function () {
		first = true;
		score = 0;
		this.over.setText('');
		animate(this.parallaxView).commit();
		this.parallaxView.scrollTo(0,0);
		this.parallaxView.clear();
		this.finish = false;
		this.gameLayer.addSubview(this.player);
		this.player.setPosition(0, 300);
		this.player.setVelocity(200, -400);
		this.player.setAcceleration(0, 1400);
		this.player.setCollisionEnabled(true);
		this.player.resume();
		// this.over.removeFromSuperview();
		Physics.start();


	};

	
});
