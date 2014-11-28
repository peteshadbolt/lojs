function Editor(targetCircuit, targetSimulator)
{
    var self = this;
    self.mode = Coupler;
    self.supermode = "construct";
    self.circuit = targetCircuit;
    self.simulator = targetSimulator;
    self.cursor = new Coupler(0, 0, .5);
    self.keyMap = {88: Crossing, 80: Phaseshifter, 67: Coupler, 83:SPS, 66:BellPair, 68:Detector};

    // Change mode by pressing keys
    self.bindKeys = function () {
        window.addEventListener('keydown', function (evt) {
            if (self.keyMap.hasOwnProperty(evt.keyCode)) {
                self.setMode(self.keyMap[evt.keyCode]);
            }}, true);
    }

    self.setMode = function (mode, button) {
        self.mode=mode;
        self.update();

        var temp=new mode(0,0);
        document.getElementById("coupler").className="nothing";
        document.getElementById("phaseshifter").className="nothing";
        document.getElementById("crossing").className="nothing";
        document.getElementById("source").className="nothing";
        document.getElementById("bellpair").className="nothing";
        document.getElementById("detector").className="nothing";
        document.getElementById(temp.type).className="hi";
        renderer.needFrame();
    }

    self.update = function () {
        self.cursor = self.circuit.request(self.mode, mouse.worldPos);
        renderer.needFrame();
    }

    self.click = function (x, y) {
        self.circuit.accept(self.cursor);
        simulator.update();
        self.update();
        renderer.needFrame();
    }

    self.draw = function (ctx) {
        ctx.globalAlpha=.5;
        self.cursor.draw(ctx);
        ctx.globalAlpha=1;
    }

    self.clear = function () {
        self.circuit.clear();
        simulator.update();
    }

    // TODO: data-URIs are dumbass
    self.exportCircuit = function () {
        var data = JSON.stringify(circuit.toJSON(), space="\t");
        data="<tt>"+data+"</tt>";
        myWindow = window.open("data:text/html," + encodeURIComponent(data), "_blank");
        myWindow.focus();
    }

    self.construct = function () {
        self.supermode="construct";
        document.getElementById("construct").className="hi";
        document.getElementById("adjust").className="nothing";
    }

    self.adjust = function () {
        self.supermode="adjust";
        document.getElementById("adjust").className="hi";
        document.getElementById("construct").className="nothing";
    }

    self.bindKeys();
    self.setMode(Coupler, document.getElementById("coupler"));
    self.construct();
}

