/*
    pete.shadbolt@gmail.com
    A really fucking simple vector class
*/

function Vector(x, y) {
    this.x = x;
    this.y = y;

    this.set=function(a, b) {
        if (b!=undefined){
            this.x=a; this.y=b;
        } else {
            this.x=a.x; this.y=a.y;
        }
    }

    this.inc=function(a, b) {
        if (b!=undefined){
            this.x+=a; this.y+=b;
        } else {
            this.x+=a.x;
            this.y+=a.y;
        }
    }

    this.equ=function (v) {
        return this.x==v.x && this.y==v.y;
    }

    this.copy=function () {
        return new Vector(this.x, this.y);
    }

    this.multiply=function (factor) {
        return new Vector(this.x*factor, this.y*factor);
    }

    this.add=function (a, b) {
        return new Vector(this.x+a, this.y+b);
    }

    this.addVec=function (a) {
        return new Vector(this.x+a.x, this.y+a.y);
    }

    this.sub=function (a, b) {
        if (b!=undefined){
            return new Vector(this.x-a, this.y-b);
        } else {
            return new Vector(this.x-a.x, this.y-a.y);
        }
    }

}
