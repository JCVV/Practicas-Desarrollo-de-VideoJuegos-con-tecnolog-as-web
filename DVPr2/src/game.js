var sprites = {
  frog: { sx: 0, sy: 0, w: 48, h: 48, frames: 1 },
  bg: { sx: 433, sy: 0, w: 320, h: 480, frames: 1 },
  car1: { sx: 143, sy: 0, w: 48, h: 48, frames: 1 },
  car2: { sx: 191, sy: 0, w: 48, h: 48, frames: 1 },  
  car3: { sx: 239, sy: 0, w: 96, h: 48, frames: 1 },
  car4: { sx: 335, sy: 0, w: 48, h: 48, frames: 1 },
  car5: { sx: 383, sy: 0, w: 48, h: 48, frames: 1 },
  trunk: { sx: 288, sy: 383, w: 134, h: 48, frames: 1 },
  death: { sx: 0, sy: 143, w: 48, h: 48, frames: 4 },
  water: { sx: 0, sy: 0, w: 320, h: 144, frames: 1},
  home: { sx: 0, sy: 0, w: 320, h: 48, frames: 1}
};


var OBJECT_PLAYER = 1,
    OBJECT_WATER = 2,
    OBJECT_ENEMY = 4,
    OBJECT_HOME = 8,
    OBJECT_TRUNK = 16,
    OBJECT_PLAYER_PROJECTILE = 32,
    OBJECT_ENEMY_PROJECTILE = 64;

var BackGround = function() { 
  this.setup("bg", { });
  this.x = 0;
  this.y = 0;
  this.step = function(){}
}

BackGround.prototype = new Sprite();



var Frog = function(){
  this.setup("frog", { });
  this.x = 48*3;
  this.y = 432;
  this.water = false;
  this.home = false;
  this.sem = true;//Semaforo para controlar los movimientos de la rana. (Un salto por cada pulsación de tecla)
  var lastKey;//Ultima dirección de salto realizada, para permitir movimientos diagonales rápidos.
  this.vx = 0;
  this.onHome = function(){
  	this.home = true;
  }
  this.onTrunk = function(vTrunk){
    this.vx = vTrunk;
    this.water = true;
  }
  this.noTrunk = function(){
  	this.water = false;
  }

  this.isOnTrunk = function(){
  	 var collisionTrunk = this.board.collide(this, OBJECT_TRUNK);
    if(collisionTrunk){
        this.onTrunk(collisionTrunk.vx);
        //console.log("jajajaj");
        return true;
	}else{
		this.noTrunk();
		//console.log("notr");
		return false;
	}
  }
  this.step = function(dt){
  	
    if(this.x >= 0 && this.x <= 278)
      this.x += this.vx * dt;
    this.vx = 0;

    if(this.sem==false && !Game.keys[lastKey])
      this.sem=true;
    
    if(this.sem==true && !this.home){ // this.y!=0 -> no está en la franja de home.
      if(Game.keys['left']){
        lastKey='left';
        this.sem=false;
        if(this.x > 0){
          this.x -= 48;
          if(this.x < 0)
            this.x = 0;
        }
      }
      else if(Game.keys['right']){
        lastKey='right';
        this.sem=false;
        if(this.x < 248){
          this.x += 48;
          if(this.x > 248)
            this.x = 278;
        }

      }
      else if(Game.keys['up']){
        lastKey='up';
        this.sem=false;
        if(this.y > 0)
          this.y -= 48;
      }
      else if(Game.keys['down']){
        lastKey='down';
        this.sem=false;
        if(this.y < 432)
          this.y += 48;
      }else{
        this.sem = true;
      }
    }
  }
}

Frog.prototype = new Sprite();
Frog.prototype.type = OBJECT_PLAYER;

