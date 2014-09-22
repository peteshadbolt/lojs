/*
   pete.shadbolt@gmail.com
   Provides functions to describe and draw components in a linear optical circuit
*/

function Circuit() {
    // Holds a description of the complete circuit
    this.components=[]

    // Draw the circuit
    this.draw = function (ctx) {
        ctx.strokeStyle="#000000";
        for (var i=0; i<this.components.length; i++)
        {
            this.components[i].draw(ctx);
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

    // Add a BS at position (x,y)
    this.addBS = function (x, y, ratio) {
        this.components.push(new Beamsplitter(x, y, ratio));
        this.decorate();
    }

    // Add a directional coupler at position (x,y)
    this.addDC = function (x, y, ratio) {
        this.components.push(new Coupler(x, y, ratio));
        this.decorate();
    }

    // Add a load of horizontal lines to make clear the connections between components
    this.decorate = function () {
        
    }

}


function Beamsplitter(x, y, ratio) {
    this.x = x;
    this.y = y;
    this.ratio = ratio;
    this.draw = drawBS;
}

function Coupler(x, y, ratio) {
    this.x = x;
    this.y = y;
    this.ratio = ratio;
    this.draw = drawCoupler;
}

function Phaseshifter(x, y, phase) {
    this.x = x;
    this.y = y;
    this.phase = phase;
    this.draw = drawPS;
}

function drawBS(ctx) {
    var x=this.x, y=this.y
    ctx.save();
    ctx.scale(gridSize,gridSize);
    ctx.lineWidth=(1/camera.z)/gridSize;
    ctx.translate(x,y);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(1,1); 
    ctx.moveTo(0, 1);
    ctx.lineTo(1,0); 
    ctx.moveTo(.25,.5); 
    ctx.lineTo(.75,.5); 
    ctx.stroke();
    ctx.restore();
}

function drawCoupler(ctx) {
    var x=this.x, y=this.y, gap=.03;
    ctx.save();
    ctx.scale(gridSize,gridSize);
    ctx.lineWidth=(1/camera.z)/gridSize;
    ctx.translate(x,y);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(.25, 0, .25, .5-gap, .5,  .5-gap); 
    ctx.bezierCurveTo(.75, .5-gap, .75, 0, 1,   0); 
    ctx.moveTo(0, 1);
    ctx.bezierCurveTo(.25, 1, .25, .5+gap, .5,  .5+gap); 
    ctx.bezierCurveTo(.75, .5+gap, .75, 1, 1,   1); 
    ctx.stroke();
    ctx.restore();
}

