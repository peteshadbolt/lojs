function draw_grid() {
    var gs=40*camera.z;
    var ox = camera.x % gs;
    var oy = camera.y % gs;
    var nx = Math.ceil(gc.width/gs);
    var ny = Math.ceil(gc.height/gs);

    gd.strokeStyle= '#dddddd';
    gd.strokeWidth=1;
    gd.beginPath();
    
    for (var i=0; i<nx; i++) { 
        gd.moveTo(Math.floor(i*gs+ox), 0); 
        gd.lineTo(Math.floor(i*gs+ox), gc.height); 
    }

    for (var i=0; i<ny; i++) {
        gd.moveTo(0, Math.floor(i*gs+oy)); 
        gd.lineTo(gc.width, Math.floor(i*gs+oy)); 
    }

    gd.stroke();
}

