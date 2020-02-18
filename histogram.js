class Histogram {

    /**
     * 
     * @param {*} x 
     * @param {*} y 
     * @param {*} size 
     */
    constructor(x, y, size){
        this.pos = vec2.create(x, y);
        this.size = size;
        this.width = 10;
        this.rotation = 0;
        this.bars =[]
        this.time = 0;
 }
    /**
     * 
     * @param {*} noise a value
     */
    update(noise){
        //update the height with the noises


        //add a bar
        this.bars[this.time] = noise;

    }


    /**
     * 
     */
    createCircle(){
  
        let barWidth = 100;
        let barHeight = 1


        let bars = 60;
        
        let r = 140;



        for (var i = 0; i < 360; i += (360 / bars)) {
        // Find the rectangle's position on circle edge
            var angle = i * ((Math.PI * 2) / bars);
            //var x = Math.cos(angle)*r+(canvas.width/2);
            //var y = Math.sin(angle)*r+(canvas.height/2);
            barWidth = 2 * Math.PI * r / bars;
            //console.log("i= "+i);

            if(this.bars[i]){
                barHeight = (this.bars[i]*500);      //gestion de la hauteur de la barre           
            }else{
                barHeight = 1;
            }
            
            ctxVisuData.save();
            ctxVisuData.translate(this.pos.x,this.pos.y);
            ctxVisuData.fillStyle = "green";

            // Rotate the rectangle according to position
            // ctx.rotate(i*Math.PI/180); - DOESN'T WORK

            // Draw the rectangle
            
            ctxVisuData.rotate(i * Math.PI / 180);

            ctxVisuData.fillRect(r, -barWidth / 2, barHeight, barWidth);

            //ctx.fillRect(r ,0, barHeight, barWidth);

            ctxVisuData.restore();
        }
        
    }

    /**
     * 
     */
    render(){

        this.createCircle();
        if(this.time >= 360){
            this.time=0;
            //this.bars = []
        }else {
            this.time += 1; 
        }
        

    }
}