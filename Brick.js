class Brick {
    constructor(pos) {
        this.create(pos);
    }
    create(pos, powerup = null) {
        this.pos = pos;
        this.powerup = powerup;
    }
}