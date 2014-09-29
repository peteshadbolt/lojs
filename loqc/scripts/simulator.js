/*
   pete.shadbolt@gmail.com
   Comminicates with the server-side simulator and renders the output
*/

function Simulator(myCircuit) {
    var self=this;
    self.circuit=myCircuit;

    self.update = function() {
        var postData=self.circuit.toJSON();
        console.log(postData);
    }
}
