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
      console.log(level);
    }
    console.log("You've won!");
  }
  
  runGame([simpleLevel], CanvasDisplay);