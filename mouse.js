var mouse = {"button":false, 
    "x":0, "y":0, 
    "xo":0, "yo":0, 
    "dx":0, "dy":0, 
    "cx":0, "cy":0, 
    "dcx":0, "dcy":0,}

function fixMouse(evt) {
    mouse.xo = mouse.x; mouse.yo=mouse.y;
    mouse.x = evt.offsetX || (evt.pageX - canvas.offsetLeft);
    mouse.y = evt.offsetY || (evt.pageY - canvas.offsetLeft);
    mouse.dx=mouse.x-mouse.xo;
    mouse.dy=mouse.y-mouse.yo;
    var pt1 = gd.transformedPoint(mouse.x, mouse.y);
    var pt2 = gd.transformedPoint(mouse.xo, mouse.yo);
    mouse.cx = pt1.x; mouse.cy = pt1.cy;
    mouse.dcx = pt2.x - pt1.x; mouse.dcy = pt2.y - pt1.y;
}

function mouseDown(evt) {
    fixMouse(evt);
    mouse.button=true;
}

function mouseMove(evt) {
    fixMouse(evt);
    if (mouse.button){
        gc.translate(mouse.dcx, mouse.dcy);
        requestAnimationFrame(redraw);
    }
}

function mouseUp(evt) {
    fixMouse(evt);
    mouse.button=false;
}

function mouseScroll(evt){
    var delta = evt.wheelDelta ? evt.wheelDelta/40 : evt.detail ? -evt.detail : 0;
    delta = delta > 0 ? .01 : -.01;
    console.log(delta);
    camera.z+=delta;
    requestAnimationFrame(redraw);
}
