class Histogram {


    constructor(x, y, size){
        this.pos = vec2.create(x, y);
        this.size = size;
        this.width = 10;
        this.rotation = 0;
        this.bruit = 0;
        this.max = 10 ;
        this.bars =[]
        this.time = 0;
;    }

    update(noises){
        //update the height with the noises

        //add a bar
        this.bars[this.time] = 100;
        //this.bruit += noises

    }



    createCircle(){
        let cw = canvas.width ;
        let ch = canvas.height ;
        let  barWidth = 100;
        let barHeight = 4


        let bars = 60;
        
        let r = 140;

       // ctxVisuData.translate(cw / 2, ch / 2)

        for (var i = 0; i < 360; i += (360 / bars)) {
        // Find the rectangle's position on circle edge

        var angle = i * ((Math.PI * 2) / bars);
        //var x = Math.cos(angle)*r+(canvas.width/2);
        //var y = Math.sin(angle)*r+(canvas.height/2);
        barWidth = 2 * Math.PI * r / bars;
        if(this.bars[i]){
            barHeight = (this.bars[i]);
            
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

    render(){

        this.createCircle();
        if(this.time >= 360){
            this.time=0;
            this.bars = []
        }else {
            this.time += 1; 
        }
        

    }
}