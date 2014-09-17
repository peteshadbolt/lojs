
var target;
var camera;
var mouseButton=false;
var mouseX; var mouseY;

// Run on startup
window.onload=main;

function resize() {
    gc.width  = window.innerWidth*0.98;
    gc.height = window.innerHeight*0.92;
    redraw();
}

function draw_grid() {
    var gs=40;
    var ox = camera.x % gs;
    var oy = camera.y % gs;
    var nx = Math.ceil(gc.width/gs);
    var ny = Math.ceil(gc.height/gs);

    gd.strokeStyle= '#cccccc';
    gd.strokeWidth=.1;
    gd.beginPath();
    
    for (var i=0; i<nx; i++) { 
        gd.moveTo(i*gs+ox, 0); 
        gd.lineTo(i*gs+ox, gc.height); 
    }

    for (var i=0; i<ny; i++) {
        gd.moveTo(0, i*gs+oy); 
        gd.lineTo(gc.width, i*gs+oy); 
    }

    gd.stroke();
}

function redraw() {
    gd.clearRect(0, 0, gc.width ,gc.height);
    draw_grid();
}

function fixMouse(evt) {
    mouseX=evt.layerX-gc.offsetLeft;
    mouseY=evt.layerY-gc.offsetTop;
}

function mouseDown(evt) {
    fixMouse(evt);
    mouseButton=true;
}

function mouseMove(evt) {
    fixMouse(evt);
    if (mouseButton){
        console.log(mouseX, mouseY);
        camera.x=mouseX;
        camera.y=mouseY;
        redraw();
    }
}

function mouseUp(evt) {
    fixMouse(evt);
    mouseButton=false;
}


function main() {
    // Set up the drawing environment
    gc=document.getElementById('canvas');
    gd=gc.getContext('2d');
    

    // Bind a bunch of events
    window.onresize=resize;
    gc.addEventListener("mousedown", mouseDown);
    gc.addEventListener("mousemove", mouseMove);
    gc.addEventListener("mouseup", mouseUp);

    camera = {"x":0, "y":0, "z":1};
    console.log('ready 2 go');
    resize();
}


// Dumping ground
// Bind window resize events 
//$(window).resize(fillScreen);
// Load the json
//$.getJSON('geometry', onGeometry); }
