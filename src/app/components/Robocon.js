'use client'
import React from 'react';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import { FaRobot, FaWrench, FaFlagCheckered } from 'react-icons/fa';

const glassStyle = { background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(34, 211, 238, 0.3)', color: '#fff', boxShadow: 'inset 0 0 20px rgba(34, 211, 238, 0.1)' };
const glassArrow = { borderRight: '7px solid rgba(34, 211, 238, 0.3)' };
const iconStyle = { background: 'rgba(0, 0, 0, 0.8)', border: '2px solid #22d3ee', color: '#22d3ee', boxShadow: '0 0 15px rgba(34, 211, 238, 0.5)' };

const RoboconTimeline = () => {
    return (
        <div className="comptime w-full max-w-5xl mx-auto">
            <VerticalTimeline className='comptimeline' lineColor="rgba(34, 211, 238, 0.2)">
                {/* TODAY TO 18TH JAN */}
                <VerticalTimelineElement
                    date="TODAY TO 18TH JAN"
                    contentStyle={glassStyle}
                    contentArrowStyle={glassArrow}
                    iconStyle={iconStyle}
                    icon={<FaRobot />}
                >
                    <h3 className="font-bold text-cyan-400 mb-2 tracking-widest uppercase" style={{ fontFamily: 'var(--font-orbitron)' }}>CAD TEAMS</h3>
                    <p className="font-mono text-sm text-gray-300">Calculations, CAD, Analysis, Optimisation</p>
                    <h3 className="font-bold text-cyan-400 mt-4 mb-2 tracking-widest uppercase" style={{ fontFamily: 'var(--font-orbitron)' }}>OTHER TEAMS</h3>
                    <p className="font-mono text-sm text-gray-300">Read necessary theory, best practices</p>
                </VerticalTimelineElement>

                {/* 19TH JAN TO 25TH JAN */}
                <VerticalTimelineElement
                    date="19TH JAN TO 25TH JAN"
                    contentStyle={glassStyle}
                    contentArrowStyle={glassArrow}
                    iconStyle={iconStyle}
                    icon={<FaWrench />}
                >
                    <h3 className="font-bold text-cyan-400 mb-2 tracking-widest uppercase" style={{ fontFamily: 'var(--font-orbitron)' }}>FAB/LOG TEAM</h3>
                    <p className="font-mono text-sm text-gray-300">Round 1 report submission</p>
                    <h3 className="font-bold text-cyan-400 mt-4 mb-2 tracking-widest uppercase" style={{ fontFamily: 'var(--font-orbitron)' }}>PR/F TEAM</h3>
                    <p className="font-mono text-sm text-gray-300">Admin budget proposal</p>
                </VerticalTimelineElement>

                {/* 26TH JAN TO 8TH FEB */}
                <VerticalTimelineElement
                    date="26TH JAN TO 8TH FEB"
                    contentStyle={glassStyle}
                    contentArrowStyle={glassArrow}
                    iconStyle={iconStyle}
                    icon={<FaRobot />}
                >
                    <h3 className="font-bold text-cyan-400 mb-2 tracking-widest uppercase" style={{ fontFamily: 'var(--font-orbitron)' }}>OFFSEASON</h3>
                </VerticalTimelineElement>

                {/* 9TH TO 12TH FEB */}
                <VerticalTimelineElement
                    date="9TH TO 12TH FEB"
                    contentStyle={glassStyle}
                    contentArrowStyle={glassArrow}
                    iconStyle={iconStyle}
                    icon={<FaWrench />}
                >
                    <h3 className="font-bold text-cyan-400 mb-2 tracking-widest uppercase" style={{ fontFamily: 'var(--font-orbitron)' }}>E/C TEAM</h3>
                    <p className="font-mono text-sm text-gray-300">Component selection</p>
                    <h3 className="font-bold text-cyan-400 mt-4 mb-2 tracking-widest uppercase" style={{ fontFamily: 'var(--font-orbitron)' }}>FAB/LOG TEAM</h3>
                    <p className="font-mono text-sm text-gray-300">Product sourcing document</p>
                </VerticalTimelineElement>

                {/* 13TH TO 15TH FEB */}
                <VerticalTimelineElement
                    date="13TH TO 15TH FEB"
                    contentStyle={glassStyle}
                    contentArrowStyle={glassArrow}
                    iconStyle={iconStyle}
                    icon={<FaWrench />}
                >
                    <h3 className="font-bold text-cyan-400 mb-2 tracking-widest uppercase" style={{ fontFamily: 'var(--font-orbitron)' }}>Round 1 Result</h3>
                    <p className="font-mono text-sm text-gray-300">Bugging admin, placing orders</p>
                </VerticalTimelineElement>

                {/* 16TH FEB TO 29TH MARCH */}
                <VerticalTimelineElement
                    date="16TH FEB TO 29TH MARCH"
                    contentStyle={glassStyle}
                    contentArrowStyle={glassArrow}
                    iconStyle={iconStyle}
                    icon={<FaRobot />}
                >
                    <h3 className="font-bold text-cyan-400 mb-2 tracking-widest uppercase" style={{ fontFamily: 'var(--font-orbitron)' }}>FAB/LOG TEAM</h3>
                    <p className="font-mono text-sm text-gray-300">Build, test, optimise bot</p>
                    <h3 className="font-bold text-cyan-400 mt-4 mb-2 tracking-widest uppercase" style={{ fontFamily: 'var(--font-orbitron)' }}>Programming & E/C Team</h3>
                    <p className="font-mono text-sm text-gray-300">Write code</p>
                    <h3 className="font-bold text-cyan-400 mt-4 mb-2 tracking-widest uppercase" style={{ fontFamily: 'var(--font-orbitron)' }}>PR/F Team</h3>
                    <p className="font-mono text-sm text-gray-300">Make and submit video</p>
                </VerticalTimelineElement>

                {/* 30TH MARCH TO 19TH APRIL */}
                <VerticalTimelineElement
                    date="30TH MARCH TO 19TH APRIL"
                    contentStyle={glassStyle}
                    contentArrowStyle={glassArrow}
                    iconStyle={iconStyle}
                    icon={<FaWrench />}
                >
                    <h3 className="font-bold text-cyan-400 mb-2 tracking-widest uppercase" style={{ fontFamily: 'var(--font-orbitron)' }}>OFFSEASON</h3>
                </VerticalTimelineElement>

                {/* 15TH MAY */}
                <VerticalTimelineElement
                    date="15TH MAY"
                    contentStyle={glassStyle}
                    contentArrowStyle={glassArrow}
                    iconStyle={iconStyle}
                    icon={<FaFlagCheckered />}
                >
                    <h3 className="font-bold text-cyan-400 mb-2 tracking-widest uppercase" style={{ fontFamily: 'var(--font-orbitron)' }}>Round 2 Result</h3>
                </VerticalTimelineElement>

            </VerticalTimeline>
        </div>
    );
};

export default RoboconTimeline;
