var gNumberCache = undefined;
var gCouplerCache = undefined;
var ndx = 20;
var ndy = 15;

function makeNumberCache() {
    gNumberCache = document.createElement('canvas');
    gNumberCache.width = 600;
    gNumberCache.height = ndy;
    ctx = gNumberCache.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black';
    ctx.font=14+'px sans';
    for (var i=0; i < 30; ++i) {
        ctx.fillText(i, (i+.5)*ndx, 0);
    }
}


function fastNumber(ctx, number, x, y) {
    var ox = .5*ndx/camera.z;
    var oy = .5*ndy/camera.z;
    ctx.drawImage(gNumberCache, ndx*number, 0, ndx, ndy, x-ox, y-oy, ndx/camera.z, ndy/camera.z);
}


//function makeCouplerCache() {
    //gCouplerCache = document.createElement('canvas');
    //gCouplerCache.width = camera.z;
    //gCouplerCache.height = camera.z;
    //ctx = gCouplerCache.getContext('2d');
    //ctx.scale(camera.z, camera.z);
    //ctx.lineWidth=1/camera.z;
    //ctx.strokeStyle="black";
    //c=new Coupler(0,0,.5);
    //c.draw(ctx);
    //ctx.restore();
//}

