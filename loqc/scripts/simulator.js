/*
   pete.shadbolt@gmail.com
   Comminicates with the server-side simulator and renders the output
*/


function Simulator(myCircuit) {
    var self=this;
    self.circuit=myCircuit;
    self.outputField=document.getElementById('simulator_output');
    self.patterns = [];

    // Set patterns of interest to all p-photon permutations
    self.autoPattern = function () {
        self.patterns=[]
        for (var i=0; i <= circuit.nmodes; ++i) {
            self.patterns.push([i]);
        }
    }

    // Construct a legible representation of the state
    // TODO: maybe this should go into "circuit"? or into python?
    self.constructState = function () {
        self.state = {};
        var sources=[];
        for (var i=0; i < circuit.components.length; ++i) {
            var c=circuit.components[i];
            if (c.type=="sps"){
                sources.push([[c.pos.y-circuit.topLeft.y] , 1]);
            }
            if (c.type=="bellpair"){
                sources.push([[c.pos.y-circuit.topLeft.y, c.pos.y-circuit.topLeft.y+2] , 1/Math.sqrt(2),
                              [c.pos.y-circuit.topLeft.y+1, c.pos.y-circuit.topLeft.y+3] , 1/Math.sqrt(2)]);
            }
        }
        self.state=sources;
    }

    // The circuit changed, we need to ask for new data
    self.update = function() {

        // If the circuit is empty, do nothing
        if (circuit.components.length==0){
            self.outputField.innerHTML = "<li>[no circuit]";
            return; 
        }

        // For now, just construct that representation of the state and break
        self.constructState();
        console.log(self.state);
        return;

        // For the moment, let's look at all permutations
        self.autoPattern();

        // Prepare the post data
        var request={};
        request.circuit=self.circuit.toJSON();
        request.state=self.state;
        request.patterns=self.patterns;

        // Prepare the request
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange=function() {
            if (xhr.readyState==4 && xhr.status==200) {
                self.display(JSON.parse(xhr.responseText)); }
        }

        // Hit the server
        xhr.open("POST","/simulate",true);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.send(JSON.stringify(request));
    }

    // Display the probabilities (or amplitudes) on the screen
    self.display=function(response) {
        self.outputField.innerHTML="";
        var probabilities=response.probabilities;
        var lines="";
        for (var key in probabilities) {
            //<li>|0,0,0,0&gt;  0.5 <hr width=10% />
            var magnitude=(100*probabilities[key]/response.maximum).toFixed(0);
            //console.log(response.maximum);
            lines += "<li> |"+ key + "&gt; -  " + probabilities[key].toFixed(4) + "\n";
            lines += "<hr width="+magnitude+"% />\n";
            
        }
        self.outputField.innerHTML += lines;
    }
}
