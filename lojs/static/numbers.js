var gNumberCache = [];
var ndx = 20;
var ndy = 15;

function makeNumberCache() {
    gNumberCache = document.createElement('canvas');
    gNumberCache.width = 600;
    gNumberCache.height = ndy;
    ctx = gNumberCache.getContext('2d');

    //ctx.fillStyle = "#ff0000";
    //ctx.fillRect(0,0,600,ndy);

    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black';
    ctx.font=14+'px sans';
    for (var i=0; i < 30; ++i) {
        ctx.fillText(i, (i+.5)*ndx, 0);
    }
}

function fastNumber(ctx, number, x, y) {
    if(camera.z<35){return}
    var ox = .5*ndx/camera.z;
    var oy = .5*ndy/camera.z;
    ctx.drawImage(gNumberCache, ndx*number, 0, ndx, ndy, x-ox, y-oy, ndx/camera.z, ndy/camera.z);
}


