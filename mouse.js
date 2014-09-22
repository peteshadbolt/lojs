var mouse = {
    "x":0, "y":0, 
    "xo":0, "yo":0, 
    "dx":0, "dy":0, 
    "cx":0, "cy":0, 
    "ax":0, "ay":0,
    "dcx":0, "dcy":0,}

function fixMouse(evt) {
    mouse.xo = mouse.x; mouse.yo=mouse.y;
    mouse.x = evt.offsetX || (evt.pageX - canvas.offsetLeft)-7;
    mouse.y = evt.offsetY || (evt.pageY - canvas.offsetLeft)-7;
    mouse.dx=mouse.x-mouse.xo;
    mouse.dy=mouse.y-mouse.yo;
    var pos = camera.fromScreen(mouse.x, mouse.y);
    mouse.ax=Math.floor(pos.x/gridSize);
    mouse.ay=Math.floor(pos.y/gridSize);
    //mouse.cx = pt1.x; mouse.cy = pt1.cy;
    //mouse.dcx = pt2.x - pt1.x; mouse.dcy = pt2.y - pt1.y;
}

function bindMouse() {
    gc.addEventListener("click", mouseClick);
    gc.addEventListener("mousemove", mouseMove);
    //gc.addEventListener("mousedown", mouseDown);
    //gc.addEventListener("mouseup", mouseUp);
    gc.addEventListener("mousewheel", mouseScroll, true);
    gc.addEventListener('DOMMouseScroll', mouseScroll, true);
    //gc.addEventListener('dblclick', mouseDblClick, false);
}

function mouseClick(evt) {
    fixMouse(evt);
    editor.hit(mouse.ax, mouse.ay);
}

function mouseMove(evt) {
    fixMouse(evt);
    if (!evt.shiftKey){return}
    requestAnimationFrame(redraw);
    camera.translate(mouse.dx, mouse.dy);
}

function mouseScroll(evt){
    if (evt.shiftKey){
        var delta = -evt.detail;
        camera.zoom(delta*.05);
        requestAnimationFrame(redraw);
    } else {
    }
}

