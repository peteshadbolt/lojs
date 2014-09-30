function Editor(targetCircuit, targetSimulator)
{
    var self = this;
    self.mode = Coupler;
    self.circuit = targetCircuit;
    self.simulator = targetSimulator;
    self.cursor = new Coupler(0, 0, .5);
    self.keyMap = {88: Coupler, 80: Phaseshifter, 83: SPS, 68: Detector};

    // Change mode by pressing keys
    self.bindKeys = function () {
        window.addEventListener('keydown', function (evt) {
            if (self.keyMap.hasOwnProperty(evt.keyCode)) {
                self.setMode(self.keyMap[evt.keyCode]);
            }}, true);
    }

    self.setMode = function (modeString) {
        self.mode=modeString;
        self.update();
        redraw();
    }

    self.update = function () {
        self.cursor = self.circuit.request(self.mode, mouse.worldPos);
        requestAnimationFrame(redraw);
    }

    self.click = function (x, y) {
        self.circuit.accept(self.cursor);
        requestAnimationFrame(redraw);
    }

    self.draw = function (ctx) {
        ctx.strokeStyle="gray";
        self.cursor.draw(ctx);
    }

    self.bindKeys();
}

