/*
   pete.shadbolt@gmail.com
   Code here is very ugly. That's okay - it contains real geometry
*/


//************************************************************
// Boilerplate for drawing functions. 
function startDrawing(ctx, pos) {
    ctx.save();
    ctx.lineWidth=1/camera.z;
    ctx.strokeStyle="black";
    ctx.translate(pos.x, pos.y);
}

// Finish drawing and go back to screen space
function stopDrawing(ctx) { ctx.restore(); }


//************************************************************
// Complicated and messy drawing functions

function drawBellPair(ctx) {
    //TODO: fix these stupid Bezier curves
    var c=.5;
    startDrawing(ctx, this.pos);
    ctx.beginPath();
    ctx.strokeStyle="gray";
    ctx.moveTo(0, 0); ctx.bezierCurveTo(-c, 0, -c, 2, 0, 2);
    ctx.moveTo(0, 1); ctx.bezierCurveTo(-c, 1, -c, 3, 0, 3);
    ctx.stroke();
    stopDrawing(ctx);

    drawSPS(ctx, this.pos, "red");
    drawSPS(ctx, this.pos.add(0,2), "red");
    drawSPS(ctx, this.pos.add(0,1), "blue");
    drawSPS(ctx, this.pos.add(0,3), "blue");
}


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

function drawFockState(ctx, thepos, color) {
    if (thepos==undefined)(thepos=this.pos);
    if (color==undefined){color="red";}
    startDrawing(ctx, thepos);
    // Photon
    for (var i=0; i < this.n; ++i) {
        ctx.beginPath();
        ctx.arc(-i*.2, 0, .1, 0, 2*Math.PI, false);
        ctx.fillStyle = color;
        ctx.fill();
    }

    // Arrow
    ctx.strokeStyle=color; ctx.lineWidth=.05;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(1, 0); 
    ctx.moveTo(.7, -.1);
    ctx.lineTo(1, 0); ctx.lineTo(.7, .1);
    ctx.stroke();
    stopDrawing(ctx);
}



function drawDeleter(ctx) {
    for (var i=0; i < this.collisions.length; ++i) {
       var c=this.collisions[i]; 
       var center=c.pos.addVec(c.dimensions.multiply(.5));
       drawCross(ctx, center);     
       ctx.strokeStyle="red";
       this.request.draw(ctx);
    }
}

function drawCross(ctx, center) {
    startDrawing(ctx, center);
    ctx.beginPath();
    ctx.lineWidth=.1;
    ctx.strokeStyle="red";
    var s=0.2;
    ctx.moveTo(-s, -s);
    ctx.lineTo(s, s); 
    ctx.moveTo(-s, s);
    ctx.lineTo(s, -s); 
    ctx.stroke();
    stopDrawing(ctx);
}

function drawPhaseShifter(ctx) {
    startDrawing(ctx, this.pos);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(1, 0); 
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(.5, 0, .1, 0, 2*Math.PI, false);
    ctx.fillStyle = 'white';
    ctx.fill();

    var l=.3;
    var x=Math.sin(this.phase)*l;
    var y=-Math.cos(this.phase)*l;
    ctx.moveTo(.5-x, -y);
    ctx.lineTo(.5+x, y);

    ctx.lineTo(.5+x*.8-y*.1, y*.8+x*.1);
    ctx.moveTo(.5+x, y);
    ctx.lineTo(.5+x*.8+y*.1, y*.8-x*.1);

    ctx.stroke();
    drawLabel(ctx, this, -0.5);
    stopDrawing(ctx);
}

function drawHerald(ctx) {
    startDrawing(ctx, this.pos);
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(1,0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(1, 0, .2, 3*Math.PI/2, Math.PI/2, false);
    ctx.fillStyle = "green";
    ctx.fill();
    
    // TODO: this is a hack
    if (circuit.topLeft){
        if (simulator.highlightedPattern.indexOf(this.relPos().y)!=-1){
            ctx.beginPath();
            ctx.fillStyle = "red";
            ctx.strokeStyle = "white";
            ctx.arc(1.2, 0, .08, 0, 2*Math.PI, false);
            ctx.fill();
            ctx.stroke();
        }
    }

    stopDrawing(ctx);
}


function drawDetector(ctx) {
    startDrawing(ctx, this.pos);
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(1,0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(1, 0, .2, 3*Math.PI/2, Math.PI/2, false);
    ctx.fillStyle = "black";
    ctx.fill();
    
    //TODO: this is a hack
    var ox = 0;
    for (var i=0; i < simulator.highlightedPattern.length; ++i) {
       if (simulator.highlightedPattern[i]==this.relPos().y) {
        ctx.beginPath();
        ctx.fillStyle = "red";
        ctx.strokeStyle = "white";
        ctx.arc(1.2+ox, 0, .08, 0, 2*Math.PI, false);
        ox+=0.2
        ctx.fill();
        ctx.stroke();
       }
    }

    stopDrawing(ctx);
}

function drawHighlightedPattern(ctx){
    startDrawing(ctx, circuit.topLeft);
    for (var mode=0; mode < circuit.nmodes+1; mode++) {
        var ox = 0;
        for (var i=0; i < simulator.highlightedPattern.length; ++i) {
            if (mode == simulator.highlightedPattern[i]){
                ctx.beginPath();
                ctx.fillStyle = "red";
                ctx.strokeStyle = "white";
                ctx.arc(circuit.dimensions.x+ox, mode, .12, 0, 2*Math.PI, false);
                ox+=0.2
                ctx.fill();
                ctx.stroke();
            }
       }
    }
    stopDrawing(ctx);
}

function drawLabel(ctx, thing, yoff) {
    fastNumber(ctx, thing.index, 0.5, yoff);
}


function drawCoupler(ctx) {
    var gap=0.1*(1-this.ratio);
    var couplingLength=this.ratio/2;
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
    drawLabel(ctx, this, 0.25);
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

    drawLabel(ctx, this, 0.25);
    stopDrawing(ctx);
}

////////////////////////
function drawKnob(ctx, pos) {
    startDrawing(ctx, pos);
    ctx.beginPath();
    ctx.strokeStyle="blue";
    ctx.beginPath();
    ctx.arc(0, 0, .2, 0, 2*Math.PI, false);
    ctx.stroke();
    stopDrawing(ctx);
}

