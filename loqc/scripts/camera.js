/*
   pete.shadbolt@gmail.com
   Keeps track of the position of the camera. The camera's position is defined relative to the WORLD, not the SCREEN
*/

function Camera()
{
    var self=this;
    self.x=0; self.y=0;
    self.z=.55; self.tz=.55;
    self.ox=0; self.oy=0;

    self.translate = function (delta) {
        self.x+=delta.x; 
        self.y+=delta.y;
    }

    self.zoom = function (dz) {
        self.tz+=dz;
        if (self.tz<.1) {self.tz=.1};
        if (self.tz>5) {self.tz=5};
    }

    self.center = function (canvas) {
        self.ox=canvas.width/2;
        self.oy=canvas.height/2;
    }

    // Map a context to the world space
    self.contextToWorld = function (ctx) {
        ctx.translate(self.x+self.ox, self.y+self.oy);
        ctx.scale(self.z, self.z);
    }

    // Mapping between the screen and the world
    self.fromScreen = function(screenPos) {
        return {
            "x": (screenPos.x - self.ox - self.x)/self.z,
            "y": (screenPos.y - self.oy - self.y)/self.z
        }
    }

    // Alias the above function
    self.toWorld=self.fromScreen; 

    // Check to see whether we need to do a smooth zoom
    self.loop = function () {
        setInterval(self.update, 33);
    }

    // For smooth zooming and targeting
    self.update = function () {
        if (Math.abs(self.z-self.tz)>.01) {
            // Store the position of the mouse
            var temp1 = self.fromScreen(mouse.screenPos);
            self.z+=(self.tz-self.z)*.4
            //That position should not change after the zoom
            var temp2 = self.fromScreen(mouse.screenPos);
            self.x+=(temp2.x-temp1.x)*self.z;
            self.y+=(temp2.y-temp1.y)*self.z;
            requestAnimationFrame(redraw);
        }
    }
}

