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
        var a1 = a.pos; var a2 = a.pos.addVec(a.dimensions);
        var b1 = b.pos; var b2 = b.pos.addVec(b.dimensions);
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

    // Find components which can be adjusted, near a given point
    self.findAdjustable = function (x, y) {
        var mindist2=0.3*0.3;
        for (var i=0; i < self.components.length; ++i) {
            var c = self.components[i];
            if (c.adjust == undefined){continue;}
            var center=c.center();
            var dx = center.x-x;
            var dy = center.y-y;
            var distance = dx*dx+dy*dy;
            if (distance<mindist2) return c;
        }
        return undefined;
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
        self.measure();
        renderer.needFrame();
    }

    // Measure myself - dimensions, position, etc
    self.measure = function () {
        var tl=new Vector(10000, 10000); var br=new Vector(-10000, -10000);
        for (var i=0; i < self.components.length; ++i) {
            var c=self.components[i]; 
            var ctl=c.pos; var cbr=c.pos.addVec(c.dimensions);
            if (ctl.x<tl.x) { tl.x=ctl.x; } if (ctl.y<tl.y) { tl.y=ctl.y; }
            if (cbr.x>br.x) { br.x=cbr.x; } if (cbr.y>br.y) { br.y=cbr.y; }
        }
        self.pos = self.components.length>0 ? tl.copy() : new Vector(0,0);
        self.dimensions = self.components.length>0 ? br.sub(tl) : new Vector(0,0);
        self.nmodes = self.dimensions.y;
        self.topLeft = self.pos.copy();
        self.bottomRight = self.pos.addVec(self.dimensions);

        var data=JSON.stringify(self.toJSON());
        document.getElementById("download").href="data:text/plain,"+data;
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

    self.fromJSON = function (json) {
        self.clear();
        for (var i=0; i <json.length; ++i) {
           var c = json[i];
           console.log(c);
           if (c.type=="source"){self.components.push(new SPS(c.pos.x, c.pos.y));}
           if (c.type=="bellpair"){self.components.push(new BellPair(c.pos.x, c.pos.y));}
           if (c.type=="fockstate"){self.components.push(new FockState(c.pos.x, c.pos.y));}
           if (c.type=="coupler"){self.components.push(new Coupler(c.pos.x, c.pos.y, c.ratio));}
           if (c.type=="phaseshifter"){self.components.push(new Phaseshifter(c.pos.x, c.pos.y, c.phase));}
           if (c.type=="crossing"){self.components.push(new Crossing(c.pos.x, c.pos.y));}
           if (c.type=="detector"){self.components.push(new Detector(c.pos.x, c.pos.y));}
           if (c.type=="herald"){self.components.push(new Herald(c.pos.x, c.pos.y));}
        }       
        self.decorate();
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
   this.json = function(){return {"type":this.type, "x":this.relPos().x, "y":this.relPos().y}}
   this.center = function(){return this.pos.add(this.dimensions.x/2, this.dimensions.y/2);}
}

// Bits and pieces 
function Coupler(x, y, ratio) {
    Component.call(this, "coupler", x, y, 1, 1, drawCoupler);
    this.ratio = ratio ? ratio : .5;
    this.json = function(){return {"type":this.type, "x":this.relPos().x, "y":this.relPos().y, "ratio":this.ratio}}
    this.adjust = function (angle) {
       this.ratio = (1-Math.cos(angle))/2;
       return "Coupling ratio: " + this.ratio.toFixed(5); 
    }
}

function Phaseshifter(x, y, phase) {
    Component.call(this, "phaseshifter", x, y, 1, 0, drawPhaseShifter);
    this.phase = phase ? phase : 0;
    this.json = function(){return {"type":this.type, "x":this.relPos().x, "y":this.relPos().y, "phase":this.phase}}
    this.adjust = function (angle) {
       this.phase = angle;
       return "Phase: " + (this.phase/Math.PI).toFixed(5) + " pi";
    }
}

function Crossing(x, y) { Component.call(this, "crossing", x, y, 1, 1, drawCrossing); }

function Connector(x, y) { Component.call(this, "connector", x, y, 1, 0, drawConnector); }

function SPS(x, y) {
    Component.call(this, "source", x, y, 1, 0, drawSPS);
    this.enforceRules = function () { if (this.pos.x>circuit.topLeft.x){this.pos.x=circuit.topLeft.x;} }
}

function BellPair(x, y) {
    Component.call(this, "bellpair", x, y, 1, 3, drawBellPair);
    this.enforceRules = function () { if (this.pos.x>circuit.topLeft.x){this.pos.x=circuit.topLeft.x;} }
}

function FockState(x, y) {
    Component.call(this, "fockstate", x, y, 1, 0, drawFockState);
    this.n = 2;
    this.adjust = function (angle) {
       this.n = Math.floor(5 * angle/(2*Math.PI))+1;
       return "n = " + this.n;
    }
    this.enforceRules = function () { if (this.pos.x>circuit.topLeft.x){this.pos.x=circuit.topLeft.x;} }
}

function Detector(x, y) {
    Component.call(this, "detector", x, y, 1, 0, drawDetector);
    this.enforceRules = function () { if (this.pos.x<circuit.bottomRight.x-1){this.pos.x=circuit.bottomRight.x-1;} }
}

function Herald(x, y) {
    Component.call(this, "herald", x, y, 1, 0, drawHerald);
    this.enforceRules = function () { if (this.pos.x<circuit.bottomRight.x-1){this.pos.x=circuit.bottomRight.x-1;} }
}

function Deleter(collisions, request){
    this.pos = new Vector(0, 0);
    this.type = "deleter";
    this.dimensions=new Vector(0, 0);
    this.collisions=collisions;
    this.request=request;
    this.draw = drawDeleter;
    this.act=function (circuit) {
        for (var i=0; i < this.collisions.length; ++i) {
           circuit.remove(this.collisions[i]); 
        }
    }
}

