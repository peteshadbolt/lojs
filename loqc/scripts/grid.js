/*
   pete.shadbolt@gmail.com
   Draws the grid where bits and pieces of the circuit live
*/

function drawGrid(ctx) {
    // Figure out the boundaries
    var topLeft = camera.fromScreen(0,0);
    var bottomRight = camera.fromScreen(ctx.canvas.width, ctx.canvas.height);
    var nx = Math.ceil((bottomRight.x - topLeft.x)/gridSize)+1;
    var ny = Math.ceil((bottomRight.y - topLeft.y)/gridSize)+1;
    var ox = Math.floor(topLeft.x/gridSize);
    var oy = Math.floor(topLeft.y/gridSize);

    // Draw the grid when we zoom in enough
    if (camera.z>0.5){
        ctx.strokeStyle= "#cccccc";
        ctx.beginPath();
        for (var i=ox; i<ox+nx; i++) { 
            ctx.moveTo(Math.floor(i*gridSize), topLeft.y); 
            ctx.lineTo(Math.floor(i*gridSize), bottomRight.y); 
        }
        for (var i=oy; i<oy+ny; i++) {
            ctx.moveTo(topLeft.x, Math.floor(i*gridSize)); 
            ctx.lineTo(bottomRight.x, Math.floor(i*gridSize)); 
        }
        ctx.stroke();
    }

    // Always draw the origin
    ctx.strokeStyle= '#ffcccc';
    ctx.lineWidth=2/camera.z;
    ctx.beginPath();
    if (topLeft.x<0 && bottomRight.x<<0) {
        ctx.moveTo(0, topLeft.y); 
        ctx.lineTo(0, bottomRight.y); 
    }
    if (topLeft.y<0 && bottomRight.y<<0) {
        ctx.moveTo(topLeft.x, 0); 
        ctx.lineTo(bottomRight.x, 0); 
    }
    ctx.stroke();
    ctx.lineWidth=1;

}

