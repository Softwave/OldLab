/* SurfaceState.js 
 * On the surface of Enceladus 
 */

//Variables
var notDead = true;
var canDrill = false; 
var map; 

Game.SurfaceState = function(game) {
	this.hudTxt = null;
	this.drillTxt = null;
	this.gameoverTxt = null; 
};

Game.SurfaceState.prototype.preload = function() {
	//BACKGROUND
	this.game.load.image('background','assets/bg.png');

	//MAP
	this.game.load.tilemap('level0', 'assets/maps/level0.json', null, Phaser.Tilemap.TILED_JSON);
	this.game.load.image('tiles','assets/maps/surfaceTiles.png',16,16);

	//Lander
	this.game.load.spritesheet('lander','assets/lander.png',24,24);
	this.game.load.spritesheet('landerGibs','assets/landerGibs.png',8,8);
    this.game.load.image('smoke','assets/smoke.png');


	//Sounds
	this.game.load.audio('explosion','assets/explosion.mp3');
	this.game.load.audio('engine','assets/engine.mp3');
};

Game.SurfaceState.prototype.create = function() {
	//Start
	notDead = true; 
	landerDestroyed = false; 
	if (restarting == true) {
		numberOfSubs = 3;
		data = 0;
		discoveredLife = false;
		startPosX = 60;
		startPosY = 0;
		restarting = false; 
	}
	game.physics.startSystem(Phaser.Physics.ARCADE);
	game.stage.backgroundColor = '#000000';
	background = game.add.tileSprite(0,0,1600,600,"background");

	//HUD
	this.drillTxt = this.add.bitmapText(200,200,'appleII',"ICE TOO THICK");
	this.drillTxt.align = 'center';
	this.drillTxt.fixedToCamera = true;
	this.hudTxt = this.add.bitmapText(5,20, 'appleII', 'Speed: ');
	this.hudTxt.align = 'left';
	this.hudTxt.fixedToCamera = true; 
	this.gameoverTxt = this.add.bitmapText(100,200,'appleII',"GAME OVER\nPRESS R TO RESTART");
	this.gameoverTxt.align = 'center';
	this.gameoverTxt.fixedToCamera = true;

	//Loading the map and setting up the collision layer 
	map = game.add.tilemap('level0');
	map.addTilesetImage('Tile Layer 1','tiles');
	map.setCollision(1);
	map.setCollision(2);
	layer = map.createLayer(0);
	layer.resizeWorld();
	layer.enableBody = true;

	//Physics
	this.ROTATION_SPEED = 180;
	this.ACCELERATION = 200;
	this.MAX_SPEED = 250;
	this.DRAG = 0;
	this.GRAVITY = 50;

	//Adding Lander 
	this.lander = this.game.add.sprite(startPosX,startPosY,'lander');
	this.lander.anchor.setTo(0.5,0.5);
	this.lander.angle = -90;  
	game.physics.enable(this.lander, Phaser.Physics.ARCADE);
	this.lander.body.maxVelocity.setTo(this.MAX_SPEED,this.MAX_SPEED);
	this.lander.body.drag.setTo(this.DRAG,this.DRAG);
	game.physics.arcade.gravity.y = this.GRAVITY;
	this.lander.body.bounce.setTo(0.25, 0.25); 

	//Lander Gibs
	  emitter = game.add.emitter(0,0,40);
	emitter.makeParticles('landerGibs',[0,1,2,3]);
	emitter.gravity = 200;
	if (emitter.countLiving <= 0) {
		emitter.stop();
	}
	smokeEmitter = game.add.emitter(this.lander.x,this.lander.y,400);
	smokeEmitter.makeParticles('smoke');
	smokeEmitter.gravity = 15;
	if (smokeEmitter.countLiving <= 0) {
	  smokeEmitter.stop();
	}

	//Sounds
	sndExplosion = game.add.audio('explosion');
	sndEngine = game.add.audio('engine',1,true);
	sndEngine.play();

	//Camera
	game.world.setBounds(0,0,1600,600);
	game.camera.follow(this.lander, Phaser.Camera.FOLLOW_LOCKON);

};

Game.SurfaceState.prototype.blowUp = function(x,y) {
	emitter.x = x;
	emitter.y = y;
	emitter.start(true,2000,null,40);
	sndExplosion.play();
	notDead = false; 
};

Game.SurfaceState.prototype.drill = function() { 
	game.state.start('sub',Game.SubState);
};


