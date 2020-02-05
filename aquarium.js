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

        this.boids.map(b => b.adjustToNearBoids(this.boids, noises));
        this.boids.map(b => b.move());
        
    }


    render() {
        
        ctx.strokeStyle = '#333';
        
        ctx.beginPath();
        ctx.rect(this.pos.x, this.pos.y, this.width, this.height);
        ctx.stroke();
        
        this.boids.map(b => b.render());
        

    }


}