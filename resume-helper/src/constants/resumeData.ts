/**
 * Sample resume data for the prototype
 */

import type { ResumeData } from '../types';

export const sampleResumeData: ResumeData = {
  header: {
    id: 'header-1',
    section: 'header',
    title: 'Header',
    content: `<p>John Doe | Software Engineer | New York, NY | (123) 456-7890 | john.doe@email.com | linkedin.com/in/johndoe | github.com/johndoe</p>`,
    isConfirmed: false,
    order: 0,
  },
  projects: {
    id: 'projects-1',
    section: 'projects',
    title: 'Projects',
    content: `<h4>E-Commerce Platform</h4>
              <p><em>Full-Stack Web Application | React, Node.js, PostgreSQL | March 2023</em></p>
              <ul>
                <li>Built a responsive e-commerce platform with user authentication and payment processing</li>
                <li>Implemented real-time inventory management system reducing stock discrepancies by 30%</li>
                <li>Deployed on AWS with CI/CD pipeline, achieving 99.9% uptime</li>
              </ul>
              
              <h4>Task Management Mobile App</h4>
              <p><em>React Native, Firebase | January 2023</em></p>
              <ul>
                <li>Developed cross-platform mobile app with offline synchronization capabilities</li>
                <li>Integrated push notifications increasing user engagement by 45%</li>
                <li>Published on both iOS and Android app stores with 4.8+ star rating</li>
              </ul>`,
    isConfirmed: false,
    order: 1,
  },
  skills: {
    id: 'skills-1',
    section: 'skills',
    title: 'Technical Skills',
    content: `<p><strong>Languages:</strong> JavaScript (ES6+), TypeScript, Python, HTML5, CSS3</p>
              <p><strong>Frameworks/Libraries:</strong> React, Node.js, Express, Next.js</p>
              <p><strong>Databases:</strong> PostgreSQL, MongoDB, Redis</p>
              <p><strong>Cloud/DevOps:</strong> AWS (EC2, S3, Lambda), Docker, Jenkins, Git</p>`,
    isConfirmed: false,
    order: 2,
  },
  experience: {
    id: 'experience-1',
    section: 'experience',
    title: 'Experience',
    content: `<h4>Senior Software Engineer</h4>
              <p><em>Tech Solutions Inc. | New York, NY | June 2020 - Present</em></p>
              <ul>
                <li>Led the development of a new microservices architecture, improving system scalability by 40%.</li>
                <li>Engineered a real-time data processing pipeline using AWS Lambda and Kinesis.</li>
                <li>Mentored 3 junior engineers, fostering a culture of collaboration and code quality.</li>
              </ul>`,
    isConfirmed: false,
    order: 3,
  },
  education: {
    id: 'education-1',
    section: 'education',
    title: 'Education',
    content: `<h4>B.S. in Computer Science</h4>
              <p><em>State University | Anytown, USA | Graduated May 2018</em></p>
              <p><strong>Relevant Coursework:</strong> Data Structures, Algorithms, Web Development, Database Systems</p>`,
    isConfirmed: false,
    order: 4,
  },
};
