var notDead = true; 
var sub; 
var goingLeft,goingRight;
var touchingSquids = false; 

var subMap;
var subLayer;
var subEmitter; 

var scanner; 
var squidDir = -1;

Game.SubState = function(game) {
	this.hudTxt = null;
	this.gameoverTxt = null;
};

Game.SubState.prototype.preload = function() {
	//Background
	this.game.load.image('bg2', 'assets/bg2.png');
	this.game.load.image('haze','assets/haze.png');

	//Maps
	this.game.load.tilemap('level1', 'assets/maps/level1.json',null,Phaser.Tilemap.TILED_JSON);
	this.game.load.tilemap('level2', 'assets/maps/level2.json',null,Phaser.Tilemap.TILED_JSON);
	this.game.load.tilemap('level3', 'assets/maps/level3.json',null,Phaser.Tilemap.TILED_JSON);


	//Sprites
	this.game.load.spritesheet('sub','assets/sub.png',18,5);
	this.game.load.spritesheet('subGibs','assets/subGibs.png',8,8);
	this.game.load.spritesheet('squid','assets/squid.png',40,24);
	this.game.load.image('plant', 'assets/plant.png');


	//Light things
	this.game.load.image('torch','assets/torch.png');
};

Game.SubState.prototype.create = function() {
	goingRight = true;
	goingLeft = false; 
	notDead = true; 
	background = game.add.tileSprite(0,0,2560,704,"bg2");

	//Map
	if (position == 1) 	subMap = game.add.tilemap('level1');
	if (position == 2) 	subMap = game.add.tilemap('level2');
	if (position == 3) 	subMap = game.add.tilemap('level3');
	subMap.addTilesetImage('Tile Layer 1','tiles');
	subMap.setCollision(1);
	subLayer = subMap.createLayer(0);
	subLayer.resizeWorld();
	subLayer.enableBody = true;

	//Sub
	sub = game.add.sprite(64,60,'sub');
	sub.anchor.set(0.5);
	game.physics.enable(sub);
	//sub.body.tilePadding.set(32,32);
	game.world.setBounds(0,0,2560,704);
	game.camera.follow(sub, Phaser.Camera.FOLLOW_LOCKON);

	//Sub gibs
	subEmitter = game.add.emitter(0,0,20);
	subEmitter.makeParticles('subGibs');
	subEmitter.gravity = 20; 

	if (subEmitter.countLiving <= 0) {
		subEmitter.stop();
	}

	//Controls
	cursors = game.input.keyboard.createCursorKeys();
	sndEngine.play();

	//NPCs 
	squids = game.add.group(); 
	squids.enableBody = true;
	subMap.createFromObjects('Object Layer 1',2,'squid',0,true,false,squids);
	squids.callAll('animations.add', 'animations', 'swim', [0, 1, 2], 10, true);
    squids.callAll('animations.play','animations','swim');

    plants = game.add.group();
    plants.enableBody = true; 
    subMap.createFromObjects('Object Layer 1',3,'plant',0,true,false,plants);

	//Lights
	this.lights = game.add.group();
	this.movingLight = new Torch(game,sub.x,sub.y,false);
	this.lights.add(this.movingLight);

	//Darkness
	foreground = game.add.tileSprite(0,0,2560,704,"haze");
	foreground.blendMode = Phaser.blendModes.DARKEN;
	foreground.alpha = 0.9;

	//Top lights
	this.movingLight2 = new Torch(game,sub.x,sub.y,false);
	this.lights.add(this.movingLight2);

	//HUD
	this.gameoverTxt = game.add.bitmapText(100,200,'appleII',"GAME OVER\nPRESS R TO RESTART");
	this.gameoverTxt.align = 'center';
	this.gameoverTxt.fixedToCamera = true;
	this.hudTxt = this.add.bitmapText(5,20, 'appleII', 'Data: ');
	this.hudTxt.align = 'left';
	this.hudTxt.fixedToCamera = true; 

	//Scanner
	scanner = game.add.sprite(sub.x+256,sub.y);
	scanner.anchor.set(0.5);
	game.physics.enable(scanner);
	scanner.scale.x = 256; 
};

var blowUpSub = function(x,y) {
    subEmitter.x = x;
    subEmitter.y = y;
    subEmitter.start(true,2000,null,10);
    sndExplosion.play();
    notDead = false; 
};

Game.SubState.prototype.removeThings = function() {
    blowUpSub(sub.x,sub.y);
    scanner.kill();
    sub.kill();
    numberOfSubs = numberOfSubs - 1;
};

Game.SubState.prototype.scanPlant = function() {
	data += 0.1;
	discoveredLife = true;
};

Game.SubState.prototype.scanSquid = function() {
	data += 0.1;
	discoveredLife = true; 
};

