/*
   pete.shadbolt@gmail.com
   This is the main JS file which runs the constructor/simulator
*/

var gc, gd;
var camera, renderer, grid, circuit, mouse, adjuster, constructor, editor;

// Run on startup
window.onload=main;

function Renderer(ctx, canv) {
   var self=this; 
   self.ctx=ctx;
   self.canvas=canv;
   self.change=false;

   self.loop=function () {
        setInterval(self.redraw, 17);
   }

   self.requestDraw=function () {
       requestAnimationFrame(self.redraw);
   }

   self.redraw= function () {
        if (!self.change){return;}
        self.change=false;

        // Clear canvas
        self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);

        // Transform into camera-space
        self.ctx.save();
        camera.contextToWorld(self.ctx);

        // Draw the grid, circuit, constructor
        grid.draw(self.ctx);
        editor.draw(self.ctx);
        circuit.draw(self.ctx);

        // Back to screen-space
        self.ctx.restore();
    }

    self.needFrame=function () {
        self.change=true;
    }

}

function resize() {
    gc.width  = Math.floor(window.innerWidth);
    gc.height = Math.floor(window.innerHeight);
    renderer.needFrame();
}

function construct() {
    document.getElementById("construct").className="hi";
    document.getElementById("adjust").className="nothing";
    editor=constructor;
    console.log("Now in CONSTRUCT mode");
    renderer.needFrame();
}

function adjust() {
    document.getElementById("adjust").className="hi";
    document.getElementById("construct").className="nothing";
    editor=adjuster;
    console.log("Now in ADJUST mode");
    renderer.needFrame();
}

// Change mode by pressing keys
function bindKeys() {
    window.addEventListener('keydown', function (evt) {
        if (evt.keyCode == 9) {
           if (editor.label=="constructor"){ adjust(); } else { construct(); }
           evt.preventDefault();
           return false;
        }
    }, true);
}

function main() {
    // Set up the drawing environment an-d fit to window
    gc=document.getElementById('canvas');
    gd=gc.getContext('2d');

    // Create a grid, camera, and mouse
    grid=new Grid();
    camera=new Camera();
    mouse=new Mouse();
    renderer=new Renderer(gd, gc);
    mouse.bind(gd);
    bindKeys();

    // Create the circuit, simulator, and constructor
    circuit = new Circuit();
    simulator = new Simulator(circuit);
    constructor = new Constructor(circuit);
    adjuster = new Adjuster(circuit);
    construct();

    // Away we go
    window.onresize=resize;
    resize();
    camera.center(gc);
    camera.loop();
    renderer.loop();
}
