/*
   pete.shadbolt@gmail.com
   Comminicates with the server-side simulator and renders the output
*/


function Simulator(myCircuit) {
    var self=this;
    self.circuit=myCircuit;

    self.update = function() {
        var postData=self.circuit.toJSON();
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange=function() {
            if (xhr.readyState==4 && xhr.status==200) {
                var responseObj=JSON.parse(xhr.responseText);
                var probabilities=responseObj.probabilities;
                console.log(probabilities); }
        }

        xhr.open("POST","/",true);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.send(postData);
    }
}
