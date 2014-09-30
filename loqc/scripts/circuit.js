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
        ctx.strokeStyle="#000000";
        for (var i=0; i<self.components.length; i++) {
            self.components[i].draw(ctx); }
        for (var i=0; i<self.connectors.length; i++) {
            self.connectors[i].draw(ctx); }

        // Box around circuit
        if (self.topLeft.x){
            startDrawing(ctx, 0, 0);
            ctx.strokeStyle= '#999999';
            ctx.beginPath();
            ctx.moveTo(self.topLeft.x-1.5, self.topLeft.y-.5); 
            ctx.lineTo(self.bottomRight.x+2.5, self.topLeft.y-.5); 
            ctx.lineTo(self.bottomRight.x+2.5, self.bottomRight.y+1.5); 
            ctx.lineTo(self.topLeft.x-1.5, self.bottomRight.y+1.5); 
            ctx.lineTo(self.topLeft.x-1.5, self.topLeft.y-.5); 
            stopDrawing(ctx);
        }
    }

    // Find the component at position (x,y); TODO this can be O(log(N))
    self.find = function (x, y) {
        for (var i=0; i<self.components.length; i++) {
            var c = self.components[i];
            if (c.x==x && c.y==y) {return c};
        }
        return undefined;
    }

    // Delete at position (x,y);
    self.kill = function (x, y) {
        var tokill=undefined;
        for (var i=0; i<self.components.length; i++) {
            var c = self.components[i];
            if (c.x==x && c.y==y) {tokill=i; break;};
        }
        if (tokill!=undefined){
            self.components.splice(tokill,1)
            self.decorate();
        };
    }

    // TODO: below are quite inefficient and belong somewhere else
    // Is position (x,y) empty?
    self.empty = function (x, y) { return self.find(x, y)==undefined; }

    // Is position (x,y) allowed?
    self.allowed = function (x, y) { return self.empty(x, y) && self.empty(x, y-1) && self.empty(x, y+1);}

    // Add horizontal lines to make clear the connections between components
    // Also work out the input and output ports
    self.decorate = function (x, y) {
        // Remove all connectors
        self.connectors.splice(0, self.connectors.length);

        // Get the bounds
        self.topLeft={"x":undefined, "y":undefined}; self.bottomRight={"x":undefined, "y":undefined};
        for (var i=0; i<self.components.length; i++) {
            var c = self.components[i];
            if (c.x<self.topLeft.x || self.topLeft.x==undefined) {self.topLeft.x=c.x};
            if (c.y<self.topLeft.y || self.topLeft.y==undefined) {self.topLeft.y=c.y};
            if (c.x>self.bottomRight.x || self.bottomRight.x==undefined) {self.bottomRight.x=c.x};
            if (c.y>self.bottomRight.y || self.bottomRight.y==undefined) {self.bottomRight.y=c.y};
        }

        // Fill the gaps
        for (var cx=self.topLeft.x-1; cx<=self.bottomRight.x+1; cx++) {
            for (var cy=self.topLeft.y; cy<=self.bottomRight.y+1; cy++) {
                if (self.empty(cx, cy) && self.empty(cx, cy-1))
                {
                    self.connectors.push(new Connector(cx, cy));
                }
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

    self.request = function (component, x, y) {
        console.log("Got a request for a", component, "at position", x, y);
        return new component(mouse.ax, mouse.ay);
    }
}


//************************************************************
// Circuit components
function Beamsplitter(x, y, ratio) {
    this.x = x; this.y = y;
    this.ratio = ratio ? ratio : 0.5;
    this.draw = drawBS;
}

function Coupler(x, y, ratio) {
    this.x = x; this.y = y;
    this.ratio = ratio ? ratio : 0.5;
    this.draw = drawCoupler;
    this.toJSON = function () {
        return {"type": "coupler", "x": this.x, "y": this.y, "ratio": this.ratio};
    }
}

function Phaseshifter(x, y, phase) {
    this.x = x; this.y = y;
    this.phase = phase ? phase : 0;
    this.draw = drawPS;
    this.toJSON = function () {
        return {"type": "phaseshifter", "x": this.x, "y": this.y, "phase": this.phase};
    }
}

function Connector(x, y) {
    this.x = x; this.y = y;
    this.draw = drawConnector;
}

function SPS(x, y) {
    this.x = x; this.y = y;
    this.draw = drawSPS;
}

function Detector(x, y) {
    this.x = x; this.y = y;
    this.draw = drawDetector;
}

function Deleter(x, y){
    this.x = x; this.y = y;
    this.draw = drawDeleter;
}

//************************************************************
// Boilerplate for drawing functions. TODO: optimize this stuff a lot!
function startDrawing(ctx, x, y) {
    ctx.save();
    ctx.scale(gridSize,gridSize);
    ctx.lineWidth=(1/camera.z)/gridSize;
    ctx.strokeStyle="black";
    ctx.translate(x,y);
    ctx.beginPath();
}

// Finish drawing and go back to screen space
function stopDrawing(ctx) {
    ctx.stroke();
    ctx.restore();
}


//************************************************************
// Complicated drawing functions
function drawConnector(ctx) {
    startDrawing(ctx, this.x, this.y);
    ctx.moveTo(0, 0);
    ctx.lineTo(1, 0); 
    stopDrawing(ctx);
}

function drawSPS(ctx) {
    startDrawing(ctx, this.x, this.y);
    ctx.moveTo(0, 0);
    ctx.lineTo(1, 0); 
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(.5, 0, .1, 0, 2*Math.PI, false);
    ctx.fillStyle = 'red';
    ctx.fill();
    stopDrawing(ctx);
}

function drawDetector(ctx) {
    startDrawing(ctx, this.x, this.y);
    ctx.moveTo(0, 0);
    ctx.lineTo(1, 1); 
    ctx.moveTo(0, 1);
    ctx.lineTo(1, 0); 
    stopDrawing(ctx);
}

function drawDeleter(ctx) {
    startDrawing(ctx, this.x, this.y);
    ctx.lineWidth=.1;
    ctx.moveTo(.2, .2);
    ctx.lineTo(.8, .8); 
    ctx.moveTo(.2, .8);
    ctx.lineTo(.8, .2); 
    stopDrawing(ctx);
}

function drawPS(ctx) {
    startDrawing(ctx, this.x, this.y);
    ctx.moveTo(0, 0);
    ctx.lineTo(1, 0); 
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(.5, 0, .1, 0, 2*Math.PI, false);
    ctx.fillStyle = 'white';
    ctx.fill();
    stopDrawing(ctx);
}

function drawBS(ctx) {
    startDrawing(ctx, this.x, this.y);
    ctx.moveTo(0, 0); ctx.lineTo(1,1); 
    ctx.moveTo(0, 1); ctx.lineTo(1,0); 
    ctx.moveTo(.25,.5); ctx.lineTo(.75,.5); 
    stopDrawing(ctx);
}

function drawCoupler(ctx) {
    gap=0.03;
    startDrawing(ctx, this.x, this.y);
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
    stopDrawing(ctx);
}

