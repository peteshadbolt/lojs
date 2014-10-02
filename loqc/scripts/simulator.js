/*
   pete.shadbolt@gmail.com
   Comminicates with the server-side simulator and renders the output
*/


function Simulator(myCircuit) {
    var self=this;
    self.circuit=myCircuit;
    self.outputField=document.getElementById('simulator_output');

    self.update = function() {
        var postData={};
        postData.circuit=self.circuit.toJSON();
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange=function() {
            if (xhr.readyState==4 && xhr.status==200) {
                var responseObj=JSON.parse(xhr.responseText);
                var probabilities=responseObj.probabilities;
                self.output(probabilities);
            }
        }
        xhr.open("POST","/",true);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.send(JSON.stringify(postData));
    }

    self.output=function(simulatorOutput) {
        self.outputField.innerHTML="";
        for (var i=0; i<simulatorOutput.length; ++i) {
            self.outputField.innerHTML += "<li> "+simulatorOutput[i];
        }
    }
}
