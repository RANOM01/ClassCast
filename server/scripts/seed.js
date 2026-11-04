import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { User } from '../src/models/User.js';
import { Course } from '../src/models/Course.js';
import { Enrollment } from '../src/models/Enrollment.js';
import { Assignment } from '../src/models/Assignment.js';
import { Submission } from '../src/models/Submission.js';
import { Quiz } from '../src/models/Quiz.js';
import { QuizAttempt } from '../src/models/QuizAttempt.js';
import { Announcement } from '../src/models/Announcement.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/classcast';

async function seed() {
  console.log(`[ClassCast Seed] Connecting to MongoDB at: ${MONGODB_URI}`);
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('[ClassCast Seed] Connected successfully. Initializing idempotent demo data...');

    const defaultPassword = 'Password123!';
    const passwordHash = await User.hashPassword(defaultPassword);

    // 1. Seed Instructors
    const instructor1Data = {
      name: 'Dr. Elena Vance',
      email: 'elena@classcast.dev',
      passwordHash,
      role: 'Instructor',
      headline: 'Distinguished Professor of Distributed Systems & Fault Tolerance',
      avatarPreset: 'emerald-orb',
    };

    const instructor2Data = {
      name: 'Marcus Sterling',
      email: 'marcus@classcast.dev',
      passwordHash,
      role: 'Instructor',
      headline: 'Senior Graphics Architect & Real-Time Systems Specialist',
      avatarPreset: 'cyan-spark',
    };

    const instructor1 = await User.findOneAndUpdate(
      { email: instructor1Data.email },
      { $set: instructor1Data },
      { upsert: true, new: true }
    );

    const instructor2 = await User.findOneAndUpdate(
      { email: instructor2Data.email },
      { $set: instructor2Data },
      { upsert: true, new: true }
    );

    console.log(`[ClassCast Seed] Seeded Instructors: ${instructor1.name}, ${instructor2.name}`);

    // 2. Seed Students
    const student1Data = {
      name: 'Liam Chen',
      email: 'liam@classcast.dev',
      passwordHash,
      role: 'Student',
      headline: 'Systems Engineering Graduate Student',
      avatarPreset: 'purple-aura',
    };

    const student2Data = {
      name: 'Sophia Morales',
      email: 'sophia@classcast.dev',
      passwordHash,
      role: 'Student',
      headline: 'Backend Infrastructure Specialist',
      avatarPreset: 'amber-glow',
    };

    // Alex Rivera is INTENTIONALLY UNENROLLED from Elena Vance's Featured Course!
    const student3Data = {
      name: 'Alex Rivera',
      email: 'alex@classcast.dev',
      passwordHash,
      role: 'Student',
      headline: 'Software Engineer & Lifelong Learner',
      avatarPreset: 'rose-prism',
    };

    const student4Data = {
      name: 'Maya Patel',
      email: 'maya@classcast.dev',
      passwordHash,
      role: 'Student',
      headline: 'Graphics Computing Enthusiast',
      avatarPreset: 'emerald-orb',
    };

    const student1 = await User.findOneAndUpdate(
      { email: student1Data.email },
      { $set: student1Data },
      { upsert: true, new: true }
    );
    const student2 = await User.findOneAndUpdate(
      { email: student2Data.email },
      { $set: student2Data },
      { upsert: true, new: true }
    );
    const student3 = await User.findOneAndUpdate(
      { email: student3Data.email },
      { $set: student3Data },
      { upsert: true, new: true }
    );
    const student4 = await User.findOneAndUpdate(
      { email: student4Data.email },
      { $set: student4Data },
      { upsert: true, new: true }
    );

    console.log(`[ClassCast Seed] Seeded Students: ${student1.name}, ${student2.name}, ${student3.name} (Unenrolled demo student), ${student4.name}`);

    // 3. Seed Courses
    // Course 1: Elena Vance's Featured Published Course
    const course1Data = {
      title: 'Distributed Systems: Consensus & Fault Tolerance',
      shortDescription: 'Master the rigorous mathematical principles, consensus algorithms, and fault-tolerant architectures underlying modern global clouds.',
      fullDescription: `Distributed systems form the backbone of modern global infrastructure. In this comprehensive masterclass, you will explore consensus protocols, network partitions, vector clocks, and crash-recovery models.\n\nFrom Paxos to Raft and Byzantine fault tolerance, this curriculum combines foundational theory with practical implementation exercises.`,
      category: 'Computer Science',
      level: 'Advanced',
      language: 'English',
      coverPreset: 'preset-cyber-grid',
      learningObjectives: [
        'Understand linearizability, sequential consistency, and PACELC trade-offs',
        'Implement leader election and log replication using the Raft consensus algorithm',
        'Analyze Byzantine fault tolerance and quorum slicing mechanisms',
        'Design conflict-free replicated data types (CRDTs) for partitioned clusters',
      ],
      prerequisites: [
        'Solid proficiency in concurrent programming or systems languages',
        'Basic understanding of TCP/IP networking and socket programming',
      ],
      status: 'published',
      instructor: instructor1._id,
      modules: [
        {
          title: 'Module 1: Foundations of Distributed Consistency',
          order: 0,
          lessons: [
            {
              title: 'The CAP Theorem & PACELC Classification',
              text: `Every distributed data store must choose how to navigate trade-offs between consistency, availability, and partition tolerance. When network partitions occur, systems must prioritize either strict consistency or high availability.\n\nKey Takeaway: The PACELC theorem expands on CAP by analyzing system behavior both during network partitions (PC/PA) and under normal operation (EL/EC - Else Latency or Consistency).`,
              videoUrl: 'https://www.youtube.com/watch?v=k-Yaq8AHlFA',
              resourceLinks: [
                { title: 'Brewer\'s CAP Conjecture (Official Paper)', url: 'https://users.ece.cmu.edu/~adrian/731-sp04/readings/GL-cap.pdf' },
                { title: 'PACELC Theorem Overview', url: 'https://en.wikipedia.org/wiki/PACELC_theorem' },
              ],
              order: 0,
            },
            {
              title: 'Vector Clocks and Causality Tracking',
              text: `Physical clocks in distributed systems cannot be relied upon for exact event ordering due to clock drift and relativistic latency. Leslie Lamport introduced logical clocks, which were subsequently generalized into Vector Clocks.\n\nA vector clock is an array of logical timestamps maintained by each node, allowing precise identification of whether two events are causally related or concurrent.`,
              videoUrl: '',
              resourceLinks: [
                { title: 'Lamport Timestamps Paper', url: 'https://lamport.azurewebsites.net/pubs/time-clocks.pdf' },
              ],
              order: 1,
            },
            {
              title: 'Byzantine Fault Tolerance & The General Problem',
              text: `In Byzantine environments, components may fail arbitrarily and exhibit malicious or conflicting behavior. Reaching agreement requires a supermajority of non-faulty nodes (3f + 1 total nodes to tolerate f Byzantine failures).`,
              videoUrl: '',
              resourceLinks: [
                { title: 'Byzantine Generals Paper (Lamport, Shostak, Pease)', url: 'https://www.microsoft.com/en-us/research/publication/byzantine-generals-problem/' },
              ],
              order: 2,
            },
          ],
        },
        {
          title: 'Module 2: Consensus Under Network Partitions',
          order: 1,
          lessons: [
            {
              title: 'The Raft Protocol: Leader Election & Heartbeats',
              text: `Raft decomposes consensus into explicit sub-problems: leader election, log replication, and safety. Nodes transition between Follower, Candidate, and Leader states governed by randomized election timeouts.`,
              videoUrl: 'https://www.youtube.com/watch?v=vYp4LYbnnW8',
              resourceLinks: [
                { title: 'The Raft Paper (Ongaro & Ousterhout)', url: 'https://raft.github.io/raft.pdf' },
                { title: 'Interactive Raft Simulator', url: 'https://thesecretlivesofdata.com/raft/' },
              ],
              order: 0,
            },
            {
              title: 'Split-Brain Mitigation & Quorum Quotas',
              text: `Preventing split-brain scenarios requires strict majority quorums (floor(N/2) + 1). Nodes on the minority side of a partition recognize their inability to reach consensus and gracefully reject writes.`,
              videoUrl: '',
              resourceLinks: [],
              order: 1,
            },
          ],
        },
      ],
    };

    // Course 2: Elena Vance's Unpublished Draft
    const course2Data = {
      title: 'Quantum Computing Algorithms & Cryptography',
      shortDescription: 'Explore quantum circuits, Shor\'s algorithm, Grover\'s search, and post-quantum cryptographic primitives.',
      fullDescription: 'An experimental draft exploring the frontiers of quantum computing, state superposition, and lattice-based post-quantum cryptography.',
      category: 'Computer Science',
      level: 'Advanced',
      language: 'English',
      coverPreset: 'preset-quantum-orb',
      learningObjectives: [
        'Formulate quantum logic gates (Hadamard, CNOT, Phase)',
        'Simulate quantum circuits using statevector mathematics',
      ],
      prerequisites: ['Linear Algebra & Complex Analysis'],
      status: 'draft', // MUST BE DRAFT
      instructor: instructor1._id,
      modules: [
        {
          title: 'Module 1: Qubits and Superposition',
          order: 0,
          lessons: [
            {
              title: 'Introduction to Bloch Sphere & Pure States',
              text: 'The state of a single qubit can be represented geometrically as a point on the unit sphere called the Bloch Sphere.',
              videoUrl: '',
              resourceLinks: [],
              order: 0,
            },
          ],
        },
      ],
    };

    // Course 3: Marcus Sterling's Published Course
    const course3Data = {
      title: 'Modern WebGL & High-Performance Shader Systems',
      shortDescription: 'Construct hyper-realistic GPU-accelerated graphics, raymarchers, and particle simulations directly in the browser.',
      fullDescription: 'From vertex transformations to signed distance field raymarching, learn the inner workings of GPU pipelines, fragment shaders, and procedural material generation.',
      category: 'Web Development',
      level: 'Intermediate',
      language: 'English',
      coverPreset: 'preset-neon-matrix',
      learningObjectives: [
        'Master the programmable graphics pipeline (GLSL ES 3.0)',
        'Implement raymarching and volumetric lighting techniques',
        'Optimize compute workloads and buffer allocations',
      ],
      prerequisites: ['Proficiency with JavaScript and basic 3D vector math'],
      status: 'published',
      instructor: instructor2._id,
      modules: [
        {
          title: 'Module 1: The Modern Graphics Pipeline',
          order: 0,
          lessons: [
            {
              title: 'Buffer Objects and Attribute Bindings',
              text: 'Modern graphics pipelines transfer vertex buffers, element index arrays, and uniform buffers from CPU host memory to dedicated high-bandwidth VRAM.',
              videoUrl: '',
              resourceLinks: [
                { title: 'WebGL 2.0 Specification', url: 'https://registry.khronos.org/webgl/specs/latest/2.0/' },
              ],
              order: 0,
            },
            {
              title: 'Fragment Shading & Procedural Noise',
              text: 'Fragment shaders execute concurrently across millions of pixels. Using Perlin and Simplex noise algorithms, we can generate dynamic fluid landscapes and terrain.',
              videoUrl: '',
              resourceLinks: [],
              order: 1,
            },
          ],
        },
      ],
    };

    const course1 = await Course.findOneAndUpdate(
      { title: course1Data.title },
      { $set: course1Data },
      { upsert: true, new: true }
    );

    const course2 = await Course.findOneAndUpdate(
      { title: course2Data.title },
      { $set: course2Data },
      { upsert: true, new: true }
    );

    const course3 = await Course.findOneAndUpdate(
      { title: course3Data.title },
      { $set: course3Data },
      { upsert: true, new: true }
    );

    console.log(`[ClassCast Seed] Seeded Courses:\n - ${course1.title} (${course1.status})\n - ${course2.title} (${course2.status})\n - ${course3.title} (${course3.status})`);

    // 4. Seed Enrollments
    // Enrolled in Course 1: Liam Chen (completed 1 lesson) and Sophia Morales (completed 2 lessons)
    // NOTE: Alex Rivera is deliberately NOT ENROLLED in Course 1!
    const c1Mod1Lessons = course1.modules[0].lessons;
    const c1Lesson1Id = c1Mod1Lessons[0]._id;
    const c1Lesson2Id = c1Mod1Lessons[1]._id;

    const enr1 = await Enrollment.findOneAndUpdate(
      { student: student1._id, course: course1._id },
      {
        $set: {
          registeredAt: new Date(Date.now() - 7 * 86400000),
          completedLessonIds: [c1Lesson1Id],
          lastViewedLessonId: c1Lesson2Id,
          lastActivityAt: new Date(Date.now() - 2 * 86400000),
        },
      },
      { upsert: true, new: true }
    );

    const enr2 = await Enrollment.findOneAndUpdate(
      { student: student2._id, course: course1._id },
      {
        $set: {
          registeredAt: new Date(Date.now() - 10 * 86400000),
          completedLessonIds: [c1Lesson1Id, c1Lesson2Id],
          lastViewedLessonId: c1Lesson2Id,
          lastActivityAt: new Date(Date.now() - 1 * 86400000),
        },
      },
      { upsert: true, new: true }
    );

    // Enroll Alex Rivera & Maya Patel in Course 3
    const c3Lesson1Id = course3.modules[0].lessons[0]._id;
    const enr3 = await Enrollment.findOneAndUpdate(
      { student: student3._id, course: course3._id },
      {
        $set: {
          registeredAt: new Date(Date.now() - 5 * 86400000),
          completedLessonIds: [c3Lesson1Id],
          lastViewedLessonId: c3Lesson1Id,
          lastActivityAt: new Date(Date.now() - 3 * 86400000),
        },
      },
      { upsert: true, new: true }
    );

    const enr4 = await Enrollment.findOneAndUpdate(
      { student: student4._id, course: course3._id },
      {
        $set: {
          registeredAt: new Date(Date.now() - 4 * 86400000),
          completedLessonIds: [],
          lastViewedLessonId: c3Lesson1Id,
          lastActivityAt: null, // "Not started" demo!
        },
      },
      { upsert: true, new: true }
    );

    console.log(`[ClassCast Seed] Seeded Enrollments: Liam and Sophia in Course 1. Alex and Maya in Course 3.`);

    // 5. Seed Assignments for Course 1
    const asgn1Data = {
      course: course1._id,
      instructor: instructor1._id,
      title: 'Implement Raft Leader Election Protocol',
      instructions: `In this assignment, you must write a simulated Node.js cluster supporting the Raft consensus leader election.\n\nRequirements:\n1. Randomized election timeouts (150ms-300ms)\n2. Heartbeat broadcasts from elected leader\n3. Majority vote collection before transitioning to Leader state.\n\nPlease provide your implementation code and an optional link to your GitHub repository.`,
      maxMarks: 100,
      deadline: new Date(Date.now() + 14 * 86400000), // Future deadline
      timezone: 'UTC',
      status: 'published',
    };

    const asgn2Data = {
      course: course1._id,
      instructor: instructor1._id,
      title: 'Vector Clocks Causality Analysis',
      instructions: `Analyze an asynchronous messaging sequence with 4 nodes. Compute vector clock values at each step and identify concurrent and causal dependencies. Submit your analysis text or PDF report link.`,
      maxMarks: 50,
      deadline: new Date(Date.now() - 2 * 86400000), // Past deadline
      timezone: 'UTC',
      status: 'published',
    };

    const asgn1 = await Assignment.findOneAndUpdate(
      { course: course1._id, title: asgn1Data.title },
      { $set: asgn1Data },
      { upsert: true, new: true }
    );

    const asgn2 = await Assignment.findOneAndUpdate(
      { course: course1._id, title: asgn2Data.title },
      { $set: asgn2Data },
      { upsert: true, new: true }
    );

    console.log(`[ClassCast Seed] Seeded Assignments for Course 1: '${asgn1.title}' and '${asgn2.title}'`);

    // 6. Seed Submissions (Mix of ungraded and returned work!)
    // Submission 1: Liam submitted Assignment 1 -> UNGRADED (pending review in instructor dashboard)
    await Submission.findOneAndUpdate(
      { assignment: asgn1._id, student: student1._id },
      {
        $set: {
          course: course1._id,
          textResponse: `// Raft Node Implementation\nclass RaftNode {\n  constructor(id, peers) {\n    this.id = id;\n    this.state = 'Follower';\n    this.currentTerm = 0;\n    this.votedFor = null;\n  }\n  startElection() {\n    this.state = 'Candidate';\n    this.currentTerm += 1;\n    this.votedFor = this.id;\n  }\n}`,
          projectUrl: 'https://github.com/liam-systems/raft-node-demo',
          status: 'submitted',
          marksAwarded: null, // Ungraded!
          feedback: '',
          submittedAt: new Date(Date.now() - 1 * 86400000),
          gradedAt: null,
        },
      },
      { upsert: true, new: true }
    );

    // Submission 2: Sophia submitted Assignment 2 -> GRADED (returned with feedback)
    await Submission.findOneAndUpdate(
      { assignment: asgn2._id, student: student2._id },
      {
        $set: {
          course: course1._id,
          textResponse: `Analysis of Vector Clock concurrency:\nIn node cluster [N1, N2, N3, N4], event E1 at N1 generated timestamp [1,0,0,0].\nMessage receipt at N3 merged timestamps: max([0,0,1,0], [1,0,0,0]) + 1 -> [1,0,2,0].\nEvents E3 and E4 are concurrent because neither vector dominates the other.`,
          projectUrl: 'https://github.com/sophia-m/vector-clocks-proof',
          status: 'graded',
          marksAwarded: 48, // Graded: 48 / 50
          feedback: 'Outstanding rigor in verifying vector clock dominance. Excellent handling of concurrent intervals.',
          submittedAt: new Date(Date.now() - 3 * 86400000),
          gradedAt: new Date(Date.now() - 1 * 86400000),
        },
      },
      { upsert: true, new: true }
    );

    console.log(`[ClassCast Seed] Seeded Submissions: Liam's Raft submission (ungraded), Sophia's Vector Clock submission (graded: 48/50).`);

    // 7. Seed Quizzes for Course 1
    const quiz1Data = {
      course: course1._id,
      instructor: instructor1._id,
      title: 'Consensus Protocols & CAP Theorem Mastery',
      description: 'Test your understanding of distributed consensus, network partitions, and quorum rules.',
      status: 'published',
      questions: [
        {
          prompt: 'Under the PACELC theorem, what does the \'EL\' stand for when a partition is NOT occurring?',
          options: [
            'Else Latency (trade-off between Latency and Consistency)',
            'Eventual Linearizability',
            'Election Leadership',
            'Epoch Locking',
          ],
          correctOptionIndex: 0,
          points: 10,
        },
        {
          prompt: 'In a Raft cluster of 5 nodes, what is the minimum quorum needed to elect a leader or commit an entry?',
          options: [
            '2 nodes',
            '3 nodes (majority: floor(5/2) + 1)',
            '4 nodes',
            'All 5 nodes',
          ],
          correctOptionIndex: 1,
          points: 10,
        },
        {
          prompt: 'How many total nodes are required in a Byzantine fault tolerant system to tolerate f arbitrary/Byzantine failures?',
          options: [
            '2f + 1 nodes',
            '3f nodes',
            '3f + 1 nodes',
            '4f + 1 nodes',
          ],
          correctOptionIndex: 2,
          points: 10,
        },
      ],
    };

    const quiz1 = await Quiz.findOneAndUpdate(
      { course: course1._id, title: quiz1Data.title },
      { $set: quiz1Data },
      { upsert: true, new: true }
    );

    console.log(`[ClassCast Seed] Seeded Quiz: '${quiz1.title}' with 3 questions (30 total points).`);

    // 8. Seed Quiz Attempt for Liam Chen
    const q1Questions = quiz1.questions;
    await QuizAttempt.findOneAndUpdate(
      { quiz: quiz1._id, student: student1._id },
      {
        $set: {
          course: course1._id,
          answers: [
            {
              questionId: q1Questions[0]._id,
              selectedOptionIndex: 0,
              isCorrect: true,
              pointsEarned: 10,
            },
            {
              questionId: q1Questions[1]._id,
              selectedOptionIndex: 1,
              isCorrect: true,
              pointsEarned: 10,
            },
            {
              questionId: q1Questions[2]._id,
              selectedOptionIndex: 2,
              isCorrect: true,
              pointsEarned: 10,
            },
          ],
          marksEarned: 30,
          maxMarks: 30,
          percentage: 100,
          submittedAt: new Date(Date.now() - 2 * 86400000),
        },
      },
      { upsert: true, new: true }
    );

    console.log(`[ClassCast Seed] Seeded Quiz Attempt: Liam Chen scored 30/30 (100%) on Quiz 1.`);

    // 9. Seed Announcements
    const ann1Data = {
      course: course1._id,
      instructor: instructor1._id,
      title: 'Welcome to Distributed Systems - Fall Cohort',
      content: 'Welcome everyone! We will be hosting interactive protocol simulation office hours on Thursdays. Please ensure you review Module 1 before our first lab.',
      status: 'published',
      createdAt: new Date(Date.now() - 7 * 86400000),
    };

    const ann2Data = {
      course: course1._id,
      instructor: instructor1._id,
      title: 'Raft Assignment 1 Released: Read the Spec Carefully',
      content: 'Assignment 1 (Raft Leader Election) is now live. Pay special attention to randomized election timers to avoid split votes.',
      status: 'published',
      createdAt: new Date(Date.now() - 3 * 86400000),
    };

    await Announcement.findOneAndUpdate(
      { course: course1._id, title: ann1Data.title },
      { $set: ann1Data },
      { upsert: true, new: true }
    );
    await Announcement.findOneAndUpdate(
      { course: course1._id, title: ann2Data.title },
      { $set: ann2Data },
      { upsert: true, new: true }
    );

    console.log('[ClassCast Seed] Seed completed successfully!');
    console.log('========================================================================');
    console.log('ClassCast Seed Summary:');
    console.log('Instructors:');
    console.log('  1. Dr. Elena Vance (elena@classcast.dev / Password123!)');
    console.log('  2. Marcus Sterling (marcus@classcast.dev / Password123!)');
    console.log('Featured Course:');
    console.log('  "Distributed Systems: Consensus & Fault Tolerance" (Instructor: Dr. Elena Vance)');
    console.log('Unenrolled Demo Student:');
    console.log('  Alex Rivera (alex@classcast.dev / Password123!)');
    console.log('  -> Alex is NOT enrolled in Elena Vance\'s course, ready for live registration test!');
    console.log('Other Students:');
    console.log('  - Liam Chen (liam@classcast.dev / Password123!) [Enrolled in Course 1]');
    console.log('  - Sophia Morales (sophia@classcast.dev / Password123!) [Enrolled in Course 1]');
    console.log('  - Maya Patel (maya@classcast.dev / Password123!) [Enrolled in Course 3]');
    console.log('========================================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[ClassCast Seed] Error seeding database:', err);
    process.exit(1);
  }
}

seed();
