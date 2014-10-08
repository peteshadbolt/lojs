/*
   pete.shadbolt@gmail.com
   Communicates with the server-side simulator and renders the output.
*/


function Simulator(myCircuit) {
    var self = this;
    self.circuit = myCircuit;
    self.outputField = document.getElementById('simulator_output');
    self.debugField = document.getElementById('debug');

    // Generate a plain-text JSON representation of the state, circuit, and detection patterns. 
    self.getGroup = function (groupName) {
        return self.circuit.components.filter(function (x) {return x.group==groupName})
    }

    self.getWaveguides = function () {
        var wgs=self.getGroup("waveguide");
        var json=[];
        for (var i=0; i < wgs.length; ++i) { json.push(wgs[i].json()); }
        return json;
    }   

    // Generate a JSON representation of the state generate by these sources
    self.getState = function () {
        return {};
    }

    // Generate a JSON representation of the set of patterns of interest
    self.getPatterns = function () {
        return [];
    }

    // The circuit changed, we need to ask for new data
    self.update = function() {
        // Prepare the post data
        var request={};
        request.circuit=self.getWaveguides();
        request.state=self.getState();
        request.patterns=self.getPatterns();

        // Fill out the debug field
        self.debugField.innerHTML=JSON.stringify(request.circuit)+"<br/><br/>";
        self.debugField.innerHTML+=JSON.stringify(request.state)+"<br/><br/>";
        self.debugField.innerHTML+=JSON.stringify(request.patterns);

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
        if (response.warning){
            self.outputField.innerHTML = "[no output]";
            return;
        }
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
