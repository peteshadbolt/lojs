/*
   pete.shadbolt@gmail.com
   This is the main JS file which runs the editor/simulator
*/

var gc, gd;
var camera, grid, circuit, mouse, editor;

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
    camera.contextToWorld(gd);

    // Draw the grid, circuit, editor
    grid.draw(gd);
    editor.draw(gd);
    circuit.draw(gd);

    // Back to screen-space
    gd.restore();
}

function main() {
    // Set up the drawing environment and fit to window
    gc=document.getElementById('canvas');
    gd=gc.getContext('2d');

    // Create a grid, camera, and mouse
    grid=new Grid();
    camera=new Camera();
    mouse=new Mouse();
    mouse.bind(gd);

    // Create the circuit, simulator, and editor
    circuit = new Circuit();
    simulator = new Simulator(circuit);
    editor=new Editor(circuit, simulator);

    // Away we go
    window.onresize=resize;
    resize();
    camera.center(gc);
    camera.loop();
    requestAnimationFrame(redraw);
}
