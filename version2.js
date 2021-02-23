const scale = 20;
let simplePlan = `
#---------#
#+++++++++#
#.+++++++.#
#.........#
#.........#
#...o.....#
#...p.....#
#=========#`;

class Level {
  constructor(plan) {
    this.rows = plan.trim().split('\n').map(l => [...l]);
    this.height = this.rows.length;
    this.width = this.rows[0].length;
    this.actors = [];
    this.bricks = [];
    this.rows = this.rows.map((row, y) => row.map((ch, x) => {
      let type = levelChars[ch];
      if (typeof type == "string")
        return type;
      if (type == Ball) {
        //console.log("creating ball")
        this.actors.push(new type(new Vec(x, y), new Vec(-3, -3)));
      }
      if (type == Platform) {
        // console.log("creating platform")
        this.actors.push(new type(new Vec(x, y)));
      }
      if (type == Brick) {
        this.bricks.push(new type(new Vec(x, y)));
      }
      return "empty";
    }));
    //console.log("out of level")
    for (let i = 0; i < 3; i++) {
      this.addPowerUps();
    }
  }
  getBall() {
    //console.log("filtering for ball")
    return this.actors.filter(a => a.type == 'ball');
  }
  touches(pos, size, type) {
    //console.log(pos)
    //console.log("in level touches")
    let xStart = Math.floor(pos.x);
    let xEnd = Math.ceil(pos.x + size.x);
    let yStart = Math.floor(pos.y);
    let yEnd = Math.ceil(pos.y + size.y);
    for (let y = yStart; y < yEnd; y++) {
      for (let x = xStart; x < xEnd; x++) {
        let isOutside = x < 0 || x >= this.width ||
          y < 0 || y >= this.height;
        let tile = isOutside ? "wall" : this.rows[y][x];
        if (tile == type)
          return true;
      }
    }
    return false;
  }
  addPowerUps() {
    let bnum = Math.floor(Math.random() * this.bricks.length);
    this.bricks[bnum].powerup = true;
  }
}

function Vec(x, y) {
  this.x = x;
  this.y = y;
}

Vec.prototype.times = function(vec) {
  return new Vec(this.x * vec.x, this.y * vec.y);
}

Vec.prototype.plus = function(vec) {
  return new Vec(this.x + vec.x, this.y + vec.y);
}

class Brick {
  constructor(pos) {
    this.create(pos);
  }
  create(pos, powerup = null) {
    this.pos = pos;
    this.powerup = powerup;
  }
}


Brick.prototype.size = new Vec(0.5, 0.5);

const platformSpeed = 7;

class Platform {
  constructor(pos, ammo) {
    this.create(pos, ammo);

  }
  update(time, state, keys) {
    let pos = this.pos;
    let xSpeed = 0;

    if (keys.ArrowLeft) {
      xSpeed -= platformSpeed;
    }
    if (keys.ArrowRight) {
      xSpeed += platformSpeed;
    }
    let newPos = pos.plus(new Vec(xSpeed * time, 0));
    if (!state.level.touches(newPos, this.size, "wall")) {
      pos = newPos;
    }
    return new Platform(pos, this.ammo);
  }
  create(pos, ammo = 0) {
    this.pos = pos;
    this.ammo = ammo;
  }
  double() {
    console.log("increasing size of platform to twice og size")
    this.size.x *= 2;
    setTimeout(plat => plat.size.x /= 2, 5000, this);
  }
}

Platform.prototype.size = new Vec(0.8, 0.2);
Platform.prototype.type = "platform";


class Ball {
  constructor(pos, speed) {
    this.create(pos, speed);
  }
  update(time, state, keys) {
    let xSpeed = this.speed.x;
    let ySpeed = this.speed.y;
    let xDist = xSpeed * time;
    let yDist = ySpeed * time;

    let newPos = this.pos.plus(new Vec(xDist, yDist));
    if (state.level.touches(newPos, this.size, "roof")) {
      this.speed.y = -this.speed.y;
    } else if (state.level.touches(newPos, this.size, "wall")) {
      this.speed.x = -this.speed.x;
    } else if (state.level.touches(newPos, this.size, "floor")) {
      this.speed = new Vec(this.speed.x, -this.speed.y);
    }
    // console.log("returning new ball")
    return new Ball(newPos, this.speed);
  }
  create(pos, speed) {
    //console.log("creating the ball");
    this.pos = pos;
    this.speed = speed;
  }
}


