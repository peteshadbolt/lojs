/*
   pete.shadbolt@gmail.com
   Provides functions to describe and draw components in a linear optical circuit
*/

function Circuit() {
    // Holds a description of the complete circuit
    this.components=[];
    this.connectors=[];
    this.topLeft={"x":undefined, "y":undefined}; this.bottomRight={"x":undefined, "y":undefined};

    // Draw the circuit
    this.draw = function (ctx) {
        ctx.strokeStyle="#000000";
        for (var i=0; i<this.components.length; i++) {
            this.components[i].draw(ctx); }
        for (var i=0; i<this.connectors.length; i++) {
            this.connectors[i].draw(ctx); }

        // Box around circuit
        if (this.topLeft.x){
            startDrawing(ctx, 0, 0);
            ctx.strokeStyle= '#ccccff';
            ctx.beginPath();
            ctx.moveTo(this.topLeft.x-1.5, this.topLeft.y-.5); 
            ctx.lineTo(this.bottomRight.x+2.5, this.topLeft.y-.5); 
            ctx.lineTo(this.bottomRight.x+2.5, this.bottomRight.y+1.5); 
            ctx.lineTo(this.topLeft.x-1.5, this.bottomRight.y+1.5); 
            ctx.lineTo(this.topLeft.x-1.5, this.topLeft.y-.5); 
            stopDrawing(ctx);
        }
    }

    // Find at position (x,y);
    this.find = function (x, y) {
        for (var i=0; i<this.components.length; i++) {
            var c = this.components[i];
            if (c.x==x && c.y==y) {return c};
        }
        return undefined;
    }

    // Delete at position (x,y);
    this.kill = function (x, y) {
        var tokill=undefined;
        for (var i=0; i<this.components.length; i++) {
            var c = this.components[i];
            if (c.x==x && c.y==y) {tokill=i; break;};
        }
        if (tokill!=undefined){
            this.components.splice(tokill,1)
            this.decorate();
        };
    }

    // Is position (x,y) empty?
    this.empty = function (x, y) { return this.find(x, y)==undefined; }

    // Add horizontal lines to make clear the connections between components
    // Also work out the input and output ports
    this.decorate = function (x, y) {
        // Remove all connectors
        this.connectors.splice(0, this.connectors.length);

        // Get the bounds
        this.topLeft={"x":undefined, "y":undefined}; this.bottomRight={"x":undefined, "y":undefined};
        for (var i=0; i<this.components.length; i++) {
            var c = this.components[i];
            if (c.x<this.topLeft.x || this.topLeft.x==undefined) {this.topLeft.x=c.x};
            if (c.y<this.topLeft.y || this.topLeft.y==undefined) {this.topLeft.y=c.y};
            if (c.x>this.bottomRight.x || this.bottomRight.x==undefined) {this.bottomRight.x=c.x};
            if (c.y>this.bottomRight.y || this.bottomRight.y==undefined) {this.bottomRight.y=c.y};
        }

        // Fill the gaps
        for (var cx=this.topLeft.x-1; cx<=this.bottomRight.x+1; cx++) {
            for (var cy=this.topLeft.y; cy<=this.bottomRight.y+1; cy++) {
                if (this.empty(cx, cy) && this.empty(cx, cy-1))
                {
                    this.connectors.push(new Connector(cx, cy));
                }
            }
        }
    }
}


function Beamsplitter(x, y, ratio) {
    this.x = x; this.y = y;
    this.ratio = ratio ? ratio : 0.5;
    this.draw = drawBS;
}

function Coupler(x, y, ratio) {
    this.x = x; this.y = y;
    this.ratio = ratio ? ratio : 0.5;
    this.draw = drawCoupler;
}

function Phaseshifter(x, y, phase) {
    this.x = x; this.y = y;
    this.phase = phase ? phase : 0;
    this.draw = drawPS;
}

// Useful boilerplatey things
function startDrawing(ctx, x, y) {
        ctx.save();
        ctx.scale(gridSize,gridSize);
        ctx.lineWidth=(1/camera.z)/gridSize;
        ctx.translate(x,y);
        ctx.beginPath();
}

function stopDrawing(ctx) {
        ctx.stroke();
        ctx.restore();
}

function Connector(x, y) {
    this.x = x; this.y = y;
    this.draw = function(ctx) {
        startDrawing(ctx, this.x, this.y);
        ctx.moveTo(0, 0);
        ctx.lineTo(1, 0); 
        stopDrawing(ctx);
    }
}

function SPS(x, y) {
    this.x = x; this.y = y;
    this.draw = function(ctx) {
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
}

function Detector(x, y) {
    this.x = x; this.y = y;
    this.draw = function(ctx) {
        startDrawing(ctx, this.x, this.y);
        ctx.moveTo(0, 0);
        ctx.lineTo(1, 1); 
        ctx.moveTo(0, 1);
        ctx.lineTo(1, 0); 
        stopDrawing(ctx);
    }
}

function drawPS(ctx) {
    startDrawing(ctx, this.x, this.y);
    ctx.moveTo(0, 0);
    ctx.lineTo(1, 0); 
    ctx.moveTo(0, 1);
    ctx.lineTo(1, 1); 
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(.5, 1, .1, 0, 2*Math.PI, false);
    ctx.fillStyle = 'white';
    ctx.fill();
    stopDrawing(ctx);
}

function drawBS(ctx) {
    startDrawing(ctx, this.x, this.y);
    ctx.moveTo(0, 0);
    ctx.lineTo(1,1); 
    ctx.moveTo(0, 1);
    ctx.lineTo(1,0); 
    ctx.moveTo(.25,.5); 
    ctx.lineTo(.75,.5); 
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