Game.SubState.prototype.turnAroundSquid = function() {
	squidDir = squidDir * -1;
};


Game.SubState.prototype.update = function() {
	//Collision
	game.physics.arcade.collide(sub,subLayer,this.removeThings);
	game.physics.arcade.collide(sub,squids,this.removeThings);
	game.physics.arcade.collide(squids,subLayer,this.turnAroundSquid);
	game.physics.arcade.collide(plants,subLayer);
	game.physics.arcade.collide(scanner,squids,this.scanSquid);
	//game.physics.arcade.collide(scanner,subLayer,this.scanIce);
	game.physics.arcade.collide(scanner,plants,this.scanPlant);


	//if sub isn't dead
	if (notDead) {
		data = Math.round(data*100)/100;
		this.hudTxt.setText("DEPTH: "+Math.floor(pad2(sub.y))+"\nDATA: "+data+"MB");
		this.gameoverTxt.text = "";
		sub.body.velocity.x = 0;
		sub.body.velocity.y = 0;
		sndEngine.pause();
		sub.frame = 0;
		if (goingRight) scanner.x = sub.x+128;
		if (goingLeft) scanner.x = sub.x-128;
		scanner.y = sub.y; 
		//this.movingLight.x = sub.x;
		//this.movingLight.y = sub.y; 
		//this.movingLight2.x = sub.x;
		//this.movingLight2.y = sub.y;
		//Sub Controls
		if (this.input.keyboard.isDown(Phaser.Keyboard.W)) {
			sub.body.velocity.y = -200;
			sndEngine.resume();
			sub.frame = 1;
		} else if (this.input.keyboard.isDown(Phaser.Keyboard.S)) {
			sub.body.velocity.y = 200; 
			sndEngine.resume();
			sub.frame = 1;
		}
		if (this.input.keyboard.isDown(Phaser.Keyboard.A)) {
			sub.body.velocity.x =  -200;
			sub.scale.x = -1;
			sndEngine.resume();
			sub.frame = 1;
			goingLeft = true;
			goingRight = false; 
		} else if (this.input.keyboard.isDown(Phaser.Keyboard.D)) {
			sub.body.velocity.x = 200;
			sub.scale.x = 1;
			sndEngine.resume();
			sub.frame = 1;
			goingLeft = false;
			goingRight = true;
		}
	} else {
		//if dead
		sndEngine.stop();
		this.gameoverTxt.align = 'left';
		this.gameoverTxt.text = "AUV LOST\nPRESS R TO \nRETURN TO PROBE";
		if (this.input.keyboard.isDown(Phaser.Keyboard.R)) {
			data = data;
			game.state.start('game',Game.SurfaceState);
		}	
	}

	//Don't let leave screen & return to surface if above the screen 
    if (sub.x < 0) {
        sub.x = 2560;
    }
    if (sub.x > 2560) {
        sub.x = 0;
    }
    if (sub.y > 700) {
        sub.y = 700;
    }
    if (sub.y < 0) {
    	sndEngine.stop();
        game.state.start('game',Game.GameState);
    }

	//Squids 
	squids.forEach(function(m) {
		if (squidDir == -1) m.body.velocity.x = -80; 
		if (squidDir == 1) m.body.velocity.x = 80;
        m.body.velocity.y = 0;
        m.scale.x = squidDir * -1; 

        if (m.x < 0) {
            m.x = 2560;
        }
        if (m.x > 2560) {
        	m.x = 0;
        }
    },game);

};

Game.SubState.prototype.render = function() {
	game.debug.geom(scanner);
};

var Torch = function(game,x,y,isBottom) {
    if (isBottom) {
        console.log("isBottom");
    } else {
        Phaser.Sprite.call(this, game, x, y, 'smoke');
    }

    this.glow = game.add.sprite(x, y, 'torch');
    this.glow.anchor.setTo(0, 0.51);

    this.glow.blendMode = Phaser.blendModes.ADD;

    this.glow.alpha = 0.9;
    //game.physics.enable(this.glow);
};

Torch.prototype = Object.create(Phaser.Sprite.prototype);
Torch.prototype.constructor = Torch;

Torch.prototype.update = function() {
    if (notDead) {
    	this.x = sub.x;
    	this.y = sub.y;
        this.glow.x = this.x;
        this.glow.y = this.y;

        //this.glow.angle = sub.body.angle;

        var size = game.rnd.realInRange(1.45, 1.5);

        if (goingLeft) {
            this.glow.scale.setTo(-size, size);
        }

        if (goingRight) {
            this.glow.scale.setTo(size, size);
        }
    } else {
        this.glow.alpha = 0;
        this.y = -400;
    }
};

game.state.add('sub',Game.SubState);