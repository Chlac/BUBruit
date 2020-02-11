class Histo {

    constructor(x, y, size){
        //width, height) {

        this.pos = vec2.create(x, y);
        this.size = size;
        //this.width = width;
        //this.height = height;
        this.rings = [];
        this.bruitActuelle =0;

        
    }
    
    addRing(noises){
        this.bruitActuelle ++;
    }
    
/**
 * Insere un bruit, on pouse les autres anneaux
 * @param {*} noises 
 */
    update(noises) {
        console.log("update "+noises);

    }


    render() {
        ctx.save();
        let size = this.size;
        let i = 1;
        console.log(this.bruitActuelle);
        this.rings = this.rings.concat(this.bruitActuelle);
        for(let ring in this.rings){
            size=size+(10);
            ctx.lineWidth = this.rings[ring];
            console.log(this.rings[ring]);
            ctx.strokeStyle = 'rgba(20, 20, 20, ' + (1 ) + ')';
            ctx.beginPath();
            ctx.arc(this.pos.x, this.pos.y, size, 0, 2 * Math.PI);
            ctx.stroke();
            i++;
        }
        this.bruitActuelle =0;
        ctx.restore();
        
        
        

    }


}