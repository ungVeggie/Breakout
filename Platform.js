class Platform {
    constructor(pos, ammo) {
        this.create(pos, ammo);

    }
    update(time, state, keys) {
        let pos = this.pos;
        let xSpeed = 0;

        if (keys.ArrowLeft) {
            xSpeed -= this.speed;
        }
        if (keys.ArrowRight) {
            xSpeed += this.speed;
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
        this.size.x *= 2;
        setTimeout(plat => plat.size.x /= 2, 5000, this);
    }
}
Platform.prototype.speed = 7
Platform.prototype.size = new Vec(0.8, 0.2);
Platform.prototype.type = "platform";