Ball.prototype.size = new Vec(0.2, 0.2);

Ball.prototype.type = "ball";

class PowerUp {
  constructor(pos) {
    this.create(pos);
  }
  update(time, state, keys) {
    //console.log("updating powerup position");
    let yDist = this.speed.y * time;
    this.pos = this.pos.plus(new Vec(0, yDist));
    return this;
  }
  create(pos) {
    this.pos = pos;
    this.speed = new Vec(0, 5);
    this.powername = this.createPower();
  }
  createPower() {
    return (++powers[0] % powers.length) ? powers[powers[0]] : (powers[0] = 0, powers[++powers[0]]);
  }
}
PowerUp.prototype.size = new Vec(0.4, 0.4);
PowerUp.prototype.type = 'powerup';

class Rocket {
  constructor(pos, speed) {
    this.create(pos);
  }
  create(pos) {
    this.pos = pos;
    this.speed = new Vec(0, -5);
  }
  update(time, state, keys) {
    let ySpeed = this.speed.y;
    let yDist = ySpeed * time;
    let newPos = this.pos.plus(new Vec(0, yDist));
    return new Rocket(newPos);
  }
}
Rocket.prototype.size = new Vec(0.2, 0.2);
Rocket.prototype.type = 'rocket';
const powers = [0, "rockets", "multi-ball", "bigplat"];


class State {
  constructor(level, bricks, actors, status, rockets, powerups = null) {
    this.level = level;
    this.bricks = bricks;
    this.actors = actors;
    this.status = status;
    this.rockets = rockets || 0;
    this.powerups = powerups || [];
  }
  update(time, keys) {
    this.actors = this.actors.map(a => a.update(time, this, keys));
    let platform = this.getPlatform();
    let ball = this.actors.find(a => a.type == 'ball');
    let bricks = this.bricks;
    let powerups = this.actors.filter(a => a.type == 'powerup');
    let rockets = this.actors.filter(a => a.type == 'rocket');
    if (keys[" "] && this.rockets) {
      console.log("ADDING ROCKET TO ACTORS");
      keys[" "] = false;
      this.actors.push(new Rocket(new Vec(platform.pos.x, platform.pos.y - 0.1)));
      this.rockets--;
      console.log(this.actors.find(a => a.type == 'rocket'));
    }
    for (let brick of bricks) {
      for (let a of this.actors) {
        if (a == undefined) console.log("UNDEFINED ACTOR");
        if (a.type != 'platform' && a.type != 'powerup') {
          // 	console.log("checking for collision!")
          let collided = this.collides(a, brick);
          if (collided) {
            if (a.type == 'rocket') {
              console.log("ROCKET HIT A BRICK")
              this.actors = this.actors.filter(b => b != a);
              //console.log(this.actors.filter(b => b.type == 'rocket'))
            }
            // 	console.log("COLLISION BETWEEN BALL AND BRICK")
            if (brick.powerup) {
              console.log("PUSHING POWERUP")
              this.actors.push(new PowerUp(brick.pos));
            }
            /*if (a.type == 'ball') {
              a.speed = collided[1];
            }*/
            this.level.bricks = this.level.bricks.filter(b => b != brick);
            bricks = bricks.filter(b => b != brick);
            //actors = actors.filter(actor => actor != a);
            //   console.log("OUT")
          }
        }
      }
    }
    // check for collision between ball and platform
    this.collides(ball, platform);
    // console.log("PAST CHECK FOR BALL AND PLATFORM")
    // loop to check for powerup collision
    for (let pow of powerups) {
      if (this.level.touches(pow.pos, pow.size, "floor")) {
      	console.log("REMOVING THE POWERUP")
        this.actors = this.actors.filter(a => a != pow);
      }
      else this.collides(pow, platform)
    }
    for (let r of rockets) {
      if (this.level.touches(r.pos, r.size, "roof")) {
        this.actors = this.actors.filter(a => a != r);
      }
    }
    // check for ball touching floor of level
    if (this.level.touches(ball.pos, ball.size, "floor")) {
      this.status = "lost";
    }

    // check for no bricks / win condition
    if (!bricks.length) {
      this.status = "won";
    }
    //console.log("before returning new state")
    return new State(this.level, bricks, this.actors, this.status, this.rockets, powerups);
  }

