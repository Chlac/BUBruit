class Noise {
    
  constructor(x, y) {
      
    this.pos = vec2.create(x, y);
    this.size = 25;
    this.strength = 1;
      
      
  }
    
    update() {
        if(this.strength > 0) {
        this.strength -= 0.02;
        this.size += 2 + 1 * this.strength;
            }
        else this.strength = 0;
    }

  render() {

    ctx.strokeStyle = 'rgba(20, 20, 20, ' + (1 * this.strength) + ')';
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.size, 0, 2 * Math.PI);
    ctx.stroke();
      
  }
    

}
