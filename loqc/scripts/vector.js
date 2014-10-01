/*
    pete.shadbolt@gmail.com
    A really fucking simple vector class
*/

function Vector(x, y) {
    var self=this;
    self.x = x ? x : 0;
    self.y = y ? y : 0;

    self.set=function(a, b) {
        if (b){
            self.x=a; self.y=b;
        } else {
            self.x=a.x; self.y=a.y;
        }
    }

    self.inc=function(a, b) {
        if (b){
            self.x+=a; self.y+=b;
        } else {
            self.x+=a.x;
            self.y+=a.y;
        }
    }

    self.equ=function (v) {
        return self.x==v.x && self.y==v.y;
    }

    self.copy=function () {
        return new Vector(self.x, self.y);
    }

    //self.add=function (a, b) {
        //if (b){
            //return new Vector(self.x+a, self.y+b);
        //} else {
            //return new Vector(self.x+a.x, self.y+a.y);
        //}
    //}

    //self.sub=function (a, b) {
        //if (b){
            //return new Vector(self.x-a, self.y-b);
        //} else {
            //return new Vector(self.x-a.x, self.y-a.y);
        //}
    //}

}
