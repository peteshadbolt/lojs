/*
   pete.shadbolt@gmail.com
   Comminicates with the server-side simulator and renders the output
*/


function Simulator(myCircuit) {
    var self=this;
    self.circuit=myCircuit;
    self.outputField=document.getElementById('simulator_output');
    self.state = {"0":1};
    self.patterns = [];

    // Set patterns of interest to all p-photon permutations
    self.autoPattern = function () {
        self.patterns=[]
        for (var i=0; i <= circuit.nmodes; ++i) {
            self.patterns.push([i]);
        }
    }

    // The circuit changed, we need to ask for new data
    self.update = function() {

        // If the circuit is empty, do nothing
        if (circuit.components.length==0){
            self.outputField.innerHTML = "<li>[no circuit]";
            return; 
        }

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
        for (var key in response) {
            var line = "<li> |"+ key + "&gt; -  " + response[key] + "\n";
            self.outputField.innerHTML += line;
        }
    }
}
