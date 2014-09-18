var camera = {"x":0, "y":0, "z":.5};

//TODO
function toCam(x,y){
    return {"x": x*zoom-camera.x,  "y": y*zoom-camera.y}
}

//TODO
function fromCam(x,y){
    return {"x": x*zoom-camera.x,  "y": y*zoom-camera.y}
}

