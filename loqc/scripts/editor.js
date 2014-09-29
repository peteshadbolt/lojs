function Editor(targetCircuit, targetSimulator)
{
    var self = this;

    self.mode = "dc";
    self.circuit = targetCircuit;
    self.simulator = targetSimulator;
    self.cursor = new Coupler(0, 0, .5);
    self.nameMap = {"dc": Coupler, "ps": Phaseshifter, "sps": SPS, "det": Detector};
    self.keyMap = {88: "dc", 80: "ps", 83: "sps", 68: "det"};

    self.bindKeys = function () {
        window.addEventListener('keydown', self.keyDown, true);
    }

    self.keyDown = function (evt) {
        if (self.keyMap.hasOwnProperty(evt.keyCode)) {
            self.setMode(self.keyMap[evt.keyCode]);
        }
    }

    self.setMode = function(modeString) {
        self.mode=modeString;
        self.cursor = new this.nameMap[self.mode](0, 0);
        redraw();
    }

    self.hit = function (x, y) {
        if (self.circuit.empty(x, y)) 
        {
            if (self.circuit.empty(x, y-1) && self.circuit.empty(x, y+1)){
                var object = new this.nameMap[self.mode](x, y);
                circuit.components.push(object);
                circuit.decorate();
                redraw();
            }
        } else 
        {
            self.circuit.kill(x, y);
            redraw();
        }
        self.simulator.update();
    }

    self.draw = function (ctx) {
        // The cursor
        self.cursor.x=mouse.ax; self.cursor.y=mouse.ay;
        ctx.strokeStyle= '#dddddd';
        self.cursor.draw(ctx);

        // Box around the mouse
        ctx.strokeStyle= '#ff0000';
        ctx.beginPath();
        ctx.moveTo(mouse.ax*gridSize, mouse.ay*gridSize); 
        ctx.lineTo(mouse.ax*gridSize, mouse.ay*gridSize+gridSize); 
        ctx.lineTo(mouse.ax*gridSize+gridSize, mouse.ay*gridSize+gridSize); 
        ctx.lineTo(mouse.ax*gridSize+gridSize, mouse.ay*gridSize); 
        ctx.lineTo(mouse.ax*gridSize, mouse.ay*gridSize); 
        ctx.stroke();
    }

}

