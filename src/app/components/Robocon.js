// 'use client'
// import React from 'react';
// import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
// import 'react-vertical-timeline-component/style.min.css';
// import { FaRobot, FaWrench, FaFlagCheckered } from 'react-icons/fa'; // Using react-icons

// const RoboconTimeline = () => {
//     return (
//         <div className="comptime">

//             <VerticalTimeline className='comptimeline batman-font' >
//                 <VerticalTimelineElement
//                     className="vertical-timeline-element--work"
//                     contentStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
//                     contentArrowStyle={{ borderRight: '7px solid  rgb(33, 150, 243)' }}
//                     date="2011 - present"
//                     iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
//                 // icon={<WorkIcon />}
//                 >
//                     <h3 className="vertical-timeline-element-title">Creative Director</h3>
//                     <h4 className="vertical-timeline-element-subtitle">Miami, FL</h4>
//                     <p>
//                         Creative Direction, User Experience, Visual Design, Project Management, Team Leading
//                     </p>
//                 </VerticalTimelineElement>
//                 <VerticalTimelineElement
//                     className="vertical-timeline-element--work"
//                     date="2010 - 2011"
//                     contentStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
//                     iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
//                 // icon={<WorkIcon />}
//                 >
//                     <h3 className="vertical-timeline-element-title">Art Director</h3>
//                     <h4 className="vertical-timeline-element-subtitle">San Francisco, CA</h4>
//                     <p>
//                         Creative Direction, User Experience, Visual Design, SEO, Online Marketing
//                     </p>
//                 </VerticalTimelineElement>
//                 <VerticalTimelineElement
//                     className="vertical-timeline-element--work"
//                     date="2008 - 2010"
//                     contentStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
//                     iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
//                 // icon={<WorkIcon />}
//                 >
//                     <h3 className="vertical-timeline-element-title">Web Designer</h3>
//                     <h4 className="vertical-timeline-element-subtitle">Los Angeles, CA</h4>
//                     <p>
//                         User Experience, Visual Design
//                     </p>
//                 </VerticalTimelineElement>
//                 <VerticalTimelineElement
//                     className="vertical-timeline-element--work"
//                     contentStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
//                     date="2006 - 2008"
//                     iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
//                 // icon={<WorkIcon />}
//                 >
//                     <h3 className="vertical-timeline-element-title">Web Designer</h3>
//                     <h4 className="vertical-timeline-element-subtitle">San Francisco, CA</h4>
//                     <p>
//                         User Experience, Visual Design
//                     </p>
//                 </VerticalTimelineElement>
//                 <VerticalTimelineElement
//                     className="vertical-timeline-element--education"
//                     date="April 2013"
//                     contentStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
//                     iconStyle={{ background: 'rgb(233, 30, 99)', color: '#fff' }}
//                 // icon={<SchoolIcon />}
//                 >
//                     <h3 className="vertical-timeline-element-title">Content Marketing for Web, Mobile and Social Media</h3>
//                     <h4 className="vertical-timeline-element-subtitle">Online Course</h4>
//                     <p>
//                         Strategy, Social Media
//                     </p>
//                 </VerticalTimelineElement>
//                 <VerticalTimelineElement
//                     className="vertical-timeline-element--education"
//                     date="November 2012"
//                     contentStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
//                     iconStyle={{ background: 'rgb(233, 30, 99)', color: '#fff' }}
//                 // icon={<SchoolIcon />}
//                 >
//                     <h3 className="vertical-timeline-element-title">Agile Development Scrum Master</h3>
//                     <h4 className="vertical-timeline-element-subtitle">Certification</h4>
//                     <p>
//                         Creative Direction, User Experience, Visual Design
//                     </p>
//                 </VerticalTimelineElement>
//                 <VerticalTimelineElement
//                     className="vertical-timeline-element--education"
//                     date="2002 - 2006"
//                     contentStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
//                     iconStyle={{ background: 'rgb(233, 30, 99)', color: '#fff' }}
//                 // icon={<SchoolIcon />}
//                 >
//                     <h3 className="vertical-timeline-element-title">Bachelor of Science in Interactive Digital Media Visual Imaging</h3>
//                     <h4 className="vertical-timeline-element-subtitle">Bachelor Degree</h4>
//                     <p>
//                         Creative Direction, Visual Design
//                     </p>
//                 </VerticalTimelineElement>
//                 <VerticalTimelineElement
//                     iconStyle={{ background: 'rgb(16, 204, 82)', color: '#fff' }}
//                 // icon={<StarIcon />}
//                 />
//             </VerticalTimeline>
//         </div>
//     );
// };

// export default RoboconTimeline;
'use client'
import React from 'react';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import { FaRobot, FaWrench, FaFlagCheckered } from 'react-icons/fa';

