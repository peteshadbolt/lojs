/*
   pete.shadbolt@gmail.com
   Provides functions to describe and draw components in a linear optical circuit
*/

function Circuit() {
    // Holds a description of the complete circuit
    var self=this;
    self.components=[]; self.connectors=[];
    // Draw the circuit
    self.draw = function (ctx) {
        if (self.components.length==0){return;}
        self.drawBox(ctx);
        ctx.strokeStyle="black";
        for (var i=0; i<self.components.length; i++) {
            self.components[i].draw(ctx); }
        for (var i=0; i<self.connectors.length; i++) {
            self.connectors[i].draw(ctx); }
    }

    // Do these two components touch? We are lenient about the x-axis!
    self.touching = function (a, b) {
        var a1 = a.pos; var a2 = a.pos.add(a.dimensions);
        var b1 = b.pos; var b2 = b.pos.add(b.dimensions);
        return !(a2.x<=b1.x || a2.y<b1.y || a1.x>=b2.x || a1.y>b2.y);
    }

    // Find all components which touch a given component
    self.findCollisions = function (c) {
        output=[];
        for (var i=0; i < self.components.length; ++i) {
           if (self.touching(self.components[i], c)){ output.push(self.components[i]); }
        }
        return output;
    }

    // Remove a component. This ought to be O(log(N)) but it's currently a hack!
    self.remove=function (c) {
        for (var i=0; i < self.components.length; ++i) {
           if (self.components[i].pos.equ(c.pos)){self.components.splice(i, 1);}
        }
    }

    // Just delete everything
    self.clear=function () {
        self.components=[];
        self.decorate();
        renderer.needFrame();
    }

    // Measure myself - dimensions, position, etc
    self.measure = function () {
        var tl=new Vector(10000, 10000); var br=new Vector(-10000, -10000);
        for (var i=0; i < self.components.length; ++i) {
            var c=self.components[i]; 
            var ctl=c.pos; var cbr=c.pos.add(c.dimensions);
            if (ctl.x<tl.x) { tl.x=ctl.x; } if (ctl.y<tl.y) { tl.y=ctl.y; }
            if (cbr.x>br.x) { br.x=cbr.x; } if (cbr.y>br.y) { br.y=cbr.y; }
        }
        self.pos = self.components.length>0 ? tl.copy() : undefined;
        self.dimensions = self.pos ? br.sub(tl) : undefined;
        self.nmodes = self.dimensions.y;
        self.topLeft = self.pos.copy();
        self.bottomRight = self.pos.add(self.dimensions);
    }

    // Add horizontal lines to make clear the connections between components Also work out the input and output ports
    self.decorate = function () {
        // Sort everything, label indeces
        // TODO. The below object-specific design rules should be implemented by the class itself
        self.measure();
        for (var i=0; i < self.components.length; ++i) {
            if (self.components[i].type=="sps"){self.components[i].pos.x=this.topLeft.x;}
        }
        compare = function (a, b){ return a.pos.x-b.pos.x; }
        self.components.sort(compare);
        for (var i=0; i < self.components.length; ++i) {
            self.components[i].index=i;
        }

        // Remove all connectors
        self.connectors.splice(0, self.connectors.length);
        if (self.components.length==0){return;}

        // Fill the gaps. This is stupidly slow right now!
        self.measure();
        for (var cx=self.topLeft.x; cx<self.bottomRight.x; cx++) {
            for (var cy=self.topLeft.y; cy<=self.bottomRight.y; cy++) {
                var c=new Connector(cx, cy);
                if (self.findCollisions(c).length==0){self.connectors.push(c); }
            }
        }
    }

    // Generate a plain-text JSON representation of the circuit. 
    self.toJSON = function () {
        var json={"components":[]};
        for (var i=0; i<self.components.length; i++) {
            var c = self.components[i];
            json.components.push(c.toJSON());
        }
        return json;
    }   

    // Ask whether we can have a particular component at a particular point in the circuit.
    self.request = function (component, worldPos) {
        var c=new component(0,0);
        c.pos = grid.snap(worldPos, c.dimensions); // Make sure that it is on the nearest grid point
        if (c.type=="sps"){c.pos.x=this.topLeft.x-1;}

        // Look for clashes with this new component. 
        var collisions = self.findCollisions(c); 
        if (collisions.length>0){ return new Deleter(collisions, c); }
        return c;
    }

    // Okay, yes, we'll have that component please
    self.accept = function (component) {
        // Some specialized components modify (act()) on the circuit
        if (component.act) {
            component.act(self);
        } else {
            self.components.push(component);
        }
        self.decorate();
    }

    // Draw a box around the circuit
    self.drawBox = function (ctx) {
        startDrawing(ctx, {"x":0, "y":0});
        ctx.strokeStyle="orange";
        ctx.lineWidth=.5/camera.z;
        ctx.beginPath();
        ctx.moveTo(self.topLeft.x, self.topLeft.y); 
        ctx.lineTo(self.bottomRight.x, self.topLeft.y); ctx.lineTo(self.bottomRight.x, self.bottomRight.y); 
        ctx.lineTo(self.topLeft.x, self.bottomRight.y); ctx.lineTo(self.topLeft.x, self.topLeft.y); 
        ctx.stroke();
        stopDrawing(ctx);
    }

}







