function Constructor(targetCircuit)
{
    var self = this;
    self.circuit=targetCircuit;
    self.mode = Coupler;
    self.label = "constructor";
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
        var oc = self.cursor.pos.copy();
        self.cursor = self.circuit.request(self.mode, mouse.worldPos);
        if (oc.x!=self.cursor.pos.x || oc.y !=self.cursor.pos.y){renderer.needFrame();}
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

    self.bindKeys();
    self.setMode(Coupler, document.getElementById("coupler"));
}


function Adjuster(targetCircuit)
{
    var self = this;
    self.label="adjuster";
    self.circuit=targetCircuit;
    self.hover=undefined;

    self.update = function () {
        var wasnull = self.hover==undefined;
        self.hover = self.circuit.findAdjustable(mouse.worldPos.x, mouse.worldPos.y);
        var nownull = self.hover==undefined;
        if (wasnull!=nownull){renderer.needFrame();}
    }

    self.click = function (x, y) {
        
    }

    self.draw = function (ctx) {
        ctx.globalAlpha=.5;
        if (self.hover != undefined){
            var c = self.hover.center();
            startDrawing(ctx, c);
            ctx.strokeStyle="red";
            ctx.lineWidth*=3;
            ctx.beginPath();
            ctx.arc(0, 0, .3, 0, 2*Math.PI, false);
            ctx.stroke();
            stopDrawing(ctx);
        }
        ctx.globalAlpha=1;
    }

}
