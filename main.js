let canvas, ctx,ctxVisuData, num_aquariums, aquariums, noises,disque,frame;

onload = () => {

    aquariums = [];
    noises = [];
    frame =0;

    num_aquariums = 9;

    canvas  = document.querySelector('canvas');
    ctx     = canvas.getContext('2d');

    canvasHisto = document.getElementById("histo");
    ctxVisuData = canvasHisto.getContext('2d');

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    
    //Taille du cavas pour les données
    ctxVisuData.width = window.innerWidth;
    ctxVisuData.height = window.innerHeight;

    disque = new Disque (ctxVisuData.width/2,ctxVisuData.height/2,200,10);

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

            aquarium.addBoids(
                Array(30)
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

    


    ctx.font = "30px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "hanging";

   

    update();
}

onclick = (e) => {

    if(e.button == 0){
        let noise = new Noise(e.pageX, e.pageY);
        noises.push(noise);
        disque.addRing(noise);
    }
        
}

oncontextmenu = (e) => {
    e.preventDefault();
}


const update = () => {

    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //A Way to compute the "time"
    if(frame < 100){
        frame++;
        
        disque.render();
    }else{
        console.log("frame= "+frame);
        disque.update();
        frame = 0 ;
    }

    
    for(let aquarium of aquariums) {
        aquarium.update(noises);
        aquarium.render();
    }

    
    noises.map(o => o.update());
    noises = noises.filter(o => o.strength != 0);
    noises.map(o => o.render());

    //ctx.fillStyle = 'rgba(20, 20, 20, 0.7)'
    //ctx.fillText('Total boids: ' + boids.length, 5, 5);

    requestAnimationFrame(update);

}