var Car = function(num){
  var fila;
  
  switch(num){
    case 1:this.setup("car1", {vx : 80 });
      fila = 1;
      this.x = 0-48;
      break;
    case 2:this.setup("car2", {vx : -100 });
      fila = 2;
      this.x = 320;
      break;
    case 3:this.setup("car3", {vx : 100 });
      fila = 3;
      this.x = 0-96;
      break;
    case 4:this.setup("car4", {vx : -90 });
      fila = 4;
      this.x = 320;
      break;
    case 5:this.setup("car5", {vx : 100 });
      fila = 1;
      this.x = 0-48;
      break;
  }
  this.y = 48 * fila + 192;

  this.step = function(dt){
    this.x += this.vx * dt;

    var collide = this.board.collide(this, OBJECT_PLAYER);
   	if(collide){
      collide.hit();
      loseGame();
      this.board.add(new Death(collide.x, collide.y));
   	}

    if(this.x == 320 || this.x === -96)
      this.board.remove(this);
    

  }


}
Car.prototype = new Sprite();
Car.prototype.type = OBJECT_ENEMY;

var Trunk = function(position){
  switch(position){
    case 1:
      this.x = 320;
      this.setup("trunk", { vx: -85, pos: position});
      break;
    case 2:
      this.x = 0 - 142;
      this.setup("trunk", { vx: 60, pos: position});
      break;
    case 3:
      this.x = 0 - 142;
      this.setup("trunk", { vx: 50, pos: position});
  }
  this.y = 48 * position;
  this.step = function(dt){
    this.x += this.vx * dt;
    if(this.x == 320)
      this.board.remove(this);
  }
}


Trunk.prototype = new Sprite();
Trunk.prototype.type = OBJECT_TRUNK;

var Water = function(){
  this.setup("water", { });
  this.x = 0;
  this.y = 48;
  this.draw = function(ctx){
    //Vacio
  }
  this.step = function(dt){

    var collide = this.board.collide(this, OBJECT_PLAYER);
   	if(collide && !collide.isOnTrunk()){
      collide.hit();
      loseGame();
      this.board.add(new Death(collide.x, collide.y));
   	}
  }

}
Water.prototype = new Sprite();
Water.prototype.type = OBJECT_WATER;

var Home = function(){
  this.setup("home", { });
  this.x = 0;
  this.y = 0;
  this.fin = false;
  this.draw = function(ctx){}
  this.step = function(dt){
  	var collide = this.board.collide(this, OBJECT_PLAYER)
  	if(collide && !this.fin){
  		this.fin = true;
  		collide.onHome();
  		winGame();

   	}
  }

}

Home.prototype = new Sprite();
Home.prototype.type = OBJECT_HOME;

var Death = function(X, Y){
  this.setup('death', { frame: 0 });
  this.x = X;
  this.y = Y;
  this.tim = 0;
}

Death.prototype = new Sprite();
Death.prototype.step = function(){
    if((this.tim += 1) == 15){
    	this.frame++;
    if(this.frame >= 4) {
      	this.board.remove(this);
    }
    this.tim = 0;
  }
}

var Spawner = function(protot, frequency){
	this.timer = -1;
	this.prot = protot;
	this.freq = frequency;
}

Spawner.prototype.step = function(dt){
	if(this.timer++ % this.freq === 0){
		this.timer = 1;
		this.board.add(Object.create(this.prot));
	}

}

Spawner.prototype.draw = function(ctx){}

var startGame = function() {
  var ua = navigator.userAgent.toLowerCase();
  Game.setBoard(0,new TitleScreen("Frogger", 
                                  "Press the SpaceBar to start",
                                  playGame));
};
  


var playGame = function(){
  
  //winGame();
  Game.disableNBoard(2);

  var board = new GameBoard();
  board.add(new BackGround());
  Game.setBoard(0, board);
  var board1 = new GameBoard();

  board1.add(new Frog());	
  board1.add(new Water());
  board1.add(new Home());
  board1.add(new Spawner(new Car(1), 200));
  board1.add(new Spawner(new Car(2), 150));
  board1.add(new Spawner(new Car(3), 170));
  board1.add(new Spawner(new Car(4), 120));

  board1.add(new Spawner(new Trunk(1), 200));
  board1.add(new Spawner(new Trunk(2), 340));
  board1.add(new Spawner(new Trunk(3), 275));

  Game.setBoard(1, board1);
};

var winGame = function() {
  Game.setBoard(2,new TitleScreen("You win!", 
                                  "Press SpaceBar to play again",
                                  playGame));
};

var loseGame = function() {
  Game.setBoard(2,new TitleScreen("You lose!", 
                                  "Press SpaceBar to play again",
                                  playGame));
};

window.addEventListener("load", function() {
  Game.initialize("game",sprites,startGame);
});


