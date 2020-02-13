class Disque {

    /**
     * 
     * @param {*} x Coordonée x du centre du disque
     * @param {*} y coordonée y du centre du disque 
     * @param {*} size Taille du cercle interieur
     * @param {*} width largeur du disque 
     * @param {*} nbRing nombre d'anneau
     */
    constructor(x, y, size,width,nbRing){

        this.pos = vec2.create(x, y);
        this.size = size;
        //this.width = width;
        //this.height = height;
        this.rings = [];
        this.bruitActuel=0;
        this.witdh = width;
        this.nbRing = nbRing; 

        
    }
    
    /**
     * à modifier pour ajouter le bruit
     * @param {*} noises 
     */
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

/**
 *  fonction de rendu de l'historique
 */
    render() {
        
        let size = this.size;        
        for(let i = this.rings.length-1;i>=0;i--){
            size=size+this.witdh;
            ctxVisuData.save();
            console.log("this.rings["+i+"] = "+this.rings[i]);
            //ctxHisto.lineWidth = this.rings[i];
           // console.log("this ring["+ring+"] ="+this.rings[ring]);
           ctxVisuData.strokeStyle = 'rgba(20, 20, 20, ' + (0) + ')';
           ctxVisuData.beginPath();
            //disque
           ctxVisuData.arc(this.pos.x, this.pos.y, size+this.witdh, 0, 2 * Math.PI);
            ctxVisuData.arc(this.pos.x, this.pos.y, size, 0, 2 * Math.PI,true);

            ctxVisuData.stroke();
            var radialGradient = ctxVisuData.createRadialGradient(this.pos.x, this.pos.y, size, this.pos.x, this.pos.y, size+10);
            radialGradient.addColorStop(0, "white");
            radialGradient.addColorStop(1, "black");
            var calcul = this.rings[i]*0.1 +0.1;
            console.log("calcule = "+calcul)
            //ctx.fillStyle = radialGradient;
            ctxVisuData.fillStyle = 'rgba(0, 0, 0, '+(calcul)+')';
            ctxVisuData.fill();
            ctxVisuData.restore();
        }

        
        
        if (this.rings.length > this.nbRing ){
            this.rings=[];
            
            size=this.size;
        }
            
        
        
        
        

    }


}