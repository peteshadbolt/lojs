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
                construct();
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
    self.info = document.getElementById("info");
    self.angle=0;

    self.update = function () {
        if (self.moving==undefined){
            var wasnull = self.hover==undefined;
            self.hover = self.circuit.findAdjustable(mouse.worldPos.x, mouse.worldPos.y);
            var nownull = self.hover==undefined;
            if (wasnull!=nownull){renderer.needFrame();}
        } else {
            renderer.needFrame();
            var c = self.moving.center();
            var m = mouse.worldPos;
            self.angle = Math.atan2(-(c.x-m.x), c.y-m.y);
            if (mouse.shift){
                var resolution = Math.PI/8;
                n=Math.round(self.angle/resolution);
                self.angle = n*resolution;
            }
            if (self.angle<0){self.angle+=2*Math.PI;}
            var response = self.moving.adjust(self.angle);
            self.info.innerHTML = response;
            simulator.update();
            //console.log("Change the parameter", self.moving, mouse.worldPos);
        }
    }

    self.click = function (x, y) {
        if (self.hover!=undefined && self.moving==undefined){
            self.info.setAttribute("style", "");
            self.moving=self.hover;
            return;
        }
        self.info.setAttribute("style", "display:none");
        self.moving=undefined;
        simulator.update();
        renderer.needFrame();
    }

    self.draw = function (ctx) {
        ctx.globalAlpha=.5;
        if (self.hover != undefined){
            var c = self.hover.center();
            startDrawing(ctx, c);
            ctx.strokeStyle="blue";
            ctx.lineWidth*=4;
            ctx.beginPath();
            ctx.arc(0, 0, .2, 0, 2*Math.PI, false);
            ctx.stroke();
            stopDrawing(ctx);
        }

        for (var i=0; i < circuit.components.length; ++i) {
            var c = circuit.components[i];
            if (c.adjust != undefined){
                drawKnob(ctx, c.center());
            }
        }

        if (self.moving) {
            var c = self.moving.center();
            var x1 = c.x + Math.sin(self.angle)*.2;
            var y1 = c.y - Math.cos(self.angle)*.2;
            var x2 = c.x + Math.sin(self.angle)*10;
            var y2 = c.y - Math.cos(self.angle)*10;
            startDrawing(ctx, new Vector(0,0));
            ctx.strokeStyle="blue";
            ctx.lineWidth*=4;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            stopDrawing(ctx);
        }
        ctx.globalAlpha=1;
    }

}
