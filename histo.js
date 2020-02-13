class Histo {

    constructor(x, y, size){
        //width, height) {

        this.pos = vec2.create(x, y);
        this.size = size;
        //this.width = width;
        //this.height = height;
        this.rings = [];
        this.bruitActuel=0;

        
    }
    
    addRing(noises){
        this.bruitActuel ++;
    }
    
/**
 * Insere un bruit, on pouse les autres anneaux
 * @param {*} noises 
 */
    update(noises) {
        //console.log("update noise");
        console.log("bruit actuelle = "+this.bruitActuel);
        this.rings = this.rings.concat(this.bruitActuel);
        this.bruitActuel =0;
        //console.log("lenght="+this.rings.length);
    }


    render() {
        
        let size = this.size;
        //console.log('debut render');        
        /*for(let ring in this.rings){
            size=size+(30);
            ctxHisto.save();
            console.log("this.rings["+ring+"] = "+this.rings[ring]);
            ctxHisto.lineWidth = this.rings[ring];
           // console.log("this ring["+ring+"] ="+this.rings[ring]);
            ctxHisto.strokeStyle = 'rgba(20, 20, 20, ' + (1 ) + ')';
            ctxHisto.beginPath();
            ctxHisto.arc(this.pos.x, this.pos.y, size+30, 0, 2 * Math.PI);
            ctxHisto.arc(this.pos.x, this.pos.y, size, 0, 2 * Math.PI,true);

            ctxHisto.stroke();
            //ctx.fillStyle = 'rgba(20, 20, 20, ' + (1 ) + ')';
            ctxHisto.fill();
            ctxHisto.restore();
            
        }*/
        
        for(let i = this.rings.length-1;i>=0;i--){
            size=size+10;
            ctxHisto.save();
            console.log("this.rings["+i+"] = "+this.rings[i]);
            //ctxHisto.lineWidth = this.rings[i];
           // console.log("this ring["+ring+"] ="+this.rings[ring]);
            ctxHisto.strokeStyle = 'rgba(20, 20, 20, ' + (1 ) + ')';
            ctxHisto.beginPath();
            //disque
            ctxHisto.arc(this.pos.x, this.pos.y, size+10, 0, 2 * Math.PI);
            ctxHisto.arc(this.pos.x, this.pos.y, size, 0, 2 * Math.PI,true);

            ctxHisto.stroke();
            var radialGradient = ctxHisto.createRadialGradient(this.pos.x, this.pos.y, size, this.pos.x, this.pos.y, size+10);
            radialGradient.addColorStop(0, "white");
            radialGradient.addColorStop(1, "black");
            var calcul = this.rings[i]*0.1;
            console.log("calcule = "+calcul)
            //ctx.fillStyle = radialGradient;
            ctx.fillStyle = 'rgba(0, 0, 0, '+(calcul)+')';
            ctxHisto.fill();
            ctxHisto.restore();
        }
        //console.log('fin render');   
        
        
        if (this.rings.length > 10){
            this.rings=[];
            
            size=this.size;
        }
            
        
        
        
        

    }


}