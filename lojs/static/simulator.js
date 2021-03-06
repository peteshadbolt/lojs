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
    self.ready=true;
    self.outputMode = "probability";

    // The circuit changed, we need to ask for new data
    self.update = function() {
        if(!self.ready){return;}
        self.ready=false;

        // Prepare the post data
        var request={};
        request.circuit=self.circuit.toJSON();
        request.rules=$('#filter_input').val();
        request.output_mode=self.outputMode;

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

    self.setMode = function(newmode) {
        self.outputMode = newmode;
        document.getElementById("probability").className="nothing";
        document.getElementById("amplitude").className="nothing";
        document.getElementById(newmode).className="hi";
        self.update();
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
        self.ready=true;
        if (response.warning){
            self.outputField.innerHTML = response.warning;
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
            lines +="|"+ p[0] + "&gt; -  " + p[1].toFixed(6) + "\n";
            var magnitude=(100*p[1]/response.maximum).toFixed(0);
            lines += "<hr width="+magnitude+"% />\n";
        }

        self.highlightedPattern = probabilities[0][0];

        self.outputField.innerHTML += lines;
        renderer.needFrame();

    }
}

