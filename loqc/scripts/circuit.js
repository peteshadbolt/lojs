/*
   pete.shadbolt@gmail.com
   Provides functions to describe and draw components in a linear optical circuit
*/

function Circuit() {
    // Holds a description of the complete circuit
    var self=this;
    self.components=[];
    self.connectors=[];
    self.topLeft={"x":undefined, "y":undefined}; self.bottomRight={"x":undefined, "y":undefined};

    // Draw the circuit
    self.draw = function (ctx) {
        // Box around circuit
        if (self.topLeft.x){
            startDrawing(ctx, {"x":0, "y":0});
            ctx.strokeStyle="yellow";
            ctx.lineWidth=1/camera.z;
            ctx.beginPath();
            ctx.moveTo(self.topLeft.x, self.topLeft.y); 
            ctx.lineTo(self.bottomRight.x, self.topLeft.y); 
            ctx.lineTo(self.bottomRight.x, self.bottomRight.y); 
            ctx.lineTo(self.topLeft.x, self.bottomRight.y); 
            ctx.lineTo(self.topLeft.x, self.topLeft.y); 
            ctx.fillStyle="#ffffdd";
            ctx.fill();
            ctx.stroke();
            stopDrawing(ctx);
        }

        // Components and connectors
        ctx.strokeStyle="black";
        for (var i=0; i<self.components.length; i++) {
            self.components[i].draw(ctx); }
        for (var i=0; i<self.connectors.length; i++) {
            self.connectors[i].draw(ctx); }
    }

    // Find the component at position (x,y); TODO this can be O(log(N))
    self.find = function (pos) {
        for (var i=0; i<self.components.length; i++) {
            var c = self.components[i];
            if (c.pos.equ(pos)) {return c};
        }
        return undefined;
    }

    // Delete at position (x,y);
    self.kill = function (pos) {
        var tokill=undefined;
        for (var i=0; i<self.components.length; i++) {
            var c = self.components[i];
            if (c.pos.x==x && c.pos.y==y) {tokill=i; break;};
        }
        if (tokill!=undefined){
            self.components.splice(tokill,1)
            self.decorate();
        };
    }

    // TODO: below are quite inefficient and belong somewhere else
    // Is position (x,y) empty?
    self.empty = function (pos) { return self.find(pos)==undefined; }

    // Add horizontal lines to make clear the connections between components
    // Also work out the input and output ports
    self.decorate = function () {
        // Remove all connectors
        self.connectors.splice(0, self.connectors.length);

        // Get the bounds
        self.topLeft={"x":undefined, "y":undefined}; self.bottomRight={"x":undefined, "y":undefined};
        for (var i=0; i<self.components.length; i++) {
            var c=self.components[i];
            var cp = c.pos;
            var rp = {"x": c.pos.x + c.dimensions.width, "y": c.pos.y + c.dimensions.height};
            if (cp.x<self.topLeft.x || self.topLeft.x==undefined) {self.topLeft.x=cp.x};
            if (cp.y<self.topLeft.y || self.topLeft.y==undefined) {self.topLeft.y=cp.y};
            if (rp.x>self.bottomRight.x || self.bottomRight.x==undefined) {self.bottomRight.x=rp.x};
            if (rp.y>self.bottomRight.y || self.bottomRight.y==undefined) {self.bottomRight.y=rp.y};
        }

        // Fill the gaps
        for (var cx=self.topLeft.x-1; cx<self.bottomRight.x+1; cx++) {
            for (var cy=self.topLeft.y; cy<self.bottomRight.y; cy++) {
                //if (self.empty(cx, cy) && self.empty(cx, cy-1))
                //{
                    //self.connectors.push(new Connector(cx, cy));
                //}
            }
        }
    }

    // Generate a plain-text JSON representation of the circuit. 
    // Used for saving and sending to the simulator
    self.toJSON = function () {
        var json={"components":[]};
        for (var i=0; i<self.components.length; i++) {
            var c = self.components[i];
            json.components.push(c.toJSON());
        }
        return JSON.stringify(json);
    }   

    self.request = function (component, worldPos) {
        var c=new component(0,0);
        // Make sure that it is on the nearest grid point
        c.pos = grid.snap(worldPos, c.dimensions);
        // Is that grid point empty? If not, then we are going to delete
        if (!self.empty(c.pos))
        {
            c=new Deleter(c.pos);
        }
        return c;
    }

    self.accept = function (component) {
        self.components.push(component);
        self.decorate();
    }
}


//************************************************************
// Circuit components
function Coupler(x, y, ratio) {
    this.pos = new Vector(x,y);
    this.dimensions={"width":1, "height":1};
    this.ratio = ratio ? ratio : 0.5;
    this.draw = drawCoupler;
    this.toJSON = function () {
        return {"type": "coupler", "pos": this.pos, "ratio": this.ratio};
    }
}

function Phaseshifter(x, y, phase) {
    this.pos = new Vector(x,y);
    this.dimensions={"width":1, "height":0};
    this.phase = phase ? phase : 0;
    this.draw = drawPS;
    this.toJSON = function () {
        return {"type": "phaseshifter", "pos": this.pos,  "phase": this.phase};
    }
}

function Connector(x, y) {
    this.pos = new Vector(x,y);
    this.draw = drawConnector;
}

function SPS(x, y) {
    this.pos = new Vector(x,y);
    this.draw = drawSPS;
}

function Detector(x, y) {
    this.pos = new Vector(x,y);
    this.draw = drawDetector;
}

function Deleter(pos){
    this.pos = pos.copy();
    this.dimensions={"width":1, "height":0};
    this.draw = drawDeleter;
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

function drawSPS(ctx) {
    startDrawing(ctx, this.pos);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(1, 0); 
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(.5, 0, .1, 0, 2*Math.PI, false);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.stroke();
    stopDrawing(ctx);
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
    startDrawing(ctx, this.pos);
    ctx.beginPath();
    ctx.lineWidth=.15;
    ctx.strokeStyle="red";
    ctx.moveTo(.2, .2);
    ctx.lineTo(.8, .8); 
    ctx.moveTo(.2, .8);
    ctx.lineTo(.8, .2); 
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
    gap=0.03;
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
    stopDrawing(ctx);
}