  start(level) {
    return new State(level, level.bricks, level.actors, "playing", 0);
  }
  addPower(powername, actor) {
    console.log("THE POWERNAME IS", powername);
    if (powername == "rockets") {
      console.log("ADDING AMMO!");
      this.rockets += 3;
    } else if (powername == "multi-ball") {
      //adding later
    } else if (powername == "bigplat") {
      actor.double();
    }
  }
  getPlatform() {
    return this.actors.find(a => a.type == 'platform');
  }
  collides(act, rect) {
    if (act.type == 'ball') {
      let ball = act;
      let rWidth = rect.size.x / 2;
      let rHeight = rect.size.y / 2;
      let rX = rect.pos.x + rWidth;
      let rY = rect.pos.y + rHeight;
      let quadrant = (ball.pos.x - rect.pos.x) < 0 && (ball.pos.y - rect.pos.y) > 0 ? 2 :
        (ball.pos.x - rect.pos.x) < 0 && (ball.pos.y - rect.pos.y) < 0 ? 3 :
        (ball.pos.x - rect.pos.x) > 0 && (ball.pos.y - rect.pos.y) < 0 ? 4 :
        1;

      let ballRadius = ball.size.x / 2;
      // collapse circle and rectangle to reference 1st quadrant
      let distXCircle = Math.abs(ball.pos.x - rX);
      let distYCircle = Math.abs(ball.pos.y - rY);

      if (distXCircle > rWidth + ballRadius)
        return false;
      if (distYCircle > rHeight + ballRadius)
        return false;

      if (distXCircle <= rWidth) {
        act.speed = act.speed.times(new Vec(1, -1));
        return true;
        //return [true, act.speed.times(new Vec(1, -1))];
      }
      if (distYCircle <= rHeight) {
        act.speed = act.speed.times(new Vec(-1, 1));
        return true;
        //return [true, act.speed.times(new Vec(-1, 1))];
      }
      // calculate current distance of circle's center from top-right corner of the rectangle 
      let cornerDistance = Math.pow(distXCircle - rWidth, 2) + Math.pow(distYCircle - rHeight, 2);
      if (cornerDistance <= Math.pow(ballRadius, 2)) {
        if (quadrant == 1 || quadrant == 2) {
          act.speed = act.speed.times(new Vec(-1, 1));
          return true;
          //return [true, act.speed.times(new Vec(-1, 1))];
        } else if (quadrant == 3 || quadrant == 4) {
          act.speed = act.speed.times(new Vec(1, -1));
          return true;
        }
        //return [true, act.speed.times(new Vec(1, -1))];
        // return false;
      }
    }
    if(overlap(act, rect)) {
    	if (act.type == 'powerup') {
       	this.addPower(act.powername, rect);
        this.actors = this.actors.filter(a => a != act);
      }
      else if (act.type == 'rocket') {
      	return true;
      }
    }
    
    return false;
  }
}

function rrcollision(r1, r2) {
  //console.log("checking for powerup collision")
  let x = r1.pos.x;
  let y = r2.pos.y;
  let width = r1.pos.x + r1.size.x;
  let height = r1.pos.y + r1.size.y;
  return actor1.pos.x + actor1.size.x > actor2.pos.x &&
    actor1.pos.x < actor2.pos.x + actor2.size.x &&
    actor1.pos.y + actor1.size.y > actor2.pos.y &&
    actor1.pos.y < actor2.pos.y + actor2.size.y;
}

function overlap(actor1, actor2) {
  return actor1.pos.x + actor1.size.x > actor2.pos.x &&
    actor1.pos.x < actor2.pos.x + actor2.size.x &&
    actor1.pos.y + actor1.size.y > actor2.pos.y &&
    actor1.pos.y < actor2.pos.y + actor2.size.y;
}

