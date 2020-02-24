class Disque {

    /**
     * 
     * @param {*} x Coordonée x du centre du disque
     * @param {*} y coordonée y du centre du disque 
     * @param {*} size Taille du cercle interieur
     * @param {*} width largeur du disque 
     * @param {*} nbRing nombre d'anneaux
     */
    constructor(x, y, size,width,nbRing){

        //maj parametre
        this.pos = vec2.create(x, y);
        this.size = size;
        this.witdh = width;
        this.nbRing = nbRing; 

        // variable pour l'historique
        this.bruitActuel=0; // à mettre à jours dans update;
        this.rings = []; // Array, pour chaque anneau on récupère sa valeur (le bruit actuelle)
        this.noisesHistory = []; // pour récuperer la varaible (noises);

        
    }
    

/**
 * Insere un bruit, on pouse les autres anneaux
 * @param {*Noise[]} noises 
 */
    update(noises) {
        this.noisesHistory = noises;
        //console.log("update noise");

        // On récupère la somme des bruits
        this.bruitActuel=this.sumValue(this.noisesHistory);

        //console.log("bruit actuelle= "+this.bruitActuel);

        //On l'ajoute dans la valeur de l'anneau "en cours"
        this.rings = this.rings.concat(this.bruitActuel);

        //on remet à zero
        this.bruitActuel =0;
        //console.log("lenght rings= "+this.rings.length);
    }

/**
 *  fonction de rendu de l'historique
 */
    render() {
        
        let size = this.size;        
        for(let i = this.rings.length-1;i>=0;i--){
            size=size+this.witdh;
            ctx.save();
            //console.log("this.rings["+i+"] = "+this.rings[i]);
            //ctxHisto.lineWidth = this.rings[i];
           // console.log("this ring["+ring+"] ="+this.rings[ring]);

           /**
            * Style du contour des anneaux  (oppacité)
            * 0 = invisible
            * 1 = Remplit
            */
           ctx.strokeStyle = 'rgba(20, 20, 20, ' + (0) + ')';

           //Début du rendu 
           ctx.beginPath();

            //disque
            ctx.arc(this.pos.x, this.pos.y, size+this.witdh, 0, 2 * Math.PI); // exterieur
            ctx.arc(this.pos.x, this.pos.y, size, 0, 2 * Math.PI,true); //interieur
            ctx.stroke();

            //creation du gradiant de couleur (blanc vers noir); pas utilisé 
           // var radialGradient = ctx.createRadialGradient(this.pos.x, this.pos.y, size, this.pos.x, this.pos.y, size+10);
           //radialGradient.addColorStop(0, "white");
            //radialGradient.addColorStop(1, "black");

            var calcul = this.rings[i]*0.1 +0.1; //création d'une valeur entre 0 et 1 pour le rendu du disque
            //console.log("calcule = "+calcul)
            //ctx.fillStyle = radialGradient;
            /**
             * La même chose que pour le contour des anneaux
             * calcul : une valeur entre 0 et 1 (pour l'oppacité)
             */
            ctx.fillStyle = 'rgba(0, 0, 0, '+(calcul)+')';
            ctx.fill();

            ctx.restore();
        }

        
        
        if (this.rings.length > this.nbRing ){
            this.rings=[];
            
            size=this.size;
        }
            
        
        
        
        

    }


/**
 * Fonction utilitaire
 */

    sumValue(arrayToSum){
        let array = [];
        array = arrayToSum;
        return array.reduce((a,b) => a + b);
    }

    arrAvr(arrayToAvr){
        let array = [];
        array = arrayToAvr;
        return array.reduce((a,b) => a + b) / array.length;
    }

}