//************************************************************
// Circuit components
function Coupler(x, y, ratio) {
    this.index=undefined;
    this.pos = new Vector(x,y);
    this.dimensions=new Vector(1,1);
    this.ratio = ratio ? ratio : 0.5;
    this.draw = drawCoupler;
    this.toJSON = function () {
        return {"type": "coupler", "pos": this.pos, "ratio": this.ratio, "index":this.index};
    }
}

function Crossing(x, y) {
    this.index=undefined;
    this.pos = new Vector(x,y);
    this.dimensions=new Vector(1,1);
    this.draw = drawCrossing
    this.toJSON = function () { return {"type": "crossing", "pos": this.pos}; }
}

function Phaseshifter(x, y, phase) {
    this.index=undefined;
    this.pos = new Vector(x,y);
    this.dimensions=new Vector(1,0);
    this.phase = phase ? phase : 0;
    this.draw = drawPS;
    this.toJSON = function () { return {"type": "phaseshifter", "pos": this.pos,  "phase": this.phase }; }
}

function Connector(x, y) {
    this.pos = new Vector(x,y);
    this.dimensions=new Vector(1, 0);
    this.draw = drawConnector;
}

function Deleter(collisions, request){
    this.pos = new Vector();
    this.dimensions=new Vector();
    this.collisions=collisions;
    this.request=request;
    this.draw = drawDeleter;
    this.act=function (circuit) {
        for (var i=0; i < this.collisions.length; ++i) {
           circuit.remove(this.collisions[i]); 
        }
    }
}

function SPS(x, y) {
    this.pos = new Vector(x,y);
    this.dimensions=new Vector(1, 0);
    this.type="sps";
    this.draw = drawSPS;
    this.toJSON = function () { return {"type": "sps", "pos": this.pos}; }
}

function BellPair(x, y) {
    this.pos = new Vector(x,y);
    this.dimensions=new Vector(1, 3);
    this.draw = drawBellPair;
    this.toJSON = function () { return {"type": "bellpair", "pos": this.pos}; }
}

//************************************************************
// Boilerplate for drawing functions. 
function startDrawing(ctx, pos) {
    ctx.save();
    ctx.lineWidth=1/camera.z;
    ctx.translate(pos.x, pos.y);
}

// Finish drawing and go back to screen space
function stopDrawing(ctx) { ctx.restore(); }


//************************************************************
// Complicated drawing functions
function drawConnector(ctx) {
    startDrawing(ctx, this.pos);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(1, 0); 
    ctx.stroke();
    stopDrawing(ctx);
}

