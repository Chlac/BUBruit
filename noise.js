class Noise {

    constructor(strength, x, y) {

        this.pos = vec2.create(x, y);
        this.radius = 0;
        //this.max_strength = 1;
        this.max_opacity = 0.2;
        this.strength = strength * 50 < 1 ? strength * 50 : 1;
        this.spread_speed = 2;
        this.spread_speed_is_relative_to_noise = true;
        this.dying_speed = 0.0008;
        this.max = 0;
    }

    get ratio() {
        return 1;//canvas.width / canvas.height;
    }

    update() {
        this.strength -= this.dying_speed;
        if(this.strength > 0 && (tables ? (this.radius <= Math.max(canvas.width, canvas.height) / 1.2) : (this.radius < canvas.height / 2 - 20))) {
            this.radius += this.spread_speed * (1 + this.strength * this.spread_speed_is_relative_to_noise);
        }
        else {
            this.strength = 0;
        }
    }

    render() {
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
        ctx.lineWidth = 5;
        ctx.strokeStyle = 'rgba(0, 0, 0, ' + (1 * this.strength * this.max_opacity) + ')';
        ctx.beginPath();
        //ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI);
        ctx.ellipse(this.pos.x, this.pos.y, this.radius * this.ratio, this.radius, 0, 0, 2 * Math.PI);
        //ctx.fill();
        ctx.stroke();

    }    

}
