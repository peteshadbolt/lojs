/*
   pete.shadbolt@gmail.com
   Draws the grid where bits and pieces of the circuit live
*/

function Grid() {
    var self=this;
    self.size=100;
    self.draw=function (ctx) {
        // Figure out the boundaries
        var topLeft = camera.fromScreen({"x":0,"y":0});
        var bottomRight = camera.fromScreen({"x":ctx.canvas.width, "y":ctx.canvas.height});

        var nx = Math.ceil((bottomRight.x - topLeft.x)/self.size)+1;
        var ny = Math.ceil((bottomRight.y - topLeft.y)/self.size)+1;
        var ox = Math.floor(topLeft.x/self.size);
        var oy = Math.floor(topLeft.y/self.size);

        // Draw the grid when we zoom in enough
        if (camera.z>0.5){
            ctx.strokeStyle= "#cccccc";
            ctx.beginPath();
            for (var i=ox; i<ox+nx; i++) { 
                ctx.moveTo(Math.floor(i*self.size), topLeft.y); 
                ctx.lineTo(Math.floor(i*self.size), bottomRight.y); 
            }
            for (var i=oy; i<oy+ny; i++) {
                ctx.moveTo(topLeft.x, Math.floor(i*self.size)); 
                ctx.lineTo(bottomRight.x, Math.floor(i*self.size)); 
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


    // Find the cell containing a point in the world
    self.inside = function (worldPos) {
        return {"x":Math.floor(worldPos.x/self.size), "y":Math.floor(worldPos.y/self.size)}
    }
}

function drawGrid(ctx) {
}

