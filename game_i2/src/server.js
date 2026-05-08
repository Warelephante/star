import express from "express";
import http from "http";
import { Server } from "socket.io";
import Player from './player.js';
import Bullet from './bullet.js';


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

function randint(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class game_manager {
    constructor() {
        this.x = 0;
        this.sprites = new sprite_group();
        this.player_sprites = new sprite_group();
        this.bullets = new sprite_group();
        this.players = [];
        this.sprite_infos = [];
        //this.player;

        //let b = new Bullet(100,100,100,300);
        //this.add_to_sprites(b)
        //this.sprites.push(b);
    }

    get_player(id) {
      for (let i = 0; i < this.players.length; i++) {
        if (this.players[i].player_id == id) {
          return this.players[i];
        }
      }
      return undefined;
    }

    remove_player(id) {
      for (let i = 0; i < this.players.length; i++) {
        if (this.players[i].player_id == id) {
          this.players.splice(i,1);
        }
      }
      

    }

}

class sprite_group {
    constructor() {
        this.sprites = [];
        this.infos = [];
    }

    group_collide(group) {
      let collides = [];
      for (const s1 of this.sprites) {
        for (const s2 of group.sprites) {
          //if (randint(1,25) == 2){
           // console.log((s1.x+(s1.width/2) >= s2.x-(s2.width/2)));
           // console.log((s1.x-(s1.width/2) <= s2.x+(s2.width/2)));
           //console.log((s1.y+(s1.height/2) >= s2.y-(s2.height/2)));
           //console.log((s1.y-(s1.height/2) <= s2.y+(s2.height/2)));
          //}
          if ((s1.x+(s1.width/2) >= s2.x-(s2.width/2)) && (s1.x-(s1.width/2) <= s2.x+(s2.width/2))) {
            if ((s1.y+(s1.height/2) >= s2.y-(s2.height/2)) && (s1.y-(s1.height/2) <= s2.y+(s2.height/2))) {
              collides.push([s1,s2]);
              console.log("collide");

            }
          }
        }
      }
      return collides;
    }


    update(delta) {
        for (let i = 0; i < this.sprites.length; i++ ){
            this.sprites[i].update(delta);
            
        }

        this.infos = [];
        for (let i = 0; i < this.sprites.length; i++ ){
            this.update_object(i,this.sprites[i]);
            
        }
    }

    add(i) {
      this.sprites.push(i)
      let o = {x:i.x,y:i.y,image:i.image};
      this.infos.push(o);

    }

    remove(s) {
      for (let i = 0; i < this.sprites.length; i++) {
        if (this.sprites[i] === s) {
          this.sprites.splice(i,1);
          this.infos.splice(i,1);
          //this,sprit
          break;
        }
      }

    }
    update_object(n,i) {
      let o = {x:i.x,y:i.y,image:i.image};
      this.infos[n] = o;
    }

}

let game_m = new game_manager()


let gameState = {
  ball: { x: 400, y: 300, vx: 3, vy: 3 },
  paddles: {
    p1: { y: 250 },
    p2: { y: 250 }
  }
};

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);
  let p = new Player(100,100,socket.id,game_m);
  //game_m.sprites.add(p);
  game_m.players.push(p);

  socket.on("w", (data) => {
    let p = game_m.get_player(socket.id);
    p.dy = -80;
  });

  socket.on("d", (data) => {
    let p = game_m.get_player(socket.id);
    p.dx = 80;
  });

  socket.on("s", (data) => {
    let p = game_m.get_player(socket.id);
    p.dy = 80;
  });

  socket.on("a", (data) => {
    let p = game_m.get_player(socket.id);
    p.dx = -80;
  });

  socket.on("click", (data) => {
    let p = game_m.get_player(socket.id);

    let b = new Bullet(p.x,p.y,data[0],data[1],socket.id,game_m);
    //game_m.sprites.add(b);
    setTimeout(() => {  
        b.kill();
        b = undefined;
    }, 3000); 
  });

  socket.on("test", (msg) => {
    console.log("Got message:", msg);
  });

  
  socket.on('disconnect', () => {
      console.log('Player disconnected:', socket.id);
      game_m.get_player(socket.id).kill()
      game_m.remove_player(socket.id)
      
      // 1. Remove player from server data structure
      //delete players[socket.id];
      
      // 2. Broadcast to all clients to remove this player
      io.emit('playerDisconnected', socket.id);
  }); 
});

let lastTime = Date.now();

setInterval(() => {
  //gameState.ball.x += gameState.ball.vx;
  //gameState.ball.y += gameState.ball.vy;
  const now = Date.now();
  const delta = (now - lastTime) / 1000;
  lastTime = now;

  game_m.sprites.update(delta);

  let c = game_m.player_sprites.group_collide(game_m.bullets);
  
  for (const col of c) {
    if (col[0].player_id != col[1].sender) {
      io.to(col[1].sender).emit('score_inc');
      col[1].kill()
      //console.log(c);
    }
  }

  if (gameState.ball.y <= 0 || gameState.ball.y >= 600) {
    gameState.ball.vy *= -1;
  }

  io.emit("state", game_m.sprites.infos);
}, 1000 / 60);

//server.listen(3000, () => {
  //console.log("Server running on port 3000");
//});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


//const port = process.env.PORT || 10000;
//server.listen(port, '0.0.0.0', () => {
  //console.log(`Server running oon port ${port}`);
//});

