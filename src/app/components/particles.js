"use client"; // This is the crucial line for Next.js App Router

import { useCallback, useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles";

const Particlesbg = () => {
    const [init, setInit] = useState(false);

    // this initializes the tsparticles engine once per application load
    useEffect(() => {
        initParticlesEngine(async (engine) => {
            // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
            // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
            // starting from v2 you can add only the features you need reducing the bundle size
            await loadFull(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    const particlesLoaded = (container) => {
        console.log(container);
    };

    if (!init) {
        return null;
    }

    return (
        <Particles
            id="tsparticles"
            loaded={particlesLoaded}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: -1
            }}
            options={{
                fpsLimit: 60,
                fullScreen: {
                    enable: false, // Set to false to not cover the whole screen
                    zIndex: -1      // Set to -1 to place it behind other content
                },
                background: {
                    color: {
                        value: '#000000',
                    }
                },
                interactivity: {
                    events: {
                        onClick: {
                            enable: true,
                            mode: "push",
                        },
                        onHover: {
                            enable: true,
                            mode: "connect"
                        },
                        resize: true,
                    },
                    modes: {
                        push: {
                            quantity: 2,
                        },
                        connect: {
                            distance: 200,
                            links: {
                                opacity: 0.5
                            },
                            radius: 200,
                        },
                    },
                },
                particles: {
                    color: {
                        value: ['#ffffff', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57']
                    },
                    links: {
                        color: "#ffffff",
                        distance: 150,
                        enable: true,
                        opacity: 0.3,
                        width: 1,
                    },
                    collisions: {
                        enable: false,
                    },
                    move: {
                        direction: "none",
                        enable: true,
                        outModes: {
                            default: "bounce",
                        },
                        random: true,
                        speed: 1,
                        straight: false,
                    },
                    number: {
                        density: {
                            enable: true,
                            area: 1000,
                        },
                        value: 60,
                    },
                    opacity: {
                        value: 0.6,
                    },
                    shape: {
                        type: "circle",
                    },
                    size: {
                        value: { min: 1, max: 3 },
                    },
                },
                detectRetina: true,
            }}
        />
    )
}

export default Particlesbg;