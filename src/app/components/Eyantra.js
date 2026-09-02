'use client'
import React from 'react';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import { FaLaptopCode, FaCogs, FaTrophy } from 'react-icons/fa';

const glassStyle = { background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(34, 211, 238, 0.3)', color: '#fff', boxShadow: 'inset 0 0 20px rgba(34, 211, 238, 0.1)' };
const glassArrow = { borderRight: '7px solid rgba(34, 211, 238, 0.3)' };
const iconStyle = { background: 'rgba(0, 0, 0, 0.8)', border: '2px solid #22d3ee', color: '#22d3ee', boxShadow: '0 0 15px rgba(34, 211, 238, 0.5)' };

const EyantraTimeline = () => {
    return (
        <div className="comptime w-full max-w-5xl mx-auto">
            <VerticalTimeline className='comptimeline' layout='1-column-left' lineColor="rgba(34, 211, 238, 0.2)">
                <VerticalTimelineElement
                    className="vertical-timeline-element--work "
                    contentStyle={glassStyle}
                    contentArrowStyle={glassArrow}
                    date="Task 1 Phase"
                    iconStyle={iconStyle}
                    icon={<FaLaptopCode />}
                >
                    <h3 className="font-bold text-cyan-400 mb-2 tracking-widest uppercase" style={{ fontFamily: 'var(--font-orbitron)' }}>E-Yantra Competition</h3>
                    <h4 className="text-gray-300 font-mono text-sm">Simulation & Design</h4>
                    <p className="font-mono text-sm text-gray-400 mt-4">
                        Initial simulation, algorithm design phase, and theoretical problem solving.
                    </p>
                </VerticalTimelineElement>
                
                <VerticalTimelineElement
                    className="vertical-timeline-element--work"
                    date="Task 2 Phase"
                    contentStyle={glassStyle}
                    contentArrowStyle={glassArrow}
                    iconStyle={iconStyle}
                    icon={<FaCogs />}
                >
                    <h3 className="font-bold text-cyan-400 mb-2 tracking-widest uppercase" style={{ fontFamily: 'var(--font-orbitron)' }}>Hardware Integration</h3>
                    <h4 className="text-gray-300 font-mono text-sm">Prototyping</h4>
                    <p className="font-mono text-sm text-gray-400 mt-4">
                        Deploying algorithms onto actual hardware and testing in real-world scenarios.
                    </p>
                </VerticalTimelineElement>

                <VerticalTimelineElement
                    className="vertical-timeline-element--work"
                    date="Finals"
                    contentStyle={glassStyle}
                    contentArrowStyle={glassArrow}
                    iconStyle={iconStyle}
                    icon={<FaTrophy />}
                >
                    <h3 className="font-bold text-cyan-400 mb-2 tracking-widest uppercase" style={{ fontFamily: 'var(--font-orbitron)' }}>National Finals</h3>
                    <h4 className="text-gray-300 font-mono text-sm">IIT Bombay</h4>
                    <p className="font-mono text-sm text-gray-400 mt-4">
                        Final demonstration and evaluation at the national level.
                    </p>
                </VerticalTimelineElement>
            </VerticalTimeline>
        </div>
    );
};

export default EyantraTimeline;
