var target;

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
    bindMouse();

    console.log('ready 2 go');
    resize();
}


// Dumping ground
//$.getJSON('geometry', onGeometry); }
