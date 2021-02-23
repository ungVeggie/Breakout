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
        if (keys[" "] && this.rockets) {
            keys[" "] = false;
            this.actors.push(new Rocket(new Vec(platform.pos.x, platform.pos.y - 0.1)));
            this.rockets--;
        }
        for (let brick of bricks) {
            for (let a of this.actors) {
                if (a.type != 'platform' && a.type != 'powerup') {
                    let collided = this.collides(a, brick);
                    if (collided) {
                        if (a.type == 'rocket') {
                        	this.actors = this.actors.filter(b => b != a);
                        }
                        if (brick.powerup) {
                            this.actors.push(new PowerUp(brick.pos));
                        }
                        if (a.type == 'ball') {
                            a.speed = collided[1];
                        }
                        this.level.bricks = this.level.bricks.filter(b => b != brick);
                        bricks = bricks.filter(b => b != brick);
                    }
                }
            }
        }
        // check for collision between ball and platform
        if (this.collides(ball, platform)) {
            ball.speed.y = -ball.speed.y;
        }
        // loop to check for powerup collision
        for (let p of powerups) {
            if (collides(p, platform)) {
                this.addPower(p.powername, platform);
                this.actors = this.actors.filter(a => a != p);
            }
            else if (this.level.touches(p.pos, p.size, "floor") || this.level.touches(p.pos, p.size, "roof")) {
                this.actors = this.actors.filter(a => a != p)
            }
        }
        for (let r of this.actors.filter(a => a.type == 'rocket')) {
            if (this.level.touches(r.pos, r.size, "roof")) {
                this.actors = this.actors.filter(a => a != r);
            }
        }
        if (this.level.touches(ball.pos, ball.size, "floor")) {
            this.status = "lost";
        }
        if (!bricks.length) {
            this.status = "won";
        }
        return new State(this.level, bricks, this.actors, this.status, this.rockets, powerups);
    }
    start(level) {
        return new State(level, level.bricks, level.actors, "playing", 0);
    }
    addPower(powername, actor) {
        if (powername == "rockets") {
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
                if (quadrant == 1 || quadrant == 2 || quadrant == 3 || quadrant == 4)
                    return [true, act.speed.times(new Vec(1, -1))];
                else if (quadrant == 3 || quadrant == 4)
                    return [true, "bottom"];
                if (distYCircle <= rHeight) {
                    if (quadrant == 1 || quadrant == 4 || quadrant == 3 || quadrant == 2) {
                        return [true, act.speed.times(new Vec(-1,1))];
                        return [true, "right"];
                    } else if (quadrant == 2 || quadrant == 3)
                        return [true, "left"];
                }

                // calculate current distance of circle's center from top-right corner of the rectangle 
                let cornerDistance = Math.pow(distXCircle - rWidth, 2) + Math.pow(distYCircle - rHeight, 2);
                if (cornerDistance <= Math.pow(ballRadius, 2)) {
                  if (quadrant == 1 || quadrant == 2)  return [true, act.speed.times(new Vec(-1, 1))];
                  if (quadrant == 3 || quadrant == 4) return [true, act.speed.times(new Vec(1, -1))];
                }
                //return [cornerDistance <= Math.pow(ballRadius, 2), "corner"];
            }
        }
        if (act.type == 'rocket' || act.type == 'powerup') {
          let rX = act.pos.x;
          let rY = act.pos.y;
          let rWidth = act.size.x;
          let rHeight = act.size.y;
      
          return rX + rWidth > rect.pos.x &&
                 rX < rect.pos.x + rect.size.x &&
                 rY + rHeight > rect.size.y &&
                 rY < rect.pos.y + rect.size.y;
        }
        return false;
    }
}