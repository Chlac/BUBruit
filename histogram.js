class Histogram {

    /**
     * 
     * @param {*} x 
     * @param {*} y 
     * @param {*} radius 
     */
    constructor(x, y) {

        this.pos = vec2.create(x, y);

        this.radius = 150;
        this.ticks_per_rotation = 60;


        this.rotation = 0;
        this.time = 0;
        this.bars = [];
    }
    /**
     * 
     * @param {*} noise a value
     */
    update(noise) {
        //update the height with the noises


        //add a bar
        this.bars[this.time] = noise;

    }


    /**
     * 
     */
    render(){

        let barWidth = 100;
        let barHeight = 1;



        for (var i = 0; i < 360; i += (360 / this.ticks_per_rotation)) {
            // Find the rectangle's position on circle edge
            var angle = i * ((Math.PI * 2) / this.ticks_per_rotation);
            //var x = Math.cos(angle)*r+(canvas.width/2);
            //var y = Math.sin(angle)*r+(canvas.height/2);
            barWidth = 2 * Math.PI * this.radius / this.ticks_per_rotation;
            //console.log("i= "+i);

            if(this.bars[i]){
                barHeight = (this.bars[i] * 500);      //gestion de la hauteur de la barre           
            }else{
                barHeight = 1;
            }

            ctx.save();
            ctx.translate(this.pos.x,this.pos.y);
            ctx.fillStyle = "green";

            // Rotate the rectangle according to position
            // ctx.rotate(i*Math.PI/180); - DOESN'T WORK

            // Draw the rectangle

            ctx.rotate(i * Math.PI / 180);

            ctx.fillRect(this.radius, -barWidth / 2, barHeight, barWidth);

            //ctx.fillRect(r ,0, barHeight, barWidth);

            ctx.restore();
        }

        if(this.time >= 360) {
            this.time = 0;
        } else {
            this.time += 1; 
        }


    }
}