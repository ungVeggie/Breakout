function CanvasDisplay(parent, level) {
     this.state = new State(level, level.bricks, level.actors, "playing");
     this.canvas = document.createElement("canvas");
     this.width = Math.max(600, level.width * scale);
     this.height = Math.max(450, level.height * scale);
     this.cx = this.canvas.getContext('2d');
     parent.appendChild(this.canvas);
}
   
CanvasDisplay.prototype.drawBricks = function(bricks) {
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

CanvasDisplay.prototype.drawActors = function(actors) {
    for (let a of actors) {
        if (a.type == 'ball') this.drawBall(a);
        else this.drawRect(a);
    }
}

CanvasDisplay.prototype.drawBall = function(ball) {
    let centerX = ball.pos.x * scale;
    let centerY = ball.pos.y * scale;
    let radius = ball.size.x / 2 * scale;
    this.cx.beginPath();
    this.cx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.cx.fill();
    this.cx.closePath();
}
   
CanvasDisplay.prototype.drawRect = function(platform) {
    let x = platform.pos.x * scale;
    let y = platform.pos.y * scale;
    let width = platform.size.x * scale;
    let height = platform.size.y * scale;
    this.cx.fillRect(x, y, width, height);
}
   
CanvasDisplay.prototype.drawBackground = function(level) {
    for (let y = 0; y < level.height; y++) {
        for (let x = 0; x < level.width; x++) {
            let type = level.rows[y][x];
            if (type == "wall" || type == "roof" || type == "floor") {
                this.cx.fillRect(x*scale, y*scale, 10, 10);
                continue;
            }
            if (type == "empty") continue;
        }
    }
}
   
CanvasDisplay.prototype.clear = function() {
    this.canvas.remove();
}

CanvasDisplay.prototype.clearDisplay = function() {
    this.cx.save();
    this.cx.fillStyle = "lightblue";
    this.cx.fillRect(0, 0, this.width, this.height);
    this.cx.restore();
}

CanvasDisplay.prototype.updateDisplay = function(state) {
    this.clearDisplay();
    this.drawBackground(state.level);
    this.drawBricks(state.bricks);
    this.drawActors(state.actors);
    this.drawPlatform(state.platform);
}