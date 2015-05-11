/*
José Carlos Valera Villalba.
*/

var game = function(){

////////////////////////////////////INIT/////////////////////////////////////////////////////
	var Q = window.Q = Quintus()
			.include("Sprites, Scenes, TMX, Input, 2D, Anim, Touch, UI, Audio")
			.setup({ 
				width:320,
			 	height:480,
				audioSupported: [ 'ogg','mp3' ]
			 })
			.controls().touch();

	Q.audio.enableHTML5Sound();

	Q.load(["coin.mp3", 
		"coin.ogg", 
		"music_level_complete.mp3", 
		"music_level_complete.ogg", 
		"music_die.mp3", 
		"music_die.ogg", 
		"music_main.mp3", 
		"music_main.ogg", 
		"coin.png", 
		"coin.json", 
		"mainTitle.png", 
		"mario_small.png", 
		"mario_small.json", 
		"goomba.png", 
		"goomba.json", 
		"bloopa.png", 
		"bloopa.json", 
		"princess.png"], function(){
		Q.compileSheets("mario_small.png", "mario_small.json");
		Q.compileSheets("goomba.png", "goomba.json");
		Q.compileSheets("bloopa.png", "bloopa.json");
		Q.compileSheets("coin.png", "coin.json");

		Q.loadTMX("level.tmx", function() {//Se hace aquí porque la carga de los recursos es asíncrona, y así nos aseguramos
											//que al cargar la escena todos los recursos estén ya listos.
		    Q.stageScene("mainTitle");
		});
	});

////////////////////////////////////INIT/////////////////////////////////////////////////////

////////////////////////////////////SCORE Y HUD/////////////////////////////////////////////////////
	Q.UI.Text.extend("Score",{
		init:function(p){
			this._super({label:"Score 0",x:250,y:0});
			Q.state.on("change.score",this,"score");
		},
		score: function(score){
			this.p.label="Score " + score;
		}
	});

	Q.scene("HUD",function(stage){
		var container = stage.insert(new Q.UI.Container({
			x:0,y:0
		}));
		var label= container.insert(new Q.Score());
		Q.state.set("score",0);
	})

////////////////////////////////////SCORE Y HUD/////////////////////////////////////////////////////


////////////////////////////////////ANIMATIONS/////////////////////////////////////////////////////

	Q.animations('mario', {
		standright: 	{ frames: [0] },
		runright:		{ frames: [1, 2, 3], rate: 1/9 },
		jumpright:		{ frames: [4] },
		driftright:		{ frames: [5] },

		standleft:	{ frames: [14] },
		runleft:		{ frames: [15, 16, 17], rate: 1/9 },
		jumpleft:		{ frames: [18] },
		driftleft:	{ frames: [19] },

		marioDie: 	{ frames: [12], rate: 1/2, loop: false, trigger: 'die' }
	})

	Q.animations('goomba', {
		live: 	{ frames: [0, 1], rate: 1/2},
		die: 	{ frames: [2], rate: 1/2, loop: false, trigger: 'die'}

	});

	Q.animations('bloopa', {

		live: 	{ frames: [0, 1], rate: 1/2 },
		die: 	{ frames: [2], rate: 1/2, loop: false, trigger: "die"}

	});

	Q.animations('coin', {

		coin: 	{ frames: [0, 1, 2], rate: 1/3 }

	});


////////////////////////////////////ANIMATIONS/////////////////////////////////////////////////////



////////////////////////////////////COINS/////////////////////////////////////////////////////
	Q.Sprite.extend("Coin", {
		init: function(p){
			this._super(p, { sprite: "coin", sheet: "coin", gravity: 0, sensor: true, picked: false});
			this.add("animation, tween");
			this.play("coin");
			this.on('hit', this, 'sensor');
		},
		sensor: function(collision){
			if(collision.obj.isA("Mario") && !this.p.picked){
				this.p.picked = true;

			Q.audio.play("coin.mp3");
				this.animate({y: this.p.y - 30}, 1/4, {callback: function(){this.destroy();}});
				Q.state.inc("score", 1);	
			}
		}
	});


////////////////////////////////////COINS/////////////////////////////////////////////////////


////////////////////////////////////MARIO/////////////////////////////////////////////////////
	Q.Sprite.extend("Mario", {
		init: function(p) {
      		this._super(p, { sprite: 'mario', sheet: "marioR", jumpSpeed: -400, speed: 300 });
      		this.add('2d, platformerControls, animation, tween');
      		this.play("runright");
      		this.onAir=false;
      		this.muerto = false;
      		this.on('die', this, 'dies');
    	},
    	step: function(p){
    		
    		console.log('x -> ' + this.p.x + ' y -> ' + this.p.y);
    		
    		if(this.muerto)
    			return;
    		if(this.p.vy==0){
    			this.onAir=false;
    			
    		}
    		if(this.p.y > 700)
    			this.beforeDies();
    		
    		if(this.onAir)
    			return;

    		if (this.p.vy != 0){//si está en el aire está saltando -> play(jump) así evitamos 
    			this.onAir = true;
				this.play("jump" + this.p.direction);
			}else if(Q.inputs['left']){
				this.play("run" + this.p.direction);
			}else if(Q.inputs['right']){
				this.play("run" + this.p.direction);
			}else {
				this.play("stand"+this.p.direction);
			}
   		},
    	dies: function(p){
    		console.log("dieFinal");

    		Q.stageScene("endGame",1, { label: "You Die!" });
    		this.destroy();
    	},
    	wins: function(p){
    		Q.stageScene("endGame", 1, { label: "You Win!" });
    	},
    	beforeDies: function(p){
    		Q.audio.stop();

			Q.audio.play("music_die.mp3");
    		this.animate({y: this.p.y - 30}, 1/4);
    		this.muerto = true;
				
    		this.play("marioDie");

    	}

	});


////////////////////////////////////MARIO/////////////////////////////////////////////////////


////////////////////////////////////ENEMIGOS/////////////////////////////////////////////////////

	Q.component("defaultEnemy", {
		added: function(){
			var entity = this.entity;
			entity.add("2d, aiBounce, animation");
			entity.play("live");

			entity.on("bump.left, bump.right, bump.bottom", this, function(collision){
				if(collision.obj.isA("Mario")){
					collision.obj.beforeDies();
			}
			});			
			entity.on("bump.bottom", this, function(collision){
				if(collision.obj.isA("Mario")){{
					entity.p.vy = -300;
					collision.obj.beforeDies();
				}
			}
			});

			entity.on("bump.top", this, function(collision){
				if(collision.obj.isA("Mario")){
					entity.p.vx = 0;
					collision.obj.p.vy = -200;
					entity.play("die");
				}
			});
			entity.on("die", this, function(){entity.destroy();});
		}
	});

	Q.Sprite.extend("Goomba", {
		init: function(p){
			this._super(p, {sprite: "goomba", sheet: "goomba", vx: 100});
			this.add("defaultEnemy");
		}
	});

	Q.Sprite.extend("Bloopa", {
		init: function(p){
			this._super(p, {sprite: "bloopa", sheet: "bloopa", vy: -400, vx: 50});
			this.add("defaultEnemy");
			this.p.initY = this.p.y;
			this.p.lastY = this.p.y;
		},
		step: function(dt){
			if(this.p.y == this.p.lastY){
				this.p.vy = -400;
				this.p.vx*=-1;
			}
			this.p.lastY = this.p.y;
		}
	});


////////////////////////////////////ENEMIGOS/////////////////////////////////////////////////////



////////////////////////////////////PRINCESA/////////////////////////////////////////////////////

	Q.Sprite.extend("Princess", {//Quintus_2d.js sensor en el collide comprueba contra qué colisiona.
								//Si el objeto tiene la propiedad sensor -> se emite evento de que ha chocado contar un sensor
								//Sensor es más útil, hay colisión pero se pueden atravesar. Se llaman triggers (disparadores)
		init: function(p){
			this._super(p, {asset: "princess.png", x: 2000, y: 24*19, vy: 0, sensor: true, touched: false});
			this.on("hit", this, "sensor");
		},

		sensor: function(collision){
			if(collision.obj.isA("Mario") && !this.p.touched){
				collision.obj.del("platformerControls");
				collision.obj.p.vx = 0;
				this.p.touched=true;
				Q.audio.stop();
				Q.audio.play("music_level_complete.mp3");
				Q.stageScene("endGame", 1, { label: "You Win!" });
			}
		}
	});

////////////////////////////////////PRINCESA/////////////////////////////////////////////////////

////////////////////////////////////ESCENAS/////////////////////////////////////////////////////

	Q.scene('endGame',function(stage) {
	  var box = stage.insert(new Q.UI.Container({
	    x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
	  }));
	  
	  var button = box.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
	                                           label: "Play Again" }))         
	  var label = box.insert(new Q.UI.Text({x:10, y: -10 - button.p.h, 
	                                        label: stage.options.label }));
	  button.on("click",function() {
	  	Q.audio.stop();
	    Q.clearStages();
	    Q.stageScene('mainTitle');
	  });
	  box.fit(20);
	});

	
	Q.scene('mainTitle', function(stage){
	    Q.audio.play("music_main.mp3", { loop: true });
		stage.insert(
			new Q.Repeater({
				asset: "mainTitle.png"}));
		var container = stage.insert(new Q.UI.Container({
			x: Q.width/2, 
			y: Q.height/2 + Q.height/4
		}));
		var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
														label: "Play" }));
		button.on("click", function() {
			Q.clearStages();
			Q.stageScene('level1');
			Q.stageScene("HUD",1);
			});
	});
	
	Q.scene("level1", function(stage) {
	    Q.stageTMX("level.tmx", stage);
	    var player = stage.insert(new Q.Mario({ x: 13*7 + 8, y: 24*22 + 8}));
	    stage.insert(new Q.Goomba({ x: 13*18 + 8, y: 24*16 + 8}));
	    stage.insert(new Q.Goomba({ x: 13*30 + 8, y: 24*14 + 8}));
	    stage.insert(new Q.Goomba({ x: 13*50 + 8, y: 24*13 + 8}));
	    stage.insert(new Q.Bloopa({ x: 13*16 + 5, y: 24*22 }));
	    stage.insert(new Q.Bloopa({ x: 13*34 + 5, y: 24*10 }));
	    stage.insert(new Q.Bloopa({ x: 13*60 + 5, y: 24*10 }));
	    stage.insert(new Q.Coin({ x: 13*10, y: 24*18 }));
	    stage.insert(new Q.Coin({ x: 13*12, y: 24*18 }));
	    stage.insert(new Q.Coin({ x: 13*14, y: 24*18 }));
	    stage.insert(new Q.Coin({ x: 520, y: 460 }));
	    stage.insert(new Q.Coin({ x: 550, y: 455 }));
	    stage.insert(new Q.Coin({ x: 580, y: 450 }));
	    stage.insert(new Q.Coin({ x: 610, y: 445 }));
	    stage.insert(new Q.Coin({ x: 640, y: 450 }));
	    stage.insert(new Q.Coin({ x: 670, y: 455 }));
	    stage.insert(new Q.Coin({ x: 700, y: 460 }));
	    stage.insert(new Q.Coin({ x: 1478, y: 494 }));
	    stage.insert(new Q.Coin({ x: 1480, y: 494 }));
	    stage.insert(new Q.Coin({ x: 1510, y: 494 }));
	    stage.insert(new Q.Coin({ x: 1540, y: 494 }));
	    stage.insert(new Q.Coin({ x: 1570, y: 494 }));
	    stage.insert(new Q.Coin({ x: 1600, y: 494 }));
	    stage.insert(new Q.Coin({ x: 1630, y: 494 }));
	    stage.insert(new Q.Coin({ x: 1660, y: 494 }));
	    stage.insert(new Q.Coin({ x: 1690, y: 494 }));
	    stage.insert(new Q.Coin({ x: 1720, y: 494 }));
	    stage.insert(new Q.Coin({ x: 1750, y: 494 }));
	    stage.insert(new Q.Coin({ x: 1780, y: 494 }));
	    stage.insert(new Q.Bloopa({ x: 1690, y: 494 }));
	    stage.insert(new Q.Goomba({ x: 1500, y: 494 }));
	    //console.log(coin);
	    var princess = stage.insert(new Q.Princess());
	    stage.add("viewport").follow(player);
	    stage.viewport.offsetY = 160;
	    stage.viewport.offsetX = -30;
	});

////////////////////////////////////ESCENAS/////////////////////////////////////////////////////

}