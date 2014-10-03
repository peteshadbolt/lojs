function Editor(targetCircuit, targetSimulator)
{
    var self = this;
    self.mode = Coupler;
    self.circuit = targetCircuit;
    self.simulator = targetSimulator;
    self.cursor = new Coupler(0, 0, .5);
    self.keyMap = {88: Crossing, 80: Phaseshifter, 67: Coupler};

    // Change mode by pressing keys
    self.bindKeys = function () {
        window.addEventListener('keydown', function (evt) {
            //console.log(evt);
            if (self.keyMap.hasOwnProperty(evt.keyCode)) {
                self.setMode(self.keyMap[evt.keyCode]);
            }}, true);
    }

    self.setMode = function (mode) {
        self.mode=mode;
        self.update();
        requestAnimationFrame(redraw);
    }

    self.update = function () {
        self.cursor = self.circuit.request(self.mode, mouse.worldPos);
        requestAnimationFrame(redraw);
    }

    self.click = function (x, y) {
        self.circuit.accept(self.cursor);
        simulator.update();
        requestAnimationFrame(redraw);
    }

    self.draw = function (ctx) {
        ctx.strokeStyle="gray";
        self.cursor.draw(ctx);
    }

    self.clear = function () {
        self.circuit.clear();
        simulator.update();
    }

    // TODO: data-URIs are dumbass
    self.exportCircuit = function () {
        var data = JSON.stringify(circuit.toJSON(), space="\t");
        data="<tt>"+data+"</tt>";
        myWindow = window.open("data:text/html," + encodeURIComponent(data),
                               "_blank");
        myWindow.focus();
    }

    self.bindKeys();
}

