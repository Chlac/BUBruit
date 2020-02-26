class Aquarium {

    constructor(x, y, width, height, shape = Aquarium.SHAPE.RECTANGLE) {

        this.pos = vec2.create(x, y);
        this.width = width;
        this.height = height;
        this.shape = shape;

        this.boids = [];
    }

    addBoids(boids) {
        this.boids = this.boids.concat(boids);
    }

    update(noises) {

        this.boids.map(b => b.update(this.boids, noises));
    }


    render() {

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';


        ctx.beginPath();
        if(this.shape === Aquarium.SHAPE.RECTANGLE)
            ctx.rect(this.pos.x, this.pos.y, this.width, this.height);
        else if(this.shape === Aquarium.SHAPE.ELLIPSE) {
            ctx.ellipse(this.pos.x, this.pos.y, this.width / 2, this.height / 2, 0, 0, 2 * Math.PI);
        }

        /*
        //remplissage en blanc, avec variable oppacité (valeur entre 0 et 1)
        let oppacity = 1
        ctx.fillStyle ='rgba(255, 255, 255,'+(oppacity)+')'
        ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);
        */

        ctx.stroke();

        this.boids.map(b => b.render());


    }

    static SHAPE = {
        RECTANGLE: 0,
        ELLIPSE: 1,
    }


}

