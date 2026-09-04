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
        // Particles loaded
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
                    enable: false,
                    zIndex: -1
                },
                background: {
                    color: {
                        value: '#000000',
                    }
                },
                interactivity: {
                    events: {
                        onHover: {
                            enable: true,
                            mode: "bubble"
                        },
                        resize: true,
                    },
                    modes: {
                        bubble: {
                            distance: 250,
                            size: 4,
                            duration: 2,
                            opacity: 1
                        },
                    },
                },
                particles: {
                    color: {
                        value: '#ffffff'
                    },
                    links: {
                        enable: false,
                    },
                    collisions: {
                        enable: false,
                    },
                    move: {
                        direction: "right",
                        enable: true,
                        outModes: {
                            default: "out",
                        },
                        random: false,
                        speed: { min: 3, max: 12 },
                        straight: true,
                    },
                    number: {
                        density: {
                            enable: true,
                            area: 800,
                        },
                        value: 350,
                    },
                    opacity: {
                        value: { min: 0.1, max: 0.8 },
                    },
                    shape: {
                        type: "circle",
                    },
                    size: {
                        value: { min: 0.5, max: 2.5 },
                    },
                },
                detectRetina: true,
            }}
        />
    )
}

export default Particlesbg;