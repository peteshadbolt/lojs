/*
   pete.shadbolt@gmail.com
   Provides functions to describe and draw components in a linear optical circuit
   TODO: Decouple design rules from Circuit() and optimize heavily!
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
           if (self.touching(self.components[i], c) && self.components[i]!=c){ output.push(self.components[i]); }
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
        self.connectors=[];
        self.decorate();
        self.topLeft=undefined;
        self.bottomRight=undefined;
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
        // Remove all connectors
        self.connectors.splice(0, self.connectors.length);
        if (self.components.length==0){return;}

        // Sort everything, label indeces
        compare = function (a, b){ return a.pos.x-b.pos.x; }
        self.components.sort(compare);
        for (var i=0; i < self.components.length; ++i) {
            self.components[i].index=i;
        }

        // Enforce design rules
        self.measure();
        console.log(self.topLeft);
        if (self.topLeft!=undefined){
            for (var i=0; i < self.components.length; ++i) {
                if(self.components[i].enforceRules){self.components[i].enforceRules();}
            }
        }

        // If, after all that, there are collisions - then just delete them
        for (var i=0; i < self.components.length; ++i) {
            var collisions=self.findCollisions(self.components[i]);
            for (var j=0; j < collisions.length; ++j) {
               self.remove(collisions[j]);
            }
        }

        // Fill the gaps. This is stupidly slow right now!
        for (var cx=self.topLeft.x; cx<self.bottomRight.x; cx++) {
            for (var cy=self.topLeft.y; cy<=self.bottomRight.y; cy++) {
                var c=new Connector(cx, cy);
                if (self.findCollisions(c).length==0){self.connectors.push(c); }
            }
        }
    }


    // Ask whether we can have a particular component at a particular point in the circuit.
    self.request = function (component, worldPos) {
        // Make the component and put it on the grid
        var c=new component(0,0);
        c.pos = grid.snap(worldPos, c.dimensions); // Make sure that it is on the nearest grid point
        if(c.enforceRules && self.topLeft!=undefined){c.enforceRules();}

        // Look for clashes with this new component. 
        var collisions = self.findCollisions(c); 
        if (collisions.length>0) {
            return new Deleter(collisions, c); 
        } else {
            return c; }
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

    self.toJSON = function () {
        json=[];
        for (var i=0; i < self.components.length; ++i) {
           json.push(self.components[i].json());
        }       
        return json;
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


// Base class
function Component(type, x, y, dx, dy, drawFunc) {
   this.type=type;
   this.pos = new Vector(x, y);
   this.relPos = function () {return this.pos.add(0, -circuit.topLeft.y)}
   this.type = type;
   this.dimensions = new Vector(dx, dy);
   this.draw = drawFunc;
   this.json = function(){return {"type":this.type, "pos":this.relPos()}}
}

// Bits and pieces 
function Coupler(x, y, ratio) {
    Component.call(this, "coupler", x, y, 1, 1, drawCoupler);
    this.ratio = ratio ? ratio : .5;
    this.json = function(){return {"type":this.type, "pos":this.relPos(), "ratio":this.ratio}}
}

function Phaseshifter(x, y, phase) {
    Component.call(this, "phaseshifter", x, y, 1, 0, drawPhaseShifter);
    this.phase = phase ? phase : 0;
    this.json = function(){return {"type":this.type, "pos":this.relPos(), "phase":this.phase}}
}

function Crossing(x, y) { Component.call(this, "crossing", x, y, 1, 1, drawCrossing); }

function Connector(x, y) { Component.call(this, "connector", x, y, 1, 0, drawConnector); }

function SPS(x, y) {
    Component.call(this, "sps", x, y, 1, 0, drawSPS);
    this.enforceRules = function () { if (this.pos.x>circuit.topLeft.x){this.pos.x=circuit.topLeft.x;} }
}

function BellPair(x, y) {
    Component.call(this, "bellpair", x, y, 1, 3, drawBellPair);
    this.enforceRules = function () { if (this.pos.x>circuit.topLeft.x){this.pos.x=circuit.topLeft.x;} }
}

function Bucket(x, y) {
    Component.call(this, "bucket", x, y, 1, 0, drawBucket);
    this.enforceRules = function () { if (this.pos.x<circuit.bottomRight.x-1){this.pos.x=circuit.bottomRight.x-1;} }
}

function Deleter(collisions, request){
    this.pos = new Vector();
    this.type = "deleter";
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

