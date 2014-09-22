function Camera()
{
    var self=this;
    self.x=30; self.y=30;
    self.z=.1; self.tz=.5;

    self.translate = function (dx, dy) {
        self.x+=dx; self.y+=dy;
    }

    self.zoom = function (dz) {
        self.tz+=dz;
        if (self.tz<.1) {self.tz=.1};
        if (self.tz>5) {self.tz=5};
    }

    self.update = function () {
        if (Math.abs(self.z-self.tz)>.01) {
            self.z+=(self.tz-self.z)*.4
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

