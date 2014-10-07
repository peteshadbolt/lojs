/*
   pete.shadbolt@gmail.com
   Communicates with the server-side simulator and renders the output.
*/

function Simulator(myCircuit) {
    var self = this;
    self.circuit = myCircuit;
    self.outputField = document.getElementById('simulator_output');

    // The circuit changed, we need to ask for new data
    self.update = function() {
        // Prepare the post data
        var request={};
        request.circuit=self.circuit.toJSON();

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
    self.display = function(response) {
        self.outputField.innerHTML="";
        var probabilities=response.probabilities;
        var lines="";
        for (var key in probabilities) {
            var magnitude=(100*probabilities[key]/response.maximum).toFixed(0);
            lines += "<li> |"+ key + "&gt; -  " + probabilities[key].toFixed(4) + "\n";
            lines += "<hr width="+magnitude+"% />\n";
            
        }
        self.outputField.innerHTML += lines;
    }
}
