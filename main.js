var target;
var camera;

// Do this instead:
//http://phrogz.net/tmp/canvas_zoom_to_cursor.html

// Run on startup
window.onload=main;

function resize() {
    gc.width  = Math.floor(window.innerWidth-20);
    gc.height = Math.floor(window.innerHeight-80);
    redraw();
}

function redraw() {
    gd.clearRect(0, 0, gc.width ,gc.height);
    draw_grid();
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
    gc.addEventListener("mousewheel", mouseScroll, false);
    gc.addEventListener('DOMMouseScroll', mouseScroll, false);

    camera = {"x":0, "y":0, "z":.5};
    console.log('ready 2 go');
    resize();
}


// Dumping ground
// Bind window resize events 
//$(window).resize(fillScreen);
// Load the json
//$.getJSON('geometry', onGeometry); }
