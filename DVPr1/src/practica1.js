function shuffle(o){//Función para mezclar un array. Sacada de internet.
	for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
		return o;
};

var MemoryGame = function(gs){//this dentro de una clase en la que se hace new se vincula al objeto creado.
								//si no se vincula al canvas/ventana/o lo que sea
	var volteadas = 0;
	var parejas = 0;
	var volteada;
	var graphicServer = gs;
	var cardsArray = [];
	var face = //Enumerado para el estado de las cartas.
	{"DOWN":0, 
	"UP":1,
	"FOUND":2};
	this.initGame = function(){
		volteadas = 0;
		parejas = 0;
		volteada = null;
		var i = 0;
		cardsArray.length = 0;
		//Creamos todas las cartas. se almacenan en cardsArray.
		for(var card in graphicServer.maps){
			if(card!="back"){
				var c = new this.Card(card);
				cardsArray.push(c);
				var c = new this.Card(card);
				cardsArray.push(c);
			}
		}
		//Mezclamos el array de cartas.
		shuffle(cardsArray);
		graphicServer.drawMessage("Memory Game");
		this.loop();
	}

	this.loop = function(){
		var bucle = setInterval(this.draw, 60);
	}

	this.resolv = function(){
		var rand = Math.floor(Math.random() * (15-0+1));
		console.log(rand);
		this.onClick(rand);
	}
	
	this.draw = function(){
		for(i = 0; i < cardsArray.length; i++)
			cardsArray[i].draw(gs, i);
	}

	//Cada vez que se pincha en una carta se voltea.
	this.onClick = function(cardId){
		if(parejas==8){//Vuelta a empezar el juego;
			this.initGame();
			return;
		}

		if(volteadas == 0){
			volteada = cardsArray[cardId];
			if(volteada.estado == face.DOWN){
				volteada.flip();
				volteadas++;
			}
		}else if(volteadas == 1){
			var volteada2 = cardsArray[cardId]; 
			if(volteada == volteada2 || volteada2.estado != face.DOWN)
				return;
			volteada2.flip();
			volteadas++;
			if(volteada.compareTo(volteada2)){		
				volteada.found();
				volteada2.found();
				volteadas = 0;
				parejas++;
				if(parejas < 8)
					graphicServer.drawMessage("Match found!");
				else
					graphicServer.drawMessage("You Win!");
			}
			else{
				graphicServer.drawMessage("Try again!");
				setTimeout(function(){
					volteada.flip();
					volteada2.flip();
					volteadas = 0;
				}, 1000);

			}
		}
	}

	this.Card = function(sprite){
		this.name = sprite;
		this.estado = face.DOWN;//"boca arriba"/"encontrada"
		this.flip = function(){
			if(this.estado == face.DOWN)
				this.estado = face.UP;
			else if(this.estado == face.UP)
				this.estado = face.DOWN;
		}
		this.found = function(){
			this.estado = face.FOUND;
		}
		this.compareTo = function(anotherCard){
			if(this.name == anotherCard.name)
				return true;
			else
				return false;
		}
		/*
		Recibe como parámetros el servidor gráfico y la posición en la que se
		encuentra en el array de cartas del juego (necesario para dibujar una
		carta).
		*/
		this.draw = function(gs, pos){
		if(this.estado==face.DOWN)
			gs.draw("back", pos);
		else
			gs.draw(this.name, pos); 
		}
	}
}