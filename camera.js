function Camera()
{
    var self=this;
    self.x=0; self.y=0;
    self.z=.5; self.tz=.5;

    self.translate = function (dx, dy) {
        self.x+=dx; self.y+=dy;
    }

    self.zoom = function (dz) {
        self.tz+=dz;
        if (self.tz<.1) {self.tz=.1};
        if (self.tz>5) {self.tz=5};
    }
    
    self.center = function (canvas) {
        self.x=canvas.width/2; 
        self.y=canvas.height/2; 
        requestAnimationFrame(redraw);
    }

    self.update = function () {
        // Store the position of the mouse
        //self.x+=1;
        if (Math.abs(self.z-self.tz)>.01) {
            var temp1 = self.fromScreen(mouse.x, mouse.y);
            self.z+=(self.tz-self.z)*.4
            // That position should not change after the zoom
            var temp2 = self.fromScreen(mouse.x, mouse.y);
            self.x+=(temp2.x-temp1.x)*self.z;
            self.y+=(temp2.y-temp1.y)*self.z;
            requestAnimationFrame(redraw);
        }
    }

    // Todo
    self.fromScreen = function(x, y) {
        return {"x": (x-self.x)/self.z, "y": (y-self.y)/self.z}
    }

    self.toScreen = function(x, y) {
        return {"x": x*self.z+self.x, "y": y*self.z+self.y}
    }
}

