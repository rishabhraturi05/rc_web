"use client"; // Make sure this is at the top

import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

const Particlesbg = () => {
    const particlesInit = useCallback(async engine => {
        await loadFull(engine);
    }, []);

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            options={{
                fpsLimit: 60,
                fullScreen: {
                    enable: true,
                    zIndex: -1 // Keep it in the background
                },
                // START OF UPDATED SECTION
                background: {
                    color: {
                        value: '#000000', // This will be a fallback color
                    },
                    image: "url('/robot-bg.jpg')", // The URL to your image in the public folder
                    position: "50% 50%", // Center the image
                    repeat: "no-repeat", // Do not tile the image
                    size: "cover" // Scale the image to cover the entire screen
                },
                // END OF UPDATED SECTION
                interactivity: {
                    events: {
                        onClick: {
                            enable: true,
                            mode: "push",
                        },
                        onHover: {
                            enable: true,
                            mode: "repulse"
                        },
                        resize: true,
                    },
                    modes: {
                        push: {
                            quantity: 4,
                        },
                        repulse: {
                            distance: 150,
                            duration: 0.4,
                        },
                    },
                },
                particles: {
                    color: {
                        value: ['#ff0000', "#BD10E0", "#B8E986", "#50E3C2", "#FFD300", "#E86363"]
                    },
                    links: {
                        color: "#ffffff",
                        distance: 150,
                        enable: true,
                        opacity: 0.4, // Making links a bit more visible
                        width: 1,
                    },
                    collisions: {
                        enable: true,
                    },
                    move: {
                        direction: "none",
                        enable: true,
                        outModes: {
                            default: "bounce",
                        },
                        random: true, // Make movement more random
                        speed: 1,
                        straight: false,
                    },
                    number: {
                        density: {
                            enable: true,
                            area: 800,
                        },
                        value: 80,
                    },
                    opacity: {
                        value: 0.5,
                    },
                    shape: {
                        type: "circle",
                    },
                    size: {
                        value: { min: 1, max: 4 },
                    },
                },
                detectRetina: true,
            }}
        />
    )
}

export default Particlesbg;