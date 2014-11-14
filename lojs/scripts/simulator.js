/*
   pete.shadbolt@gmail.com
   Communicates with the server-side simulator and renders the output.
*/


function Simulator(myCircuit) {
    var self = this;
    self.circuit = myCircuit;
    self.highlightedPattern = [];
    self.outputField = document.getElementById('simulator_output');
    self.spinner = document.getElementById('spinner');

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
        self.spinner.setAttribute("style", "display:;");
        xhr.open("POST","/simulate",true);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.send(JSON.stringify(request));
    }

    // Higlight a particular pattern
    self.highlight = function (pattern) {
        self.highlightedPattern = pattern;
        renderer.needFrame();
    }

    // Display the probabilities (or amplitudes) on the screen
    self.display = function(response) {
        self.spinner.setAttribute("style", "display:none;");
        self.outputField.innerHTML="";
        if (response.warning){
            self.outputField.innerHTML = "[no output]";
            return;
        }
        var probabilities=response.probabilities;
        var lines="";
        for (var i=0; i<probabilities.length; ++i) {
            var p=probabilities[i]
            c = p[1]==0 ? "gray" : "white";
            lines += "<li class=state_term ";
            lines += "style=\"color:"+c+"\" ";
            lines +="onmouseover = \"javascript:simulator.highlight(["+p[0]+"])\"> ";
            lines +="|"+ p[0] + "&gt; -  " + p[1].toFixed(4) + "\n";
            var magnitude=(100*p[1]/response.maximum).toFixed(0);
            lines += "<hr width="+magnitude+"% />\n";
        }
        self.outputField.innerHTML += lines;
    }
}

