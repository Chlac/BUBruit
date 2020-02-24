class Noise {

    constructor(strength, x, y) {

        this.pos = vec2.create(x, y);
        this.radius = 0;
        //this.max_strength = 1;
        this.max_opacity = 0.5;
        this.strength = strength * 30 < 1 ? strength * 30 : 1;
        this.spread_speed = 20;
        this.spread_speed_is_relative_to_noise = false;
        this.dying_speed = 0.008;
        this.max = 0;
    }

    update() {
        this.strength -= this.dying_speed;
        if(this.strength > 0 && this.radius <= Math.max(canvas.width, canvas.height) / 1.2) {
            this.radius += this.spread_speed * (1 + this.strength * this.spread_speed_is_relative_to_noise);
        }
        else {
            this.strength = 0;
        }
    }

    render() {

        let ratio = canvas.width / canvas.height;
/*
        let grd = ctx.createRadialGradient(this.pos.x, this.pos.y, this.radius / (1 + this.strength), this.pos.x, this.pos.y, this.radius);
        grd.addColorStop(0.4, 'rgba(0, 0, 0, 0)');
        //grd.addColorStop(0.4, 'rgba(255, 255, 255, ' + (1 * this.strength * this.max_opacity) + ')');
        grd.addColorStop(0.5, 'rgba(0, 0, 0, ' + (1 * this.strength * this.max_opacity) + ')');
        //grd.addColorStop(0.6, 'rgba(255, 255, 255, ' + (1 * this.strength * this.max_opacity) + ')');
        grd.addColorStop(0.6, 'rgba(0, 0, 0, 0)');

        // Fill with gradient
        ctx.fillStyle = grd;
*/
        ctx.strokeStyle = 'rgba(20, 20, 20, ' + (1 * this.strength) + ')';
        ctx.beginPath();
        //ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI);
        ctx.ellipse(this.pos.x, this.pos.y, this.radius * ratio, this.radius, 0, 0, 2 * Math.PI);
        //ctx.fill();
        ctx.stroke();

    }    

}
