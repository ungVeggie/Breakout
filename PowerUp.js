class PowerUp {
    constructor(pos) {
        this.pos = pos;
        this.speed = new Vec(0, 1);
        this.powername = this.createPower();
    }
    update(time, state, keys) {
        let yDist = this.speed.y * time;
        this.pos = this.pos.plus(new Vec(0, yDist));
        return this;
    }
    createPower() {
        return (++powers[0] % powers.length) ? powers[powers[0]] : (powers[0] = 0, powers[++powers[0]]);
    }
    static create(pos) {
        return new PowerUp();
    }
}
PowerUp.prototype.size = new Vec(0.4, 0.4);
PowerUp.prototype.type = 'powerup';
const powers = [0, "rockets", "multi-ball", "bigplat"];