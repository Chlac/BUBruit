class Noise {

    constructor(strength, x, y) {

        this.pos = vec2.create(x, y);
        this.radius = 0;
        this.max_strength = 1;
        this.strength = strength * 60 < this.max_strength ? strength * 60 : this.max_strength;
        this.dying_speed = 0.005;
    }

    update() {

        if(this.strength > 0) {
            this.strength -= this.dying_speed;
            this.radius += 2 + 1 * this.strength;
        }
        else {
            this.strength = 0;
        }
    }

    render() {

        ctx.strokeStyle = 'rgba(20, 20, 20, ' + (1 * this.strength) + ')';
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI);
        ctx.stroke();

    }    

}