function drawSPS(ctx, thepos, color) {
    if (thepos==undefined)(thepos=this.pos);
    if (color==undefined){color="red";}
    startDrawing(ctx, thepos);
    // Photon
    ctx.beginPath();
    ctx.arc(0, 0, .1, 0, 2*Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();

    // Arrow
    ctx.strokeStyle=color; ctx.lineWidth=.05;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(1, 0); 
    ctx.moveTo(.7, -.1);
    ctx.lineTo(1, 0); ctx.lineTo(.7, .1);
    ctx.stroke();
    stopDrawing(ctx);
}

function drawBellPair(ctx) {
    //TODO: fix these stupid Bezier curves
    //var c=.5;
    //ctx.moveTo(0, 0); ctx.bezierCurveTo(-c, 0, -c, 2, 0, 2);
    //ctx.moveTo(0, 1); ctx.bezierCurveTo(-c, 1, -c, 3, 0, 3);
    //ctx.stroke();
    //ctx.restore();

    drawSPS(ctx, this.pos, "purple");
    drawSPS(ctx, this.pos.add(0,2), "blue");
    drawSPS(ctx, this.pos.add(0,1), "purple");
    drawSPS(ctx, this.pos.add(0,3), "blue");
}

function drawDetector(ctx) {
    startDrawing(ctx, this.pos);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(1, 1); 
    ctx.moveTo(0, 1);
    ctx.lineTo(1, 0); 
    ctx.stroke();
    stopDrawing(ctx);
}


function drawDeleter(ctx) {
    for (var i=0; i < this.collisions.length; ++i) {
       var c=this.collisions[i]; 
       var center=c.pos.add(c.dimensions.multiply(.5));
       drawCross(ctx, center);     
       ctx.strokeStyle="red";
       this.request.draw(ctx);
    }
}

function drawCross(ctx, center) {
    startDrawing(ctx, center);
    ctx.beginPath();
    ctx.lineWidth=.1;
    ctx.strokeStyle="rgb(255,100,100)";
    var s=0.2;
    ctx.moveTo(-s, -s);
    ctx.lineTo(s, s); 
    ctx.moveTo(-s, s);
    ctx.lineTo(s, -s); 
    ctx.stroke();
    stopDrawing(ctx);
}

function drawPS(ctx) {
    startDrawing(ctx, this.pos);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(1, 0); 
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(.5, 0, .1, 0, 2*Math.PI, false);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.stroke();
    stopDrawing(ctx);
}

function drawCoupler(ctx) {
    var gap=0.03;
    var couplingLength=this.ratio/2;
    var l=0.5 - couplingLength/2;
    var r=0.5 + couplingLength/2;

    startDrawing(ctx, this.pos);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0.1, 0);
    ctx.bezierCurveTo(.25, 0, .25, .5-gap, .4,  .5-gap); 
    ctx.lineTo(.6, .5-gap); 
    ctx.bezierCurveTo(.75, .5-gap, .75, 0, .9,   0); 
    ctx.lineTo(1, 0);

    ctx.moveTo(0, 1);
    ctx.lineTo(0.1, 1);
    ctx.bezierCurveTo(.25, 1, .25, .5+gap, .4,  .5+gap); 
    ctx.lineTo(.6, .5+gap); 
    ctx.bezierCurveTo(.75, .5+gap, .75, 1, .9,   1); 
    ctx.lineTo(1, 1);
    ctx.stroke();

    //ctx.textBaseline = 'bottom';
    //if (this.index!=undefined && !mouse.pressed){
        //ctx.textAlign = 'center';
        //ctx.fillStyle = 'orange';
        //ctx.font=(.2)+'pt courier';
        //ctx.fillText(this.index, 0.55, 0.25);
    //}

    stopDrawing(ctx);
}

function drawCrossing(ctx) {
    startDrawing(ctx, this.pos);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(.2, 0, .2, 0, .5, .5); 
    ctx.bezierCurveTo(.8, 1, .8, 1, 1, 1); 
    ctx.moveTo(0, 1);
    ctx.bezierCurveTo(.2, 1, .2, 1, .5, .5); 
    ctx.bezierCurveTo(.8, 0, .8, 0, 1, 0); 
    ctx.stroke();

    //if (this.index!=undefined && !mouse.pressed){
        //ctx.textAlign = 'center';
        //ctx.fillStyle = 'blue';
        //ctx.font=(.2)+'pt courier';
        //ctx.fillText(this.index, 0.55, 0.25);
    //}
    stopDrawing(ctx);
}

