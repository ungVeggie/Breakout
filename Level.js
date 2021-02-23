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
                this.actors.push(new type(new Vec(x, y), new Vec(-3, -3)));
            }
            if (type == Platform) {
                this.actors.push(new type(new Vec(x, y)));
            }
            if (type == Brick) {
                this.bricks.push(new type(new Vec(x, y)));
            }
            return "empty";
        }));
        for (let i = 0; i < 3; i++) {
            this.addPowerUps();
        }
    }
    getBall() {
        return this.actors.filter(a => a.type == 'ball');
    }
    touches(pos, size, type) {
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
const levelChars = {
    ".": "empty",
    "#": "wall",
    "-": "roof",
    "=": "floor",
    "+": Brick,
    "o": Ball,
    "p": Platform
  };