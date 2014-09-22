function Editor(targetCircuit)
{
    var self = this;

    self.mode = "nothing";
    self.circuit=targetCircuit;

    self.hit = function (x, y) {
        if (self.circuit.empty(x, y)) 
        {
            self.circuit.addDC(x, y, .5);
            circuit.decorate();
            redraw();
        } else 
        {
            self.circuit.kill(x, y);
            circuit.decorate();
            redraw();
        }
    }

    self.draw = function (ctx) {
        //
    }

}