class CanvasDisplay {
  constructor(parent, level) {
    this.state = new State(level, level.bricks, level.actors, "playing");
    this.canvas = document.createElement("canvas");
    this.width = Math.max(600, level.width * scale);
    this.height = Math.max(450, level.height * scale);
    this.cx = this.canvas.getContext('2d');
    parent.appendChild(this.canvas);
  }
  drawBricks(bricks) {
    for (let brick of bricks) {
      this.cx.save();
      this.cx.fillStyle = "purple";
      let x = brick.pos.x * scale;
      let y = brick.pos.y * scale;
      let width = brick.size.x * scale;
      let height = brick.size.y * scale;
      this.cx.fillRect(x, y, width, height);
      this.cx.restore();
    }
  }
  drawActors(actors) {
    for (let a of actors) {
      if (a == undefined)
        console.log("have an undefined in drawActors");
      if (a.type == 'ball')
        this.drawBall(a);
      else
        this.drawRect(a);
    }
  }
  drawBall(ball) {
    let centerX = ball.pos.x * scale;
    let centerY = ball.pos.y * scale;
    let radius = ball.size.x / 2 * scale;
    this.cx.beginPath();
    this.cx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.cx.fill();
    this.cx.closePath();
  }
  drawRect(platform) {
    let x = platform.pos.x * scale;
    let y = platform.pos.y * scale;
    let width = platform.size.x * scale;
    let height = platform.size.y * scale;
    this.cx.fillRect(x, y, width, height);
  }
  drawBackground(level) {
    for (let y = 0; y < level.height; y++) {
      for (let x = 0; x < level.width; x++) {
        let type = level.rows[y][x];
        if (type == "wall" || type == "roof" || type == "floor") {
          this.cx.fillRect(x * scale, y * scale, 10, 10);
          continue;
        }
        if (type == "empty")
          continue;
      }
    }
  }
  clear() {
    this.canvas.remove();
  }
  clearDisplay() {
    this.cx.save();
    this.cx.fillStyle = "lightblue";
    this.cx.fillRect(0, 0, this.width, this.height);
    this.cx.restore();
  }
  updateDisplay(state) {
    this.clearDisplay();
    this.drawBackground(state.level);
    this.drawBricks(state.bricks);
    this.drawActors(state.actors);
  }

}
const levelChars = {
  ".": "empty",
  "#": "wall",
  "-": "roof",
  "=": "floor",
  "+": Brick,
  "o": Ball,
  "p": Platform
};

function trackKeys(keys) {
  let down = Object.create(null);

  function track(event) {
    if (keys.includes(event.key)) {
      down[event.key] = event.type == "keydown";
      event.preventDefault();
    }
  }
  window.addEventListener("keydown", track);
  window.addEventListener("keyup", track);
  return down;
}

const arrowKeys = trackKeys(["ArrowLeft", "ArrowRight", " "]);

function runAnimation(frameFunc) {
  let lastTime = null;

  function frame(time) {
    if (lastTime != null) {
      let timeStep = Math.min(time - lastTime, 100) / 1000;
      if (frameFunc(timeStep) === false) return;
    }
    lastTime = time;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function runLevel(level, Display) {
  let display = new Display(document.body, level);
  let state = State.prototype.start(level);
  let ending = 1;
  return new Promise(resolve => {
    runAnimation(time => {
      state = state.update(time, arrowKeys);
      display.updateDisplay(state);
      if (state.status == "playing") {
        return true;
      } else if (ending > 0) {
        ending -= time;
        return true;
      } else {
        display.clear();
        resolve(state.status);
        return false;
      }
    });
  });
}

let simpleLevel = new Level(simplePlan);

async function runGame(plans, Display) {
  let lives = 3;
  for (let level = 0; level < plans.length;) {
    console.log(`level # is ${level}`);
    let status = await runLevel(simpleLevel,
      Display);
    console.log("done");
    console.log(status == "won");
    if (status == "won") {
      console.log("incrementing level");
      level++;
    }
    if (status == "lost") lives--;
  }
  console.log("You've won!");
}

//runGame([simpleLevel], CanvasDisplay);