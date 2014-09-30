/*
   pete.shadbolt@gmail.com
   Keeps track of the mouse position in various reference frames, and handles events.
   TODO: Pretty hacky at the moment!
*/


function Mouse() {
    var self = this;
    var pressed = false;
    var wasClick = false;
    var screenPos = {"x":0, "y":0};
    var screenPosOld = {"x":0, "y":0};
    var screenDelta = {"x":0, "y":0};
    var worldPos = {"x":0, "y":0};

    self.update = function (evt) {
        self.screenPosOld.x=self.screenPos.x; self.screenPosOld.y=self.screenPos.y;
        self.screenPos.x = evt.offsetX || (evt.pageX - gc.offsetLeft)-7;
        self.screenPos.y = evt.offsetY || (evt.pageY - canvas.offsetTop)-7;
        self.screenDelta.x = self.screenPos.x - self.screenPosOld.x;
        self.screenDelta.y = self.screenPos.y - self.screenPosOld.y;
        self.worldPos = camera.fromScreen(self.screenPos);
    }

    self.bind = function (evt) {
        gc.addEventListener("mousemove", self.onMove);
        gc.addEventListener("mousedown", self.onDown);
        gc.addEventListener("mouseup", self.onUp);
        gc.addEventListener("mousewheel", self.onScroll, false);
        gc.addEventListener('DOMMouseScroll', self.onScroll, false);
    }

    self.onMove = function (evt) {
        self.update(evt);
        editor.update();
        if (self.pressed){
            camera.translate(mouse.dx, mouse.dy);
            requestAnimationFrame(redraw);
            if (Math.abs(self.screenDelta.x)>1 || Math.abs(self.screenDelta.y)>1){self.wasClick=false;}
        }
    }

    self.onDown = function (evt) {
        self.update(evt);
        self.wasClick=true;
        self..pressed=true;
    }

    self.onUp = function (evt) {
        self.update(evt);
        self.pressed=false;
        if (self.wasClick) {editor.click(mouse.ax, mouse.ay);}
    }

    self.onScroll = function (evt) {
        self.update(evt);
        var delta = -evt.detail;
        camera.zoom(delta*.05);
        requestAnimationFrame(redraw);
        return false;
    }
}