const RoboconTimeline = () => {
    return (
        <div className="comptime">

            <VerticalTimeline className='comptimeline batman-font'>

                {/* TODAY TO 18TH JAN */}
                <VerticalTimelineElement
                    date="TODAY TO 18TH JAN"
                    contentStyle={{ background: '#0a2a88', color: '#fff' }}
                    contentArrowStyle={{ borderRight: '7px solid #0a2a88' }}
                    iconStyle={{ background: '#0a2a88', color: '#fff' }}
                    icon={<FaRobot />}
                >
                    <h3>CAD TEAMS</h3>
                    <p>Calculations, CAD, Analysis, Optimisation</p>
                    <h3>OTHER TEAMS</h3>
                    <p>Read necessary theory, best practices</p>
                </VerticalTimelineElement>

                {/* 19TH JAN TO 25TH JAN */}
                <VerticalTimelineElement
                    date="19TH JAN TO 25TH JAN"
                    contentStyle={{ background: '#0a2a88', color: '#fff' }}
                    contentArrowStyle={{ borderRight: '7px solid #0a2a88' }}
                    iconStyle={{ background: '#0a2a88', color: '#fff' }}
                    icon={<FaWrench />}
                >
                    <h3>FAB/LOG TEAM</h3>
                    <p>Round 1 report submission</p>
                    <h3>PR/F TEAM</h3>
                    <p>Admin budget proposal</p>
                </VerticalTimelineElement>

                {/* 26TH JAN TO 8TH FEB */}
                <VerticalTimelineElement
                    date="26TH JAN TO 8TH FEB"
                    contentStyle={{ background: '#0a2a88', color: '#fff' }}
                    contentArrowStyle={{ borderRight: '7px solid #0a2a88' }}
                    iconStyle={{ background: '#0a2a88', color: '#fff' }}
                    icon={<FaRobot />}
                >
                    <h3>OFFSEASON</h3>
                </VerticalTimelineElement>

                {/* 9TH TO 12TH FEB */}
                <VerticalTimelineElement
                    date="9TH TO 12TH FEB"
                    contentStyle={{ background: '#0a2a88', color: '#fff' }}
                    contentArrowStyle={{ borderRight: '7px solid #0a2a88' }}
                    iconStyle={{ background: '#0a2a88', color: '#fff' }}
                    icon={<FaWrench />}
                >
                    <h3>E/C TEAM</h3>
                    <p>Component selection</p>
                    <h3>FAB/LOG TEAM</h3>
                    <p>Product sourcing document</p>
                </VerticalTimelineElement>

                {/* 13TH TO 15TH FEB */}
                <VerticalTimelineElement
                    date="13TH TO 15TH FEB"
                    contentStyle={{ background: '#0a2a88', color: '#fff' }}
                    contentArrowStyle={{ borderRight: '7px solid #0a2a88' }}
                    iconStyle={{ background: '#0a2a88', color: '#fff' }}
                    icon={<FaWrench />}
                >
                    <h3>Round 1 Result</h3>
                    <p>Bugging admin, placing orders</p>
                </VerticalTimelineElement>

                {/* 16TH FEB TO 29TH MARCH */}
                <VerticalTimelineElement
                    date="16TH FEB TO 29TH MARCH"
                    contentStyle={{ background: '#0a2a88', color: '#fff' }}
                    contentArrowStyle={{ borderRight: '7px solid #0a2a88' }}
                    iconStyle={{ background: '#0a2a88', color: '#fff' }}
                    icon={<FaRobot />}
                >
                    <h3>FAB/LOG TEAM</h3>
                    <p>Build, test, optimise bot</p>
                    <h3>Programming & E/C Team</h3>
                    <p>Write code</p>
                    <h3>PR/F Team</h3>
                    <p>Make and submit video</p>
                </VerticalTimelineElement>

                {/* 30TH MARCH TO 19TH APRIL */}
                <VerticalTimelineElement
                    date="30TH MARCH TO 19TH APRIL"
                    contentStyle={{ background: '#0a2a88', color: '#fff' }}
                    contentArrowStyle={{ borderRight: '7px solid #0a2a88' }}
                    iconStyle={{ background: '#0a2a88', color: '#fff' }}
                    icon={<FaWrench />}
                >
                    <h3>OFFSEASON</h3>
                </VerticalTimelineElement>

                {/* 15TH MAY */}
                <VerticalTimelineElement
                    date="15TH MAY"
                    contentStyle={{ background: '#0a2a88', color: '#fff' }}
                    contentArrowStyle={{ borderRight: '7px solid #0a2a88' }}
                    iconStyle={{ background: '#0a2a88', color: '#fff' }}
                    icon={<FaFlagCheckered />}
                >
                    <h3>Round 2 Result</h3>
                </VerticalTimelineElement>

            </VerticalTimeline>
        </div>
    );
};

export default RoboconTimeline;
