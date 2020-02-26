let canvas, ctx, aquariums, noises_real_time, noise_history, frame;
let audioContext = null;
let audiometer = null;

let tables = false;

onload = () => {

    canvas = document.querySelector('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx = canvas.getContext('2d');

    aquariums = [];
    noises_real_time = [];
    noise_history = new History(canvas.width / 2, canvas.height / 2);
    //frame = 0;

    let num_rows = 3;
    let num_cols = 5;

    let space = 30;

    if(tables) {
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

                if(i != 1 || j != 2)
                    aquarium.addBoids(
                        Array(6)
                        .fill()
                        .map(
                            (b, i) => new Boid(
                                Math.random() * aquarium.width + aquarium.pos.x,
                                Math.random() * aquarium.height + aquarium.pos.y,
                                aquarium,
                                i
                            )
                        )
                    );

                aquariums.push(aquarium);

            }
        }
    } else {
        let aquarium_width = canvas.width - space;
        let aquarium_height = canvas.height - space;

        let aquarium = new Aquarium(
            canvas.width / 2, 
            canvas.height / 2, 
            aquarium_height,
            aquarium_height,
            Aquarium.SHAPE.ELLIPSE);

        aquarium.addBoids(
            Array(25)
            .fill()
            .map(
                (b, i) => new Boid(
                    Math.random() * aquarium.width / 1.5 + aquarium.pos.x - aquarium.width / 3,
                    Math.random() * aquarium.height / 1.5 + aquarium.pos.y - aquarium.height / 3,
                    aquarium,
                    i
                )
            )
        );


        aquariums.push(aquarium);
    }


    ctx.font = "15px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "hanging";

}

let mediaStreamSource = null;
function onMicrophoneGranted(stream) {
    // Create an AudioNode from the stream.
    mediaStreamSource = audioContext.createMediaStreamSource(stream);

    // Create a new volume audiometer and connect it.
    audiometer = AudioMeter.createAudioMeter(audioContext);
    mediaStreamSource.connect(audiometer);

    // kick off updating
    update(0);
}

function processAudioChunk( time ) {

    // check if we're currently clipping
    //if (audiometer.checkClipping())
    // SEUIL DEPASSE
    //else
    // SOUS LE SEUIL

    return(audiometer.volume); // on récupere le volume
}

onclick = (e) => {

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
                .catch(function(err) { 
                console.log(err); 
            }
                      );

        } catch (e) {
            console.log(e.name + ": " + e.message);
        }

    }

    noises_real_time.push(new Noise(0.05, e.pageX, e.pageY));

}

oncontextmenu = (e) => {
    e.preventDefault();
}

let max = 0;

let t = 0;

const update = (time) => {

    let current_volume = processAudioChunk();

    for(let aquarium of aquariums) {
        aquarium.update(noises_real_time);
    }

    noises_real_time.push(new Noise(current_volume, canvas.width / 2, canvas.height / 2));
    noises_real_time.map(o => o.update());
    noises_real_time = noises_real_time.filter(o => o.strength != 0);

    noise_history.update(current_volume, time); 



    render();


    let fps = 1000 / (time - t);
    t = time;

    ctx.font = "25px Arial";
    ctx.fillStyle = 'black';
    ctx.fillText('FPS: ' + fps, 20, 20);

    requestAnimationFrame(update);

}


function render() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    noise_history.render();

    for(let aquarium of aquariums) {
        aquarium.render();
    }

    noises_real_time.map(o => o.render());


}

/**
 * Rendu du disque d'historique, selon un certaine nombre de frame
 */
/*
function disqueVisu() {
    if (frame < 200) {
        frame++;
        disque.render();
        // histo.render();
    }
    else {
        //console.log(noises_real_time)
        disque.update(noise_history);
        noise_history = []; //on reset l'historique
        frame = 0;
    }
}*/

