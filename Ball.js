class Ball {
    constructor(pos, speed) {
        this.create(pos, speed);
    }
    update(time, state, keys) {
        let xSpeed = this.speed.x;
        let ySpeed = this.speed.y;
        let dx = xSpeed * time;
        let dy = ySpeed * time;

        let newPos = this.pos.plus(new Vec(dx, dy));
        if (state.level.touches(newPos, this.size, "roof")) {
            this.speed.y = -this.speed.y;
        } else if (state.level.touches(newPos, this.size, "wall")) {
            this.speed.x = -this.speed.x;
        } else if (state.level.touches(newPos, this.size, "floor")) {
            this.speed = new Vec(this.speed.x, -this.speed.y);
        }
        return new Ball(newPos, this.speed);
    }
    create(pos, speed) {
        this.pos = pos;
        this.speed = speed;
    }
}
Ball.prototype.size = new Vec(0.2, 0.2);
Ball.prototype.type = "ball";