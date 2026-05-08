import Phaser from "phaser";

import { io } from "socket.io-client";

const socket = io("https://star-s58j.onrender.com");

socket.on("connect", () => {
  socket.emit("test", "hello from client");
});

let gameState = [];

socket.on("state", (state) => {
  gameState = state;
});
  
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

class client_manager {
    constructor() {
        this.x = 0;
        this.sprites = [];
        this.player;
        this.score = 0;
    }

    update() {
        for (let i = 0; i < this.sprites.length; i++ ){
            this.sprites[i].update();
        }
    }


}

class sprite_group {
    constructor() {
        this.sprites = []
    }

    update() {
        for (let i = 0; i < this.sprites.length; i++ ){
            this.sprites[i].update();
        }
    }

    delete() {
        return undefined;

    }



}

let game_m = new client_manager();

function preload() {
    this.load.image('logo', 'https://labs.phaser.io/assets/sprites/phaser3-logo.png');
    this.load.image('Play_im', '/assets/star.png');
    this.load.image('bullet_im', '/assets/bomb.png');
    this.allsp = [];
}

function create() {
    console.log();
    this.add.image(400, 300, 'logo');
    this.game_m = game_m;
    //this.allsp = this.add.group();
    
    //this.score = 0;
    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#ffffff' });

    //player = this.add.sprite(300,300,"Play_im")
    //let player = new Player(200,100); instance(this,player);
    //let ball = new Bullet(10,10,100,100); instance(this,ball);
    //this.game_m.player = player;
    //this.game_m.ball = ball;


    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    this.input.on('pointerdown',click,this);
}

function click(pointer) {
    //console.log(game_m.player.x);
    if (pointer.leftButtonDown()) {
        socket.emit("click",[pointer.x,pointer.y]);
    }
    //let b = new Bullet(game_m.player.x,game_m.player.y,pointer.x,pointer.y); instance(this,b);

}

function instance(gam,clas) {
    clas.sprite = gam.add.sprite(clas.x,clas.y,clas.image)
    clas.sprite.setScale(2);
    //gam.game_m.sprites.push(clas);
    gam.game_m.sprites[gam.game_m.sprites.length] = clas;

}

function update() {

    if (gameState.length < this.allsp.length) {
        while (gameState.length < this.allsp.length) {
            let s = this.allsp.pop();
            s.destroy();
            s = null;

        }
    }

    if (gameState.length > this.allsp.length) { 
        for (let n = this.allsp.length; n < gameState.length; n++) {
            let i = this.add.sprite(gameState[n].x,gameState[n].y,gameState[n].image);
            //console.log(i);
            this.allsp.push(i);
        }
    }
    //console.log(gameState[0].y);
    //console.log(this.allsp[0].x);
    for (let n = 0; n < gameState.length; n++) {
       this.allsp[n].x = gameState[n].x;
       this.allsp[n].y = gameState[n].y;
       this.allsp[n].image = gameState[n].image;
    }
    //if (gameState) {
        //this.game_m.player.y = gameState.paddles.p1.y;
        //this.game_m.player.x = gameState.paddles.p2.x;


        //this.game_m.ball.x = gameState.ball.x;
       // this.game_m.ball.y = gameState.ball.y;
   // }
//player.sprite.rotation += 1;
    this.scoreText.setText('Score: ' + this.game_m.score);
//let x = 0;
    if (this.keyW.isDown) {
        // Handle space bar
        socket.emit("w",1);
        //this.game_m.player.y -= 1;
    }
    if (this.keyA.isDown) {
        // Handle space bar
        socket.emit("a",1);
    }
    if (this.keyD.isDown) {
        // Handle space bar
        socket.emit("d",1);
    }
    if (this.keyS.isDown) {
        // Handle space bar
        socket.emit("s",1);
    }

}

socket.on("score_inc", () => {
  game_m.score += 10;
  console.log(game.score);
});
