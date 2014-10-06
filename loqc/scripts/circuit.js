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
        for (var i=0; i < self.components.length; ++i) {
            if(self.components[i].enforceRules){self.components[i].enforceRules();}
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
        // Make the component and put it on the grid
        var c=new component(0,0);
        c.pos = grid.snap(worldPos, c.dimensions); // Make sure that it is on the nearest grid point
        if(c.enforceRules){c.enforceRules();}

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



// Circuit components (TODO: inheritance)

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

// A phase shifter
function Phaseshifter(x, y, phase) {
    this.index=undefined;
    this.pos = new Vector(x,y);
    this.dimensions=new Vector(1,0);
    this.phase = phase ? phase : 0;
    this.draw = drawPS;
    this.toJSON = function () { return {"type": "phaseshifter", "pos": this.pos,  "phase": this.phase }; }
}

// Connects things together. The identity!
function Connector(x, y) {
    this.pos = new Vector(x,y);
    this.dimensions=new Vector(1, 0);
    this.draw = drawConnector;
}

// Shows what we are about to delete and why
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

// A single-photon source
function SPS(x, y) {
    this.pos = new Vector(x,y);
    this.dimensions=new Vector(1, 0);
    this.type="sps";
    this.draw = drawSPS;
    this.toJSON = function () { return {"type": "sps", "pos": this.pos}; }
    this.enforceRules = function () {
       if (this.pos.x>circuit.topLeft.x){this.pos.x=circuit.topLeft.x;}
    }
}

// A Bell pair
function BellPair(x, y) {
    this.pos = new Vector(x,y);
    this.type="bellpair";
    this.dimensions=new Vector(1, 3);
    this.draw = drawBellPair;
    this.toJSON = function () { return {"type": "bellpair", "pos": this.pos}; }
    this.enforceRules = function () {
       if (this.pos.x>circuit.topLeft.x){this.pos.x=circuit.topLeft.x;}
    }
}

// A bucket detector
function Bucket(x, y) {
    this.pos = new Vector(x,y);
    this.dimensions=new Vector(1, 0);
    this.draw = drawBucket;
    this.toJSON = function () { return {"type": "bucket", "pos": this.pos}; }
    this.enforceRules = function () {
       if (this.pos.x<circuit.bottomRight.x-1){this.pos.x=circuit.bottomRight.x-1;}
    }
}
