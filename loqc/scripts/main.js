/*
   pete.shadbolt@gmail.com
   This is the main JS file which runs the editor/simulator
*/

var gc, gd;
var gridSize=100;
var camera;
var circuit;
var editor;

// Run on startup
window.onload=main;

function resize() {
    gc.width  = Math.floor(window.innerWidth);
    gc.height = Math.floor(window.innerHeight);
    redraw();
}

function redraw() {
    // Clear canvas
    gd.clearRect(0, 0, canvas.width, canvas.height);

    // Transform into camera-space
    gd.save();
    gd.translate(camera.x, camera.y);
    gd.scale(camera.z, camera.z);

    // Draw the grid, circuit, editor
    drawGrid(gd);
    circuit.draw(gd);
    editor.draw(gd);

    // Back to screen-space
    gd.restore();
}

function main() {
    // Set up the drawing environment and fit to window
    gc=document.getElementById('canvas');
    gd=gc.getContext('2d');

    // Create a camera object
    camera=new Camera();

    // Bind a bunch of events
    window.onresize=resize;
    bindMouse(gd);

    // Continuously update the camera
    setInterval(camera.update, 33);

    // Create the circuit and a simulator
    circuit = new Circuit();
    simulator = new Simulator(circuit);

    // Create an editor
    editor=new Editor(circuit, simulator);
    editor.bindKeys();

    // Fit to window and redraw
    resize();
    camera.center(gc);
}


// Dumping ground
//$.getJSON('geometry', onGeometry); }

