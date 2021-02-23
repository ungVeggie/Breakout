class Rocket extends PowerUp{
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
Rocket.prototype.size  = new Vec(0.2, 0.2);
Rocket.prototype.type = 'rocket';