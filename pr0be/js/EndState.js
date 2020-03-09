Game.EndState = function(game) {
	this.endtitleTxt = null;
	this.endinfoTxt = null;
};

Game.EndState.prototype = {
	create: function() {
		var lostAUVs = 3 - numberOfSubs;

		var probeRes = "";
		var lifeRes; 

		if (landerDestroyed) {
			probeRes = "* YOU LOST THE LANDER\n";
		} else {
			probeRes = "* YOU RETURNED THE LANDER\n";
		}

		if (discoveredLife) {
			lifeRes = "\n* YOU DISCOVERED LIFE";
		} else {
			lifeRes = "\n* YOU DID NOT DISCOVER LIFE";
		}

		this.endtitleTxt = this.add.bitmapText(200, 200, 'appleII', 'MISSION RESULT' );
        this.endtitleTxt.align = 'center';

        this.endinfoTxt = this.add.bitmapText(200, 300, 'appleII',probeRes+'* YOU GATHERED '+data+'MB OF DATA\n* YOU LOST ' + lostAUVs + ' AUVs' + lifeRes + '\n\n\n\nCLICK TO RESTART',16 );
        this.endinfoTxt.align = 'left';
        this.input.onDown.add(this.onDown, this);
        sndEngine.stop();
	},
	onDown: function() {
		restarting = true; 
		game.state.start('game',Game.SurfaceState);
	}
};

game.state.add('end',Game.EndState);
