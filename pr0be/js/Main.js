//Global variables
var game = new Phaser.Game(800,600,Phaser.AUTO, 'PR0BE');

//Score 
var data = 0;
var tempData = 0;
var landerDestroyed = false; 
var numberOfSubs = 3; 
var photosTaken = 0;
var specimensTaken = 0;
var discoveredLife = false; 
var restarting = false; 

var position = 1;

var startPosX = 60;
var startPosY = 0;

Game = {};

Game.MainMenu = function(game) {
	this.titleTxt = null;
	this.infoTxt = null; 
};


Game.MainMenu.prototype = {
	preload: function() {
		this.load.bitmapFont('appleII', 'assets/apple2.png', 'assets/apple2.fnt');
	},
	create: function() {
		var x = this.game.width / 2
        , y = this.game.height / 2;


        this.titleTxt = this.add.bitmapText(x, y, 'appleII', 'PR0BE' );
        this.titleTxt.align = 'center';
        this.titleTxt.x = this.game.width / 2 - this.titleTxt.textWidth / 2;

        this.infoTxt = this.add.bitmapText(200, 550, 'appleII', 'MADE IN 72 HOURS FOR LD29\nCOPYRIGHT SOFTWAVE 2014',16 );
        this.infoTxt.align = 'center';
        this.input.onDown.add(this.onDown, this);

	},
	update: function() {

	},
	onDown: function() {
		game.state.start('game',Game.SurfaceState);
	}
};

game.state.add('MainMenu',Game.MainMenu);
game.state.start('MainMenu');