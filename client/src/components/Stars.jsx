import { Component } from 'react';

export default class Stars extends Component {
  canvasRef = null;

  componentDidMount() {
    this.initCanvas();
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    if (this.animationId) cancelAnimationFrame(this.animationId);
  }

  handleResize = () => {
    if (this.canvasRef) {
      this.canvasRef.width = window.innerWidth;
      this.canvasRef.height = window.innerHeight;
    }
  };

  initCanvas = () => {
    const canvas = this.canvasRef;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2.5 + 0.5,
      speed: Math.random() * 0.4 + 0.05,
      opacity: Math.random() * 0.8 + 0.2,
      pulse: Math.random() * Math.PI * 2,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        star.y -= star.speed;
        star.pulse += 0.02;

        if (star.y < -5) {
          star.y = canvas.height + 5;
          star.x = Math.random() * canvas.width;
        }

        const pulseOpacity = star.opacity * (0.6 + 0.4 * Math.sin(star.pulse));
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${pulseOpacity})`;
        ctx.fill();

        // Glow effect
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${pulseOpacity * 0.15})`;
        ctx.fill();
      });

      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  };

  render() {
    return (
      <canvas
        ref={(el) => (this.canvasRef = el)}
        className="stars-canvas"
      />
    );
  }
}
