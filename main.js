let canvas, ctx, aquariums, noises,ctxVisuData,history,disque,histo,frame;
let audioContext = null;
let audiometer = null;

onload = () => {

    aquariums = [];
    noises = [];
    history= []; //historique pour la visdu de disque.js
    frame =0;

    canvas  = document.querySelector('canvas');
    ctx     = canvas.getContext('2d');

    canvasHisto = document.getElementById("histo");
    ctxVisuData = canvasHisto.getContext('2d');

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    //Taille du cavas pour les données
    ctxVisuData.width = window.innerWidth;
    ctxVisuData.height = window.innerHeight;

    disque = new Disque (ctxVisuData.width/2,ctxVisuData.height/2,200,10,10);
    histo = new Histogram(ctxVisuData.width/2,ctxVisuData.height/2,50,60)

    let num_rows = 3;
    let num_cols = 3;

    let space = 30;

    for(let i = 0; i < num_rows; i++) {

        for(let j = 0; j < num_cols; j++) {

            let aquarium_width = (canvas.width / num_cols) - space;
            let aquarium_height = (canvas.height / num_rows) - space;

            let aquarium = new Aquarium(
                space / 2 + (space + aquarium_width) * j, 
                space / 2 + (space + aquarium_height) * i, 
                aquarium_width, 
                aquarium_height
            );

            if(i != 1 || j != 1)
                aquarium.addBoids(
                    Array(15)
                    .fill()
                    .map(
                        b => new Boid(
                            Math.random() * aquarium.width + aquarium.pos.x,
                            Math.random() * aquarium.height + aquarium.pos.y,
                            aquarium
                        )
                    )
                );

            aquariums.push(aquarium);

        }
    }

    


    ctx.font = "15px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "hanging";

}

function onMicrophoneDenied() {
    alert('Stream generation failed.');
}

var mediaStreamSource = null;

function onMicrophoneGranted(stream) {
    // Create an AudioNode from the stream.
    mediaStreamSource = audioContext.createMediaStreamSource(stream);

    // Create a new volume meter and connect it.
    meter = createAudioMeter(audioContext);
    mediaStreamSource.connect(meter);

    // kick off updating
    update();
}

function processAudioChunk( time ) {

    // check if we're currently clipping
    //if (meter.checkClipping())
    // SEUIL DEPASSE
    //else
    // SOUS LE SEUIL

    noises.push(new Noise(meter.volume, canvas.width / 2, canvas.height / 2));
    history.push(meter.volume); // on récupere le volume
    histo.update(meter.volume);
    //console.log(meter.volume);
}

onclick = (e) => {

    /*if(e.button == 0){
        let noise = new Noise(e.pageX, e.pageY);
        noises.push(noise);
        histo.update(10);
        //disque.addRing(noise);
    }
    */
    if(audioContext == null) {

        // monkeypatch Web Audio
        window.AudioContext = window.AudioContext || window.webkitAudioContext;

        // grab an audio context
        audioContext = new AudioContext();
        audioContext.resume();

        // Attempt to get audio input
        try {


            var constraints = {
                "audio": {
                    "mandatory": {
                        "googEchoCancellation": "false",
                        "googAutoGainControl": "false",
                        "googNoiseSuppression": "false",
                        "googHighpassFilter": "false"
                    },
                    "optional": []
                },
            }; 

            navigator.mediaDevices.getUserMedia(constraints)
                .then(onMicrophoneGranted)
                .catch(function(err) { console.log(err.name + ": " + err.message); });

        } catch (e) {
            console.log(err.name + ": " + err.message);
        }

    }

    noises.push(new Noise(0.05, e.pageX, e.pageY));

}

oncontextmenu = (e) => {
    e.preventDefault();
}

function createAudioMeter(audioContext,clipLevel,averaging,clipLag) {
    var processor = audioContext.createScriptProcessor(512);
    processor.onaudioprocess = volumeAudioProcess;
    processor.clipping = false;
    processor.lastClip = 0;
    processor.volume = 0;
    processor.clipLevel = clipLevel || 0.98;
    processor.averaging = averaging || 0.95;
    processor.clipLag = clipLag || 750;

    // this will have no effect, since we don't copy the input to the output,
    // but works around a current Chrome bug.
    processor.connect(audioContext.destination);

    processor.checkClipping =
        function(){
        if (!this.clipping)
            return false;
        if ((this.lastClip + this.clipLag) < window.performance.now())
            this.clipping = false;
        return this.clipping;
    };

    processor.shutdown =
        function(){
        this.disconnect();
        this.onaudioprocess = null;
    };

    return processor;
}

function volumeAudioProcess( event ) {
    var buf = event.inputBuffer.getChannelData(0);
    var bufLength = buf.length;
    var sum = 0;
    var x;

    // Do a root-mean-square on the samples: sum up the squares...
    for (var i=0; i<bufLength; i++) {
        x = buf[i];
        if (Math.abs(x)>=this.clipLevel) {
            this.clipping = true;
            this.lastClip = window.performance.now();
        }
        sum += x * x;
    }

    // ... then take the square root of the sum.
    var rms =  Math.sqrt(sum / bufLength);

    // Now smooth this out with the averaging factor applied
    // to the previous sample - take the max here because we
    // want "fast attack, slow release."
    this.volume = Math.max(rms, this.volume*this.averaging);
}


const update = () => {

    processAudioChunk();

    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    disqueVisu();

    
    
    for(let aquarium of aquariums) {
        aquarium.update(noises);
        aquarium.render();
    }

    histo.render();

    
    noises.map(o => o.update());
    noises = noises.filter(o => o.strength != 0);
    noises.map(o => o.render());

    //ctx.fillStyle = 'rgba(20, 20, 20, 0.7)'
    //ctx.fillText('Total boids: ' + boids.length, 5, 5);

    requestAnimationFrame(update);

}
/**
 * Rendu du disque d'historique, selon un certaine nombre de frame
 */
function disqueVisu() {
    if (frame < 200) {
        frame++;
        disque.render();
        // histo.render();
    }
    else {
        //console.log(noises)
        disque.update(history);
        history = []; //on reset l'historique
        frame = 0;
    }
}