Game.SurfaceState.prototype.update = function() {
	//Collision
	game.physics.arcade.collide(this.lander,layer);
	game.physics.arcade.collide(emitter,layer);

	//Controls
	//Left and right 
	if (this.input.keyboard.isDown(Phaser.Keyboard.A)) {
		this.lander.body.angularVelocity = -this.ROTATION_SPEED; 
	} else if (this.input.keyboard.isDown(Phaser.Keyboard.D)) {
		this.lander.body.angularVelocity = this.ROTATION_SPEED;
	} else {
		this.lander.body.angularVelocity = 0;
	}

	//Engine Power
	if (this.input.keyboard.isDown(Phaser.Keyboard.W)) {
		this.lander.body.acceleration.x = Math.cos(this.lander.rotation) * this.ACCELERATION;
		this.lander.body.acceleration.y = Math.sin(this.lander.rotation) * this.ACCELERATION;
		this.lander.frame = 1;
		if (notDead) {
			sndEngine.resume();
		  //smokeEmitter.x = this.lander.x;
		  //smokeEmitter.y = this.lander.y;
		  //smokeEmitter.start();
		}

	} else {
		this.lander.body.acceleration.setTo(0,0);
		this.lander.frame = 0;
		sndEngine.pause();
	}

	//Check if landed or crashed
	if (this.lander.body.blocked.down) {
		if (notDead) {
			//Crashed
			if ((Math.abs(this.lander.body.velocity.y) > 20) || (Math.abs(this.lander.body.velocity.x) > 30)) {
				this.blowUp(this.lander.x,this.lander.y);
				this.lander.kill();
			} else { //Landed safely 
				this.lander.body.angularVelocity = 0;
				this.lander.body.velocity.setTo(0,0);
				this.lander.angle = -90; 
				if (this.lander.y >= 580) {
				  canDrill = true;
				} else {
				  canDrill = false; 
				}
				if (canDrill == true) {
					if (numberOfSubs > 0) this.drillTxt.text = "PRESS CONTROL\nTO DRILL";
					if (numberOfSubs == 0) this.drillTxt.text = "OUT OF AUVs";
					if (this.input.keyboard.isDown(Phaser.Keyboard.CONTROL)) {
						if (numberOfSubs > 0) this.drill();
				   	}
				}
				if (canDrill == false) {
					this.drillTxt.text = "THE ICE IS\nTOO THICK";
				}
				startPosX = this.lander.x;
				startPosY = this.lander.y;
			} 
		}    
	} else {
		this.drillTxt.text = "";
	}

   //Don't let lander go off screen 
   //basically an asteroids style screen-wrap
   if (this.lander.x > 1600) this.lander.x = 0;
   if (this.lander.x < 0) this.lander.x = 1600; 
   if (this.lander.y < 0) {
   		game.state.start('end',Game.EndState);
   }

   //Set position
   	if (this.lander.x > 0 && this.lander.x < 112) {
   		position = 1; 
   	}
   	if (this.lander.x > 592 && this.lander.x < 688) {
   		position = 2;
   	}
   	if (this.lander.x > 1160) {
   		position = 3;
   	}


   //HUD
   if (notDead) {
	   dispSpeedX = Math.floor(this.lander.body.velocity.x);
	   dispSpeedY = Math.floor(this.lander.body.velocity.y);
	   this.gameoverTxt.setText("");
   } else {
   		landerDestroyed = true; 
		dispSpeedX = 0;
		dispSpeedY = 0;
		numberOfSubs = 0;
		this.gameoverTxt.setText("GAME OVER\nPRESS R TO RESTART\nPRESS S TO SEE STATS");
		if (this.input.keyboard.isDown(Phaser.Keyboard.R)) {
			restarting = true;
			startPosX = 60;
			startPosY = 0;
			game.state.start('game',Game.SurfaceState);
		}
		if (this.input.keyboard.isDown(Phaser.Keyboard.S)) {
			game.state.start('end',Game.EndState);
		}
		sndEngine.stop();
   }
   this.hudTxt.setText("HVEL: "+pad2(dispSpeedX)+"\nVVEL: "+pad2(dispSpeedY)+"\nAUVs: "+numberOfSubs+"\nDATA: "+data+"MB");
   /*
   if ((Math.abs(this.lander.body.velocity.x)) > 30 || (Math.abs(this.lander.body.velocity.y)) > 20) {
		this.hudTxt.tint = 0xff0000;
   } else {
	this.hudTxt.tint = 0xffffff;
   }	
   */

   //Debug Key
   if (this.input.keyboard.isDown(Phaser.Keyboard.Z)) {
   	console.log(data);
   		//this.drill();
   }

};

game.state.add('game',Game.SurfaceState);

function pad2(number) {
	var sign = '+';
	if (number >= 0) {
		sign = '+';
	} else {
		sign = '-';
	}
	if (Math.abs(number) < 10 && (Math.abs(number) < 100)) {
	  return sign+'00' + Math.abs(number).toString();
	} 
	if ((Math.abs(number) < 100) && (Math.abs(number) >= 10)) {
	  return sign+'0' + Math.abs(number).toString(); 
	}
	if (Math.abs(number) >= 100) {
		return sign+Math.abs(number).toString();
	}
}