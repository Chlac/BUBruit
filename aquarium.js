class Aquarium {

    constructor(x, y, width, height) {

        this.pos = vec2.create(x, y);
        this.width = width;
        this.height = height;
        
        this.boids = [];
    }
    
    addBoids(boids) {
        this.boids = this.boids.concat(boids);
    }
    
    update(noises) {

        this.boids.map(b => b.update(this.boids, noises));
    }


    render() {
        
        ctx.strokeStyle = '#333';
        
       
        ctx.beginPath();
         //contour du rectangle
        ctx.rect(this.pos.x, this.pos.y, this.width, this.height);

        //remplissage en blanc, avec variable oppacité (valeur entre 0 et 1)
        let oppacity = 1
        ctx.fillStyle ='rgba(255, 255, 255,'+(oppacity)+')'
        ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);


        ctx.stroke();

        


        
        this.boids.map(b => b.render());
        

    }


}