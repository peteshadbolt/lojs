var gNumberCache = [];

function makeNumberCache() {
    gNumberCache = document.createElement('canvas');
    cc.width = 600;
    cc.height = 20;
    ctx = cc.getContext('2d');

    ctx.fillStyle = "#ff0000";

    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'black';
    ctx.font=14+'px sans';
    for (var i=0; i < 30; ++i) {
        ctx.fillText(i, i*20, 0);
    }
}

function fastNumber(ctx, number, x, y) {
    ctx.drawImage(gNumberCache, x, y);
}


