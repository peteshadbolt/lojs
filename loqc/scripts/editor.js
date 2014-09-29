function Editor(targetCircuit, targetSimulator)
{
    var self = this;
    self.mode = "dc";
    self.superMode = "add";
    self.circuit = targetCircuit;
    self.simulator = targetSimulator;
    self.cursor = new Coupler(0, 0, .5);
    self.nameMap = {"dc": Coupler, "ps": Phaseshifter, "sps": SPS, "det": Detector};
    self.keyMap = {88: "dc", 80: "ps", 83: "sps", 68: "det"};
    self.colorMap = {"nothing":"gray", "add":"rgba(0,255,0,.8)", "delete":"rgba(255,0,0,.8)"};

    self.bindKeys = function () {
        window.addEventListener('keydown', self.keyDown, true);
        self.update();
    }

    self.keyDown = function (evt) {
        if (self.keyMap.hasOwnProperty(evt.keyCode)) {
            self.setMode(self.keyMap[evt.keyCode]);
        }
    }

    self.setMode = function (modeString) {
        self.mode=modeString;
        self.update();
        redraw();
    }

    self.update = function () {
        var isempty = self.circuit.empty(mouse.ax, mouse.ay);
        var isallowed = self.circuit.allowed(mouse.ax, mouse.ay);
        self.superMode = "nothing";
        if (!isempty){self.superMode="delete";}
        if (isempty && isallowed){self.superMode="add";}
        self.cursor=undefined;
        if (self.superMode=="add"){ self.cursor = new this.nameMap[self.mode](0, 0); }
        if (self.superMode=="delete") {self.cursor = new Deleter(0,0);}
    }

    self.hit = function (x, y) {
        if (self.superMode=="add"){
            var object = new this.nameMap[self.mode](x, y);
            circuit.components.push(object);
            circuit.decorate();
        }
        else if (self.superMode=="delete") {
            self.circuit.kill(x, y);
        }

        // Need to avoid this stage where possible
        self.update();
        redraw();
        self.simulator.update();
    }

    self.draw = function (ctx) {
        // The cursor
        if (self.cursor){
            self.cursor.x=mouse.ax; self.cursor.y=mouse.ay;
            ctx.strokeStyle=self.colorMap[self.superMode];
            self.cursor.draw(ctx);
        }

        // Box around the mouse
        ctx.strokeStyle= self.colorMap[self.superMode];
        ctx.beginPath();
        ctx.moveTo(mouse.ax*gridSize, mouse.ay*gridSize); 
        ctx.lineTo(mouse.ax*gridSize, mouse.ay*gridSize+gridSize); 
        ctx.lineTo(mouse.ax*gridSize+gridSize, mouse.ay*gridSize+gridSize); 
        ctx.lineTo(mouse.ax*gridSize+gridSize, mouse.ay*gridSize); 
        ctx.lineTo(mouse.ax*gridSize, mouse.ay*gridSize); 
        ctx.stroke();
    }

}

