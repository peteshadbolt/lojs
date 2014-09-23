/*
   pete.shadbolt@gmail.com
   Keeps track of the mouse position in various reference frames, and handles events.
   TODO: Pretty hacky at the moment!
*/

var mouse = { "pressed": false, "wasclick": false,
    "x":0, "y":0, "xo":0, "yo":0, "dx":0, "dy":0, 
    "cx":0, "cy":0, "ax":0, "ay":0, "oax":0, "oay":0,
    "dcx":0, "dcy":0,}

function fixMouse(evt) {
    mouse.xo = mouse.x; mouse.yo=mouse.y;
    mouse.x = evt.offsetX || (evt.pageX - canvas.offsetLeft)-7;
    mouse.y = evt.offsetY || (evt.pageY - canvas.offsetLeft)-7;
    mouse.dx=mouse.x-mouse.xo; mouse.dy=mouse.y-mouse.yo;
    var pos = camera.fromScreen(mouse.x, mouse.y);
    mouse.oax=mouse.ax; mouse.oay=mouse.ay;
    mouse.ax=Math.floor(pos.x/gridSize);
    mouse.ay=Math.floor(pos.y/gridSize);

    // Need to redraw if the target square moved
    if (mouse.ax!=mouse.oax || mouse.ay!=mouse.oay) { 
        requestAnimationFrame(redraw);
    }
}

function bindMouse() {
    gc.addEventListener("mousemove", mouseMove);
    gc.addEventListener("mousedown", mouseDown);
    gc.addEventListener("mouseup", mouseUp);
    gc.addEventListener("mousewheel", mouseScroll, false);
    gc.addEventListener('DOMMouseScroll', mouseScroll, false);
}

function mouseMove(evt) {
    fixMouse(evt);
    if (mouse.pressed){
        camera.translate(mouse.dx, mouse.dy);
        requestAnimationFrame(redraw);
        if (Math.abs(mouse.dx)>1 || Math.abs(mouse.dy)>1){ mouse.wasclick=false;}
    }
}

function mouseDown(evt) {
    fixMouse(evt);
    mouse.wasclick=true;
    mouse.pressed=true;
}

function mouseUp(evt) {
    fixMouse(evt);
    mouse.pressed=false;
    if (mouse.wasclick)
    {
        editor.hit(mouse.ax, mouse.ay);
    }
}

function mouseScroll(evt){
    if (true) {
        var delta = -evt.detail;
        camera.zoom(delta*.05);
        requestAnimationFrame(redraw);
    }
    return false;
}

