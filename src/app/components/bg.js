'use client';

import React, { useRef, useEffect } from 'react';

const ConnectingDotsBackground = ({ children }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width, height, particles, mouse;
        let animationFrameId;

        // Initialization function
        function init() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            particles = [];
            mouse = { x: null, y: null, radius: 150 }; // Mouse radius for interaction

            // Create particles
            const particleCount = Math.floor(width * height / 9000);
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        // Particle class
        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.radius = Math.random() * 1.5 + 1;
                this.baseColor = 'rgba(125, 211, 252, 0.7)'; // A nice tech blue
            }

            // Update particle position and react to mouse
            update() {
                // Bounce off edges
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
                
                // Mouse interaction - repulsion
                if (mouse.x && mouse.y) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouse.radius) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const force = (mouse.radius - distance) / mouse.radius;
                        const directionX = forceDirectionX * force * 0.5; // Repulsion strength
                        const directionY = forceDirectionY * force * 0.5;
                        this.x -= directionX;
                        this.y -= directionY;
                    } else {
                         this.x += this.vx;
                         this.y += this.vy;
                    }
                } else {
                    this.x += this.vx;
                    this.y += this.vy;
                }
            }

            // Draw particle
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = this.baseColor;
                ctx.fill();
            }
        }
        
        // Function to draw connections
        function connect() {
            for (let i = 0; i < particles.length; i++) {
                // Connect particles to each other
                for (let j = i + 1; j < particles.length; j++) {
                    const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(125, 211, 252, ${1 - dist / 100})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }

                // Connect particles to the mouse
                if (mouse.x && mouse.y) {
                    const distToMouse = Math.hypot(particles[i].x - mouse.x, particles[i].y - mouse.y);
                    if (distToMouse < mouse.radius + 50) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.strokeStyle = `rgba(125, 211, 252, ${0.5 - distToMouse / (mouse.radius + 50)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        // Animation loop
        function animate() {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            connect();
            animationFrameId = requestAnimationFrame(animate);
        }

        // Event Listeners
        const handleResize = () => {
            init();
        };

        const handleMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };
        
        const handleMouseOut = () => {
            mouse.x = null;
            mouse.y = null;
        }

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseout', handleMouseOut);

        // Start animation
        init();
        animate();

        // Cleanup function
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseout', handleMouseOut);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="relative bg-black">
            <canvas ref={canvasRef} id="dots-canvas" className="fixed top-0 left-0 w-full h-full -z-10"></canvas>
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export default ConnectingDotsBackground;
