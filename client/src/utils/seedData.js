/**
 * seedData.js
 * ---------------------------------------------------------------------------
 * Creates the demo dataset on first launch: 3 demo accounts, 26 subjects,
 * 10 cities, 16 tutors, 10 students, requirements, applications, requests,
 * reviews, favourites, notifications and reports.
 *
 * The data is intentionally written out (rather than generated randomly) so the
 * demo looks the same on every machine and screenshots stay consistent.
 */

import { setData, getData, getAll, resetAll, KEYS } from './storage.js';
import { CLASS_LEVELS } from './helpers.js';

/* ----------------------------- subjects ----------------------------- */

export const SUBJECTS = [
  { id: 'subject_001', name: 'Mathematics', category: 'Core' },
  { id: 'subject_002', name: 'Physics', category: 'Science' },
  { id: 'subject_003', name: 'Chemistry', category: 'Science' },
  { id: 'subject_004', name: 'Biology', category: 'Science' },
  { id: 'subject_005', name: 'English', category: 'Language' },
  { id: 'subject_006', name: 'Computer Science', category: 'Technology' },
  { id: 'subject_007', name: 'Hindi', category: 'Language' },
  { id: 'subject_008', name: 'Social Science', category: 'Core' },
  { id: 'subject_009', name: 'Economics', category: 'Commerce' },
  { id: 'subject_010', name: 'Accountancy', category: 'Commerce' },
  { id: 'subject_011', name: 'Statistics', category: 'Core' },
  { id: 'subject_012', name: 'Geography', category: 'Core' },
  { id: 'subject_013', name: 'History', category: 'Core' },
  { id: 'subject_014', name: 'Information Technology', category: 'Technology' },
  { id: 'subject_015', name: 'Spanish', category: 'Language' },
  { id: 'subject_016', name: 'Sanskrit', category: 'Language' },
  { id: 'subject_017', name: 'Psychology', category: 'Core' },
  { id: 'subject_018', name: 'Business Studies', category: 'Commerce' },
  { id: 'subject_019', name: 'Physical Education', category: 'Sports' },
  { id: 'subject_020', name: 'Drawing', category: 'Creative' },
  { id: 'subject_021', name: 'Music', category: 'Creative' },
  { id: 'subject_022', name: 'Robotics', category: 'Technology' },
  { id: 'subject_023', name: 'Sociology', category: 'Core' },
  { id: 'subject_024', name: 'Political Science', category: 'Core' },
  { id: 'subject_025', name: 'Marathi', category: 'Language' },
  { id: 'subject_026', name: 'French', category: 'Language' },
];

/* ------------------------------ master data ------------------------------ */

export const CITIES = [
  { id: 'city_001', name: 'Bangalore', state: 'Karnataka', localities: ['Koramangala', 'Whitefield', 'Indiranagar', 'Jayanagar', 'HSR Layout'] },
  { id: 'city_002', name: 'Hyderabad', state: 'Telangana', localities: ['Gachibowli', 'Kondapur', 'Madhapur', 'Jubilee Hills'] },
  { id: 'city_003', name: 'Chennai', state: 'Tamil Nadu', localities: ['Adyar', 'Anna Nagar', 'Velachery', 'T Nagar'] },
  { id: 'city_004', name: 'Vijayawada', state: 'Andhra Pradesh', localities: ['Benz Circle', 'Kankipadu', 'Kanaparthi'] },
  { id: 'city_005', name: 'Mumbai', state: 'Maharashtra', localities: ['Andheri', 'Powai', 'Bandra', 'Thane'] },
  { id: 'city_006', name: 'Delhi', state: 'Delhi', localities: ['Dwarka', 'Rohini', 'Saket', 'Karol Bagh'] },
  { id: 'city_007', name: 'Pune', state: 'Maharashtra', localities: ['Kothrud', 'Hinjewadi', 'Koregaon Park', 'Viman Nagar'] },
  { id: 'city_008', name: 'Ahmedabad', state: 'Gujarat', localities: ['Satellite', 'Prahlad Nagar', 'Navrangpura'] },
  { id: 'city_009', name: 'Kolkata', state: 'West Bengal', localities: ['Salt Lake', 'Gariahat', 'Behala'] },
  { id: 'city_010', name: 'Jaipur', state: 'Rajasthan', localities: ['Malviya Nagar', 'Vaishali Nagar', 'C-Scheme'] },
];

const city = (id) => CITIES.find((c) => c.id === id);
const subject = (id) => SUBJECTS.find((s) => s.id === id);
const day = (n) => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][n];

/* ------------------------------ tutors ------------------------------ */

const TUTOR_SEED = [
  {
    user: ['Anita Sharma', 'anita.sharma@demo.com', 'female', 'city_001', 'Koramangala'],
    profile: {
      headline: 'Mathematics and Physics tutor for board exam success',
      about:
        'I have been teaching Class 9 to 12 students for the last 9 years, with a focus on board exam preparation. My method is simple: build the concept, practise it together, then test it. Parents receive a short progress note after every class.',
      subjects: ['subject_001', 'subject_002', 'subject_011'],
      classes: ['Class 9', 'Class 10', 'Class 11', 'Class 12'],
      experience: 9,
      hourly: 350,
      monthly: 7000,
      modes: ['online', 'offline'],
      languages: ['English', 'Hindi', 'Kannada'],
      qualifications: [
        { degree: 'M.Sc Mathematics', institution: 'Bangalore University', year: 2014 },
        { degree: 'B.Ed', institution: 'Bangalore University', year: 2015 },
      ],
      verified: true,
      rating: [4.8, 23],
    },
  },
  {
    user: ['Rohit Verma', 'rohit.verma@demo.com', 'male', 'city_001', 'Whitefield'],
    profile: {
      headline: 'Physics made simple for Class 11 and 12 students',
      about:
        'Physics feels difficult only until the basics are clear. I spend the first month strengthening fundamentals, then move to board-level problems and previous year questions. Online classes on a shared whiteboard work very well.',
      subjects: ['subject_002', 'subject_003', 'subject_011'],
      classes: ['Class 11', 'Class 12'],
      experience: 7,
      hourly: 400,
      monthly: 8500,
      modes: ['online'],
      languages: ['English', 'Hindi'],
      qualifications: [{ degree: 'M.Tech Electronics', institution: 'IISc Bangalore', year: 2013 }],
      verified: true,
      rating: [4.9, 31],
    },
  },
  {
    user: ['Priya Menon', 'priya.menon@demo.com', 'female', 'city_002', 'Gachibowli'],
    profile: {
      headline: 'Chemistry made memorable for board and NEET students',
      about:
        'I teach Class 10 to 12 chemistry with a lot of visuals and real-world examples, because reactions are easier to remember when you can picture them. Regular revision sheets are included in the monthly fee.',
      subjects: ['subject_003', 'subject_004'],
      classes: ['Class 10', 'Class 11', 'Class 12'],
      experience: 6,
      hourly: 320,
      monthly: 6500,
      modes: ['online', 'offline'],
      languages: ['English', 'Hindi', 'Telugu', 'Malayalam'],
      qualifications: [
        { degree: 'M.Sc Chemistry', institution: 'Osmania University', year: 2016 },
        { degree: 'Certified NEET Mentor', institution: 'Unacademy', year: 2019 },
      ],
      verified: true,
      rating: [4.7, 18],
    },
  },
  {
    user: ['Suresh Reddy', 'suresh.reddy@demo.com', 'male', 'city_004', 'Benz Circle'],
    profile: {
      headline: 'Local Vijayawada tutor for Maths, Science and Telugu medium',
      about:
        'Twenty years of classroom teaching in Vijayawada, now offered as home tuition. I am comfortable with Telugu, English and Hindi medium students, and I focus on school syllabus first so that exams stop being stressful.',
      subjects: ['subject_001', 'subject_004', 'subject_002'],
      classes: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'],
      experience: 18,
      hourly: 200,
      monthly: 4000,
      modes: ['offline'],
      languages: ['Telugu', 'English', 'Hindi'],
      qualifications: [{ degree: 'M.Sc Mathematics', institution: 'Andhra University', year: 2006 }],
      verified: true,
      rating: [4.9, 41],
    },
  },
  {
    user: ['Fatima Khan', 'fatima.khan@demo.com', 'female', 'city_005', 'Andheri'],
    profile: {
      headline: 'English literature and grammar with a patient approach',
      about:
        'English is a subject where small, consistent practice beats long study hours. I work through one grammar topic and one text per class, and I am comfortable teaching students who find English difficult.',
      subjects: ['subject_005', 'subject_007'],
      classes: ['Class 6', 'Class 8', 'Class 9', 'Class 10'],
      experience: 8,
      hourly: 300,
      monthly: 6000,
      modes: ['online', 'offline'],
      languages: ['English', 'Hindi', 'Urdu'],
      qualifications: [{ degree: 'M.A English Literature', institution: 'University of Mumbai', year: 2015 }],
      verified: true,
      rating: [4.6, 27],
    },
  },
  {
    user: ['Vikram Iyer', 'vikram.iyer@demo.com', 'male', 'city_003', 'Adyar'],
    profile: {
      headline: 'Computer Science tutor: Python, Java and board IT',
      about:
        'I teach programming fundamentals before syntax, so students can reason about code rather than memorise it. For board IT subjects I follow the CBSE practical syllabus closely, including Python basics.',
      subjects: ['subject_006', 'subject_014'],
      classes: ['Class 9', 'Class 10', 'Class 11', 'Class 12'],
      experience: 5,
      hourly: 380,
      monthly: 7500,
      modes: ['online'],
      languages: ['English', 'Hindi', 'Tamil'],
      qualifications: [{ degree: 'B.Tech Information Technology', institution: 'Anna University', year: 2018 }],
      verified: true,
      rating: [4.8, 19],
    },
  },
  {
    user: ['Meera Nair', 'meera.nair@demo.com', 'female', 'city_003', 'Velachery'],
    profile: {
      headline: 'Biology for NEET and board students',
      about:
        'Biology has a lot to remember, so I use diagrams, flowcharts and short daily recall tests. Students who attend regularly find that the syllabus stops feeling overwhelming within a month.',
      subjects: ['subject_004', 'subject_003'],
      classes: ['Class 11', 'Class 12'],
      experience: 4,
      hourly: 300,
      monthly: 6000,
      modes: ['online', 'offline'],
      languages: ['English', 'Tamil', 'Malayalam'],
      qualifications: [{ degree: 'M.Sc Botany', institution: 'University of Madras', year: 2019 }],
      verified: true,
      rating: [4.5, 12],
    },
  },
  {
    user: ['Arjun Patel', 'arjun.patel@demo.com', 'male', 'city_006', 'Dwarka'],
    profile: {
      headline: 'Accountancy and Economics for Class 11 and 12',
      about:
        'Commerce students struggle most with application questions. I teach the theory, then immediately work through previous year board questions so the pattern becomes obvious. Doubling as a CA final student gives me a good handle on practical accounting too.',
      subjects: ['subject_010', 'subject_009', 'subject_018'],
      classes: ['Class 11', 'Class 12'],
      experience: 6,
      hourly: 350,
      monthly: 7500,
      modes: ['online'],
      languages: ['English', 'Hindi'],
      qualifications: [{ degree: 'CA Intermediate', institution: 'ICAI', year: 2020 }],
      verified: true,
      rating: [4.7, 16],
    },
  },
  {
    user: ['Deepa Rao', 'deepa.rao@demo.com', 'female', 'city_007', 'Kothrud'],
    profile: {
      headline: 'Social Science and History for Class 8 to 10',
      about:
        'I teach Social Science in a way students actually remember: maps, timelines, and case examples instead of only dates. I have been running small group classes from my society for the past six years.',
      subjects: ['subject_008', 'subject_013', 'subject_012'],
      classes: ['Class 8', 'Class 9', 'Class 10'],
      experience: 6,
      hourly: 250,
      monthly: 5000,
      modes: ['offline', 'online'],
      languages: ['Marathi', 'Hindi', 'English'],
      qualifications: [{ degree: 'M.A History', institution: 'SPPU', year: 2017 }],
      verified: true,
      rating: [4.6, 21],
    },
  },
  {
    user: ['Karan Bhatia', 'karan.bhatia@demo.com', 'male', 'city_002', 'Kondapur'],
    profile: {
      headline: 'Mathematics for competitive exams and Class 10 boards',
      about:
        'I focus on problem solving speed and accuracy. Every class ends with a timed set, because marks in mathematics come from practice under pressure rather than from theory alone.',
      subjects: ['subject_001', 'subject_011'],
      classes: ['Class 9', 'Class 10', 'Class 11'],
      experience: 10,
      hourly: 420,
      monthly: 9000,
      modes: ['online', 'offline'],
      languages: ['English', 'Hindi', 'Telugu'],
      qualifications: [{ degree: 'M.Sc Mathematics', institution: 'JNTU Hyderabad', year: 2012 }],
      verified: true,
      rating: [4.9, 38],
    },
  },
  {
    user: ['Sneha Joshi', 'sneha.joshi@demo.com', 'female', 'city_001', 'Jayanagar'],
    profile: {
      headline: 'Primary and middle school tutor with a caring approach',
      about:
        'For younger students, confidence matters more than syllabus coverage. I use worksheets and small games, and I send a short progress update to parents every fortnight.',
      subjects: ['subject_001', 'subject_005', 'subject_007'],
      classes: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'],
      experience: 5,
      hourly: 220,
      monthly: 4500,
      modes: ['offline', 'online'],
      languages: ['Kannada', 'English', 'Hindi'],
      qualifications: [{ degree: 'B.Ed', institution: 'Bangalore University', year: 2018 }],
      verified: false,
      rating: [4.4, 9],
    },
  },
  {
    user: ['Imran Sheikh', 'imran.sheikh@demo.com', 'male', 'city_005', 'Powai'],
    profile: {
      headline: 'Physics and Mathematics for ICSE students',
      about:
        'ICSE boards reward application, so most of my classes are spent solving problems rather than reading them. I also cover the practical and viva component for Class 10.',
      subjects: ['subject_002', 'subject_001'],
      classes: ['Class 9', 'Class 10'],
      experience: 11,
      hourly: 380,
      monthly: 7800,
      modes: ['online', 'offline'],
      languages: ['English', 'Hindi', 'Urdu'],
      qualifications: [{ degree: 'M.Sc Physics', institution: 'University of Mumbai', year: 2011 }],
      verified: true,
      rating: [4.8, 29],
    },
  },
  {
    user: ['Nandini Rao', 'nandini.rao@demo.com', 'female', 'city_004', 'Kankipadu'],
    profile: {
      headline: 'Statistics and Mathematics for Class 11 and 12',
      about:
        'Statistics becomes easy once students stop treating it as a formula memorisation exercise. I teach the reasoning behind each step and use real datasets wherever possible.',
      subjects: ['subject_011', 'subject_001'],
      classes: ['Class 11', 'Class 12'],
      experience: 4,
      hourly: 280,
      monthly: 5500,
      modes: ['online'],
      languages: ['Telugu', 'English'],
      qualifications: [{ degree: 'M.Sc Statistics', institution: 'Andhra University', year: 2020 }],
      verified: false,
      rating: [4.3, 7],
    },
  },
  {
    user: ['Rajesh Chauhan', 'rajesh.chauhan@demo.com', 'male', 'city_008', 'Satellite'],
    profile: {
      headline: 'Hindi and Sanskrit for regional and CBSE schools',
      about:
        'I teach Hindi grammar and literature at the Class 6 to 10 level, including Sanskrit for CBSE students. My classes include written practice because that is where marks are usually lost.',
      subjects: ['subject_007', 'subject_016'],
      classes: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'],
      experience: 15,
      hourly: 190,
      monthly: 3800,
      modes: ['offline'],
      languages: ['Hindi', 'Gujarati'],
      qualifications: [{ degree: 'M.A Hindi', institution: 'Gujarat University', year: 2008 }],
      verified: true,
      rating: [4.7, 34],
    },
  },
  {
    user: ['Tanvi Desai', 'tanvi.desai@demo.com', 'female', 'city_009', 'Salt Lake'],
    profile: {
      headline: 'Psychology and Sociology for Class 11 and 12',
      about:
        'These subjects reward genuine understanding rather than notes, so I spend a lot of time on theories applied to everyday examples and past paper questions.',
      subjects: ['subject_017', 'subject_023', 'subject_024'],
      classes: ['Class 11', 'Class 12'],
      experience: 5,
      hourly: 270,
      monthly: 5400,
      modes: ['online', 'offline'],
      languages: ['English', 'Hindi', 'Bengali'],
      qualifications: [{ degree: 'M.A Psychology', institution: 'University of Calcutta', year: 2019 }],
      verified: true,
      rating: [4.5, 11],
    },
  },
  {
    user: ['Aditya Kumar', 'aditya.kumar@demo.com', 'male', 'city_009', 'Gariahat'],
    profile: {
      headline: 'Information Technology and Robotics for school students',
      about:
        'I run hands-on sessions where students build small projects instead of only answering worksheets. Robotics classes include assembly and sensor programming for Class 8 and above.',
      subjects: ['subject_014', 'subject_022', 'subject_006'],
      classes: ['Class 8', 'Class 9', 'Class 10', 'Class 11'],
      experience: 7,
      hourly: 340,
      monthly: 7000,
      modes: ['offline', 'online'],
      languages: ['English', 'Hindi', 'Bengali'],
      qualifications: [{ degree: 'B.Tech Computer Science', institution: 'Jadavpur University', year: 2016 }],
      verified: false,
      rating: [4.2, 8],
    },
  },
];

/* ----------------------------- students ----------------------------- */

const STUDENT_SEED = [
  {
    user: ['Ananya Sharma', 'student@demo.com', 'female', 'city_001', 'Koramangala'],
    profile: { guardianName: 'Meenakshi Sharma', classLevel: 'Class 10', board: 'CBSE', subjects: ['Mathematics', 'Physics'], budgetMin: 3500, budgetMax: 9000, preferredMode: 'both', preferredDays: ['Monday', 'Wednesday'], preferredTime: 'evening' },
  },
  {
    user: ['Rahul Deshpande', 'rahul.d@example.com', 'male', 'city_001', 'Whitefield'],
    profile: { guardianName: 'Kavita Deshpande', classLevel: 'Class 9', board: 'ICSE', subjects: ['Mathematics', 'English'], budgetMin: 2500, budgetMax: 6000, preferredMode: 'offline', preferredDays: ['Tuesday', 'Thursday'], preferredTime: 'evening' },
  },
  {
    user: ['Sneha Kulkarni', 'sneha.k@example.com', 'female', 'city_002', 'Kondapur'],
    profile: { guardianName: 'Vaishali Kulkarni', classLevel: 'Class 12', board: 'CBSE', subjects: ['Chemistry', 'Physics'], budgetMin: 4000, budgetMax: 10000, preferredMode: 'online', preferredDays: ['Monday', 'Friday'], preferredTime: 'evening' },
  },
  {
    user: ['Praveen Reddy', 'praveen.reddy@example.com', 'male', 'city_004', 'Benz Circle'],
    profile: { guardianName: 'Lakshmi Reddy', classLevel: 'Class 8', board: 'State Board', subjects: ['Mathematics', 'Biology'], budgetMin: 2000, budgetMax: 5000, preferredMode: 'offline', preferredDays: ['Saturday'], preferredTime: 'morning' },
  },
  {
    user: ['Farhan Ali', 'farhan.ali@example.com', 'male', 'city_005', 'Andheri'],
    profile: { guardianName: 'Rukhsana Ali', classLevel: 'Class 10', board: 'CBSE', subjects: ['English', 'Hindi'], budgetMin: 3000, budgetMax: 8000, preferredMode: 'both', preferredDays: ['Monday', 'Saturday'], preferredTime: 'afternoon' },
  },
  {
    user: ['Divya Raman', 'divya.raman@example.com', 'female', 'city_003', 'Anna Nagar'],
    profile: { guardianName: 'Karthik Raman', classLevel: 'Class 11', board: 'CBSE', subjects: ['Computer Science', 'Mathematics'], budgetMin: 4000, budgetMax: 9500, preferredMode: 'online', preferredDays: ['Wednesday', 'Saturday'], preferredTime: 'evening' },
  },
  {
    user: ['Manish Agarwal', 'manish.agarwal@example.com', 'male', 'city_006', 'Dwarka'],
    profile: { guardianName: 'Sunita Agarwal', classLevel: 'Class 12', board: 'CBSE', subjects: ['Accountancy', 'Economics'], budgetMin: 4500, budgetMax: 10000, preferredMode: 'online', preferredDays: ['Tuesday', 'Friday'], preferredTime: 'evening' },
  },
  {
    user: ['Ritu Nair', 'ritu.nair@example.com', 'female', 'city_007', 'Kothrud'],
    profile: { guardianName: 'Gopal Nair', classLevel: 'Class 7', board: 'State Board', subjects: ['Social Science', 'History'], budgetMin: 1500, budgetMax: 4500, preferredMode: 'offline', preferredDays: ['Monday', 'Thursday'], preferredTime: 'afternoon' },
  },
  {
    user: ['Sameer Khan', 'sameer.khan@example.com', 'male', 'city_009', 'Behala'],
    profile: { guardianName: 'Nazia Khan', classLevel: 'Class 10', board: 'CBSE', subjects: ['Mathematics', 'Physics', 'Chemistry'], budgetMin: 3500, budgetMax: 9000, preferredMode: 'both', preferredDays: ['Monday', 'Thursday'], preferredTime: 'evening' },
  },
  {
    user: ['Kavya Pillai', 'kavya.pillai@example.com', 'female', 'city_003', 'Velachery'],
    profile: { guardianName: 'Suresh Pillai', classLevel: 'Class 6', board: 'CBSE', subjects: ['English', 'Mathematics'], budgetMin: 1500, budgetMax: 4000, preferredMode: 'offline', preferredDays: ['Saturday'], preferredTime: 'morning' },
  },
];

/* ------------------------------ helpers ------------------------------ */

const dateAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
const dateAhead = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

const availabilityFor = (userId, pattern) =>
  pattern.map(([d, start, end], i) => ({
    id: `avail_${userId}_${i}`,
    userId,
    day: day(d),
    start,
    end,
  }));

/**
 * One review per completed request. `request` is the 1-based position in the
 * request list below, so a review can never point at a request that does not
 * exist and the student always matches the student who made that request.
 */
const REVIEWS = [
  { request: 1, rating: 5, comment: 'Explained the concept patiently and the doubt-clearing in every class made a real difference. My child now scores much better.' },
  { request: 2, rating: 5, comment: 'The demo class was well structured and we knew straight away whether to continue. Very punctual as well.' },
  { request: 3, rating: 4, comment: 'Good teaching and fair fees. We occasionally had to reschedule, but the tutor communicated well in advance.' },
  { request: 4, rating: 5, comment: 'English grammar improved a lot. The written practice every class was the key difference.' },
  { request: 5, rating: 5, comment: 'A local tutor who understands the Telugu medium syllabus. My son improved from mid-range to a top ten rank in one year.' },
  { request: 6, rating: 4, comment: 'Hands-on computer classes. My son built a small project instead of just copying code.' },
  { request: 7, rating: 5, comment: 'Commerce theory clicks when he explains it. Previous year questions were a big help for boards.' },
  { request: 8, rating: 4, comment: 'Nice neighbourhood classes and reasonable fees. Social Science is much more interesting now.' },
  { request: 9, rating: 5, comment: 'Timed problem solving every class really improved speed. Strong recommendation.' },
  { request: 10, rating: 4, comment: 'ICSE preparation was excellent, including the viva practice. Fees are fair for the quality.' },
  { request: 11, rating: 5, comment: 'Chemistry reactions finally make sense because everything is drawn out first. Would recommend without hesitation.' },
  { request: 12, rating: 5, comment: 'Regular revision tests are a great idea. Biology stopped being a memorisation exercise.' },
  { request: 13, rating: 5, comment: 'Very warm with younger children and gives parents honest feedback rather than empty praise.' },
  { request: 14, rating: 4, comment: 'Statistics is finally intuitive. Would prefer one extra session before the exams.' },
  { request: 15, rating: 5, comment: 'Hindi grammar became simple. The written practice fixed the marks my son was losing in composition.' },
  { request: 16, rating: 4, comment: 'Good subject knowledge and a well-structured syllabus plan for the full year.' },
  { request: 17, rating: 4, comment: 'Robotics classes are genuinely hands-on. Only issue was a clash during exam week.' },
];

/**
 * Writes the full demo dataset to localStorage.
 * Existing demo data is left untouched unless `force` is true.
 */
export function seedDemoData({ force = false } = {}) {
  // Seed when the users collection is missing, empty or unreadable, so a
  // corrupted localStorage can never leave the app without demo accounts.
  if (!force && getData(KEYS.users) && getAll(KEYS.users).length > 0) return false;

  /* users ---------------------------------------------------------- */
  const users = [];
  const tutors = [];

  const adminId = 'user_admin';
  users.push({
    id: adminId,
    role: 'admin',
    name: 'Aarav Mehra',
    email: 'admin@demo.com',
    password: 'admin123',
    phone: '9800000001',
    city: 'city_001',
    locality: 'Koramangala',
    status: 'active',
    createdAt: dateAgo(240),
  });

  TUTOR_SEED.forEach((entry, index) => {
    const [name, seedEmail, gender, cityId, locality] = entry.user;
    const userId = `user_${String(index + 1).padStart(3, '0')}`;
    // The first tutor is the documented demo login.
    const email = index === 0 ? 'tutor@demo.com' : seedEmail;
    users.push({
      id: userId,
      role: 'tutor',
      name,
      email,
      // Passwords are plain text on purpose: this is a browser-only demo.
      password: index === 0 ? 'tutor123' : 'tutor123',
      phone: `9${String(700000000 + index * 123457).slice(0, 9)}`,
      gender,
      city: cityId,
      locality,
      status: 'active',
      createdAt: dateAgo(200 - index * 6),
    });

    const p = entry.profile;
    tutors.push({
      id: `tutor_${String(index + 1).padStart(3, '0')}`,
      userId,
      // The location lives on the profile as well as the account, because the
      // tutor directory filters and displays `tutor.city` / `tutor.locality`.
      city: cityId,
      locality,
      headline: p.headline,
      about: p.about,
      subjects: p.subjects.map((id) => subject(id)?.name).filter(Boolean),
      classes: p.classes.filter((c) => CLASS_LEVELS.includes(c)),
      qualifications: p.qualifications,
      experience: p.experience,
      hourlyFee: p.hourly,
      monthlyFee: p.monthly,
      teachingModes: p.modes,
      languages: p.languages,
      verificationStatus: p.verified ? 'verified' : 'pending',
      verificationNote: p.verified ? 'Qualification documents checked by the demo administrator.' : '',
      verifiedAt: p.verified ? dateAgo(190 - index * 6) : null,
      availability: availabilityFor(userId, [
        [1, '17:00', '20:00'],
        [3, '17:00', '20:00'],
        ...(index % 2 === 0 ? [[6, '10:00', '13:00']] : [[2, '18:00', '20:30']]),
      ]),
      createdAt: dateAgo(200 - index * 6),
    });
  });

  STUDENT_SEED.forEach((entry, index) => {
    const [name, email, gender, cityId, locality] = entry.user;
    const userId = `user_s${String(index + 1).padStart(2, '0')}`;
    users.push({
      id: userId,
      role: 'student',
      name,
      email,
      // The first student is the documented demo login.
      password: index === 0 ? 'student123' : 'student123',
      phone: `8${String(300000000 + index * 135791).slice(0, 9)}`,
      gender,
      city: cityId,
      locality,
      status: 'active',
      // Matches the shape written by authService.updateStudentProfile, so the
      // student profile page and the match logic read the same field names.
      profile: {
        guardianName: entry.profile.guardianName,
        classLevel: entry.profile.classLevel,
        board: entry.profile.board,
        subjects: entry.profile.subjects,
        budgetMin: entry.profile.budgetMin,
        budgetMax: entry.profile.budgetMax,
        preferredMode: entry.profile.preferredMode,
        preferredDays: entry.profile.preferredDays,
        preferredTime: entry.profile.preferredTime,
      },
      createdAt: dateAgo(180 - index * 8),
    });
  });

  setData(KEYS.users, users);
  setData(KEYS.tutors, tutors);
  setData(KEYS.subjects, SUBJECTS);

  /* requirements --------------------------------------------------- */
  // `postedDaysAgo` drives createdAt; `days` is the list of preferred weekdays.
  // The stored status is recalculated from the applications further down.
  const requirements = [
    { studentId: 'user_s01', subject: 'Mathematics', class: 'Class 10', board: 'CBSE', city: 'city_001', locality: 'Koramangala', budgetMin: 4000, budgetMax: 9000, mode: 'both', days: ['Monday', 'Wednesday'], time: 'evening', description: 'Need a Mathematics tutor for Class 10. The school syllabus is mostly covered but we want extra practice before the pre-boards. Prefer someone who gives regular feedback to parents.', status: 'open', postedDaysAgo: 6 },
    { studentId: 'user_s02', subject: 'English', class: 'Class 9', board: 'ICSE', city: 'city_001', locality: 'Whitefield', budgetMin: 3000, budgetMax: 6000, mode: 'offline', days: ['Tuesday', 'Thursday'], time: 'evening', description: 'Looking for an English tutor near Whitefield. My son struggles with grammar and needs help with writing practice for the board exam.', status: 'open', postedDaysAgo: 11 },
    { studentId: 'user_s03', subject: 'Physics', class: 'Class 12', board: 'CBSE', city: 'city_002', locality: 'Kondapur', budgetMin: 5000, budgetMax: 10000, mode: 'online', days: ['Monday', 'Friday'], time: 'evening', description: 'Class 12 Physics, board preparation. We need someone who can also handle numerical problems at speed. Online classes preferred.', status: 'open', postedDaysAgo: 3 },
    { studentId: 'user_s04', subject: 'Biology', class: 'Class 8', board: 'State Board', city: 'city_004', locality: 'Benz Circle', budgetMin: 2500, budgetMax: 5000, mode: 'offline', days: ['Saturday'], time: 'morning', description: 'Biology for Class 8 in Vijayawada. Only Saturday mornings work for us. Telugu medium student, comfortable with Telugu or English.', status: 'open', postedDaysAgo: 15 },
    { studentId: 'user_s05', subject: 'English', class: 'Class 10', board: 'CBSE', city: 'city_005', locality: 'Andheri', budgetMin: 4000, budgetMax: 8000, mode: 'both', days: ['Monday', 'Saturday'], time: 'afternoon', description: 'English literature and grammar for Class 10. Would like a trial class first before committing to a monthly plan.', status: 'open', postedDaysAgo: 2 },
    { studentId: 'user_s06', subject: 'Computer Science', class: 'Class 11', board: 'CBSE', city: 'city_003', locality: 'Anna Nagar', budgetMin: 5000, budgetMax: 9500, mode: 'online', days: ['Wednesday', 'Saturday'], time: 'evening', description: 'Computer Science for Class 11, Python and Java. Practical sessions preferred over only theory.', status: 'open', postedDaysAgo: 8 },
    { studentId: 'user_s07', subject: 'Accountancy', class: 'Class 12', board: 'CBSE', city: 'city_006', locality: 'Dwarka', budgetMin: 5500, budgetMax: 10000, mode: 'online', days: ['Tuesday', 'Friday'], time: 'evening', description: 'Accountancy for Class 12 boards. Focus on practical application and previous year questions.', status: 'open', postedDaysAgo: 20 },
    { studentId: 'user_s08', subject: 'Social Science', class: 'Class 7', board: 'State Board', city: 'city_007', locality: 'Kothrud', budgetMin: 2000, budgetMax: 4500, mode: 'offline', days: ['Monday', 'Thursday'], time: 'afternoon', description: 'Social Science and History for Class 7. Neighbourhood tutor preferred, Marathi speaking would help.', status: 'open', postedDaysAgo: 26 },
    { studentId: 'user_s01', subject: 'Physics', class: 'Class 10', board: 'CBSE', city: 'city_001', locality: 'Koramangala', budgetMin: 5000, budgetMax: 9000, mode: 'online', days: ['Tuesday', 'Saturday'], time: 'evening', description: 'Closed requirement: we already found a Physics tutor through this platform.', status: 'closed', postedDaysAgo: 45 },
    { studentId: 'user_s03', subject: 'Biology', class: 'Class 11', board: 'CBSE', city: 'city_002', locality: 'Kondapur', budgetMin: 4500, budgetMax: 8500, mode: 'online', days: ['Wednesday'], time: 'morning', description: 'Cancelled because our schedule changed this month.', status: 'cancelled', postedDaysAgo: 32 },
  ];

  /* applications --------------------------------------------------- */
  const applications = [
    { requirementId: 'requirement_001', tutorUserId: 'user_001', message: 'I teach Class 10 Mathematics and would be able to start this week. My focus is board-level problem solving.', fee: 7000, status: 'pending', days: 5 },
    { requirementId: 'requirement_001', tutorUserId: 'user_010', message: 'Available on Monday and Wednesday evenings as per your preference. Happy to share a study plan.', fee: 9000, status: 'pending', days: 4 },
    { requirementId: 'requirement_002', tutorUserId: 'user_005', message: 'I have been teaching English in Andheri for years and can visit Whitefield on Tuesdays and Thursdays.', fee: 6000, status: 'pending', days: 9 },
    { requirementId: 'requirement_003', tutorUserId: 'user_002', message: 'Class 12 Physics is my main area. I can take Monday and Friday evening slots online.', fee: 8500, status: 'pending', days: 2 },
    { requirementId: 'requirement_004', tutorUserId: 'user_004', message: 'I am in Vijayawada and teach Science to Class 8 students on Saturday mornings.', fee: 4000, status: 'accepted', days: 12 },
    { requirementId: 'requirement_005', tutorUserId: 'user_005', message: 'I can start with a demo class this week and then continue weekly.', fee: 6000, status: 'rejected', days: 1 },
    { requirementId: 'requirement_006', tutorUserId: 'user_006', message: 'Python and Java for Class 11, with practical projects instead of only theory.', fee: 7500, status: 'pending', days: 6 },
    { requirementId: 'requirement_007', tutorUserId: 'user_008', message: 'Accountancy for boards, including practical application questions.', fee: 7500, status: 'accepted', days: 16 },
    { requirementId: 'requirement_008', tutorUserId: 'user_009', message: 'I run small neighbourhood classes in Kothrud and can take Monday and Thursday afternoons.', fee: 5000, status: 'pending', days: 21 },
  ];

  setData(KEYS.applications, applications.map((a, i) => ({
    id: `application_${String(i + 1).padStart(3, '0')}`,
    requirementId: a.requirementId,
    tutorUserId: a.tutorUserId,
    message: a.message,
    proposedFee: a.fee,
    status: a.status,
    createdAt: dateAgo(a.days),
    updatedAt: dateAgo(a.days),
  })));

  /* requirements --------------------------------------------------- */
  // Statuses are derived from the applications above so the board, the tutor
  // filters and the student dashboard can never disagree with each other.
  setData(KEYS.requirements, requirements.map((r, i) => {
    const id = `requirement_${String(i + 1).padStart(3, '0')}`;
    const apps = applications.filter((a) => a.requirementId === id);
    const accepted = apps.find((a) => a.status === 'accepted');
    const tutor = accepted ? tutors.find((t) => t.userId === accepted.tutorUserId) : null;

    let status = r.status;
    let assignedTutorId = null;
    if (accepted && !['closed', 'cancelled'].includes(status)) {
      status = 'assigned';
      assignedTutorId = tutor ? tutor.id : null;
    } else if (!['closed', 'cancelled'].includes(status)) {
      const live = apps.filter((a) => ['pending', 'accepted'].includes(a.status));
      if (live.length > 0) status = 'applications_received';
    }

    return {
      id,
      studentId: r.studentId,
      subject: r.subject,
      classLevel: r.class,
      board: r.board,
      city: r.city,
      locality: r.locality,
      budgetMin: r.budgetMin,
      budgetMax: r.budgetMax,
      teachingMode: r.mode,
      preferredDays: r.days,
      preferredTime: r.time,
      description: r.description,
      status,
      assignedTutorId,
      createdAt: dateAgo(r.postedDaysAgo),
      updatedAt: dateAgo(r.postedDaysAgo),
    };
  }));

  /* requests ------------------------------------------------------- */
  // 17 completed (every review below points at one of these), 2 pending, 1 accepted.
  const requestSeed = [
    { studentId: 'user_s01', tutorUserId: 'user_001', subject: 'Mathematics', message: 'We would like to start regular Mathematics tuition for Class 10. Weekday evenings work best for us.', type: 'tutoring', status: 'completed', ago: 60, on: 58 },
    { studentId: 'user_s02', tutorUserId: 'user_001', subject: 'Mathematics', message: 'Requesting a trial class to see the teaching approach.', type: 'demo', status: 'completed', ago: 45, on: 44 },
    { studentId: 'user_s03', tutorUserId: 'user_002', subject: 'Physics', message: 'Class 12 board preparation, need help with numericals.', type: 'tutoring', status: 'completed', ago: 38, on: 36 },
    { studentId: 'user_s05', tutorUserId: 'user_005', subject: 'English', message: 'Trial class for Class 10 English, weekday afternoons.', type: 'demo', status: 'completed', ago: 30, on: 29 },
    { studentId: 'user_s04', tutorUserId: 'user_004', subject: 'Science', message: 'Saturday morning Science class for Class 8.', type: 'tutoring', status: 'completed', ago: 24, on: 23 },
    { studentId: 'user_s06', tutorUserId: 'user_006', subject: 'Computer Science', message: 'Class 11 Python, practical sessions preferred.', type: 'tutoring', status: 'completed', ago: 18, on: 17 },
    { studentId: 'user_s07', tutorUserId: 'user_008', subject: 'Accountancy', message: 'Class 12 Accountancy board preparation.', type: 'tutoring', status: 'completed', ago: 14, on: 13 },
    { studentId: 'user_s09', tutorUserId: 'user_009', subject: 'Social Science', message: 'Social Science and History for Class 8 to 10, evening classes preferred.', type: 'tutoring', status: 'completed', ago: 12, on: 11 },
    { studentId: 'user_s08', tutorUserId: 'user_010', subject: 'Mathematics', message: 'Class 9 Mathematics, alternate evenings please.', type: 'tutoring', status: 'completed', ago: 10, on: 9 },
    { studentId: 'user_s10', tutorUserId: 'user_012', subject: 'Mathematics', message: 'Mathematics support for Class 11 ICSE, online classes.', type: 'tutoring', status: 'completed', ago: 8, on: 7 },
    { studentId: 'user_s01', tutorUserId: 'user_003', subject: 'Chemistry', message: 'Chemistry alongside Mathematics would help with the Class 10 pre-boards.', type: 'tutoring', status: 'completed', ago: 40, on: 38 },
    { studentId: 'user_s02', tutorUserId: 'user_007', subject: 'Biology', message: 'Biology for Class 9 ICSE, needs diagram practice.', type: 'tutoring', status: 'completed', ago: 26, on: 25 },
    { studentId: 'user_s04', tutorUserId: 'user_011', subject: 'English', message: 'English and general school support for Class 8.', type: 'tutoring', status: 'completed', ago: 20, on: 19 },
    { studentId: 'user_s05', tutorUserId: 'user_013', subject: 'Statistics', message: 'Statistics support for Class 11, online classes on weekends.', type: 'tutoring', status: 'completed', ago: 16, on: 15 },
    { studentId: 'user_s07', tutorUserId: 'user_014', subject: 'Hindi', message: 'Hindi grammar and composition practice for Class 12.', type: 'tutoring', status: 'completed', ago: 13, on: 12 },
    { studentId: 'user_s08', tutorUserId: 'user_015', subject: 'Psychology', message: 'Psychology for Class 11, theory plus practical paper help.', type: 'tutoring', status: 'completed', ago: 9, on: 8 },
    { studentId: 'user_s10', tutorUserId: 'user_016', subject: 'Computer Science', message: 'IT and Robotics for Class 9, mid-term project help.', type: 'tutoring', status: 'completed', ago: 6, on: 5 },
    // Live ones so the demo always has something to act on.
    { studentId: 'user_s01', tutorUserId: 'user_010', subject: 'Mathematics', message: 'Please share a demo class for Class 10 Mathematics before we commit.', type: 'demo', status: 'pending', ago: 2, ahead: 3 },
    { studentId: 'user_s03', tutorUserId: 'user_003', subject: 'Chemistry', message: 'Chemistry revision support alongside Physics for boards.', type: 'tutoring', status: 'pending', ago: 1, ahead: 2 },
    { studentId: 'user_s06', tutorUserId: 'user_005', subject: 'English', message: 'English grammar support along with Computer Science.', type: 'tutoring', status: 'accepted', ago: 4, ahead: 1 },
  ];

  setData(KEYS.requests, requestSeed.map((r, i) => ({
    id: `request_${String(i + 1).padStart(3, '0')}`,
    studentId: r.studentId,
    tutorUserId: r.tutorUserId,
    subject: r.subject,
    message: r.message,
    type: r.type,
    preferredDate: r.status === 'completed' ? dateAgo(r.on) : dateAhead(r.ahead),
    preferredTime: 'evening',
    status: r.status,
    timeline: buildTimeline(r),
    createdAt: dateAgo(r.ago),
    updatedAt: dateAgo(Math.max(0, r.ago - 1)),
  })));

  /* reviews -------------------------------------------------------- */
  // Derived from the requests above so every review points at a completed
  // request, belongs to the student who made it, and credits the right tutor.
  setData(KEYS.reviews, REVIEWS.map((r, index) => {
    const request = requestSeed[r.request - 1];
    const tutor = tutors.find((t) => t.userId === request.tutorUserId);
    return {
      id: `review_${String(index + 1).padStart(3, '0')}`,
      requestId: `request_${String(r.request).padStart(3, '0')}`,
      tutorId: tutor ? tutor.id : null,
      tutorUserId: request.tutorUserId,
      studentId: request.studentId,
      rating: r.rating,
      comment: r.comment,
      createdAt: dateAgo(Math.max(1, request.ago - 2)),
    };
  }));

  /* favourites ---------------------------------------------------- */
  // Referenced by tutor profile id, which is what tutorService.listFavorites reads.
  setData(KEYS.favorites, [
    { id: 'favorite_001', studentId: 'user_s01', tutorId: 'tutor_001', createdAt: dateAgo(20) },
    { id: 'favorite_002', studentId: 'user_s01', tutorId: 'tutor_002', createdAt: dateAgo(18) },
    { id: 'favorite_003', studentId: 'user_s01', tutorId: 'tutor_010', createdAt: dateAgo(5) },
    { id: 'favorite_004', studentId: 'user_s02', tutorId: 'tutor_001', createdAt: dateAgo(14) },
    { id: 'favorite_005', studentId: 'user_s03', tutorId: 'tutor_002', createdAt: dateAgo(9) },
    { id: 'favorite_006', studentId: 'user_s05', tutorId: 'tutor_005', createdAt: dateAgo(6) },
    { id: 'favorite_007', studentId: 'user_s06', tutorId: 'tutor_006', createdAt: dateAgo(11) },
    { id: 'favorite_008', studentId: 'user_s09', tutorId: 'tutor_009', createdAt: dateAgo(7) },
    { id: 'favorite_009', studentId: 'user_s08', tutorId: 'tutor_009', createdAt: dateAgo(16) },
  ]);

  /* notifications -------------------------------------------------- */
  const notifications = [
    { userId: 'user_001', type: 'request_received', title: 'New demo request', message: 'Ananya Sharma sent you a demo request for Mathematics.', link: '/tutor/requests', read: false, days: 2 },
    { userId: 'user_001', type: 'review_received', title: 'New 5-star review', message: 'Ananya Sharma left you a review for a completed session.', link: '/tutor/reviews', read: false, days: 1 },
    { userId: 'user_001', type: 'application_received', title: 'Application received', message: 'You applied to a Mathematics requirement and the student has viewed it.', link: '/tutor/applications', read: true, days: 5 },
    { userId: 'user_010', type: 'request_received', title: 'New demo request', message: 'Ananya Sharma requested a Mathematics demo class.', link: '/tutor/requests', read: false, days: 2 },
    { userId: 'user_002', type: 'request_received', title: 'New tutoring request', message: 'Sneha Kulkarni requested Physics tuition for Class 12.', link: '/tutor/requests', read: false, days: 1 },
    { userId: 'user_003', type: 'request_received', title: 'New tutoring request', message: 'Sneha Kulkarni requested Chemistry support for boards.', link: '/tutor/requests', read: false, days: 1 },
    { userId: 'user_004', type: 'application_accepted', title: 'Application accepted', message: 'Praveen Reddy accepted your Science application.', link: '/tutor/applications', read: false, days: 2 },
    { userId: 'user_005', type: 'application_declined', title: 'Application declined', message: 'Farhan Ali could not take your English application this time.', link: '/tutor/applications', read: true, days: 1 },
    { userId: 'user_006', type: 'request_received', title: 'New tutoring request', message: 'Divya Raman requested Computer Science tuition.', link: '/tutor/requests', read: true, days: 4 },
    { userId: 'user_008', type: 'application_accepted', title: 'Application accepted', message: 'Manish Agarwal accepted your Accountancy application.', link: '/tutor/applications', read: false, days: 3 },
    { userId: 'user_009', type: 'request_received', title: 'New tutoring request', message: 'Ritu Nair requested Social Science tuition.', link: '/tutor/requests', read: false, days: 5 },
    { userId: 'user_s01', type: 'request_accepted', title: 'Request accepted', message: 'Divya Raman accepted your English tutoring request.', link: '/student/requests', read: false, days: 2 },
    { userId: 'user_s01', type: 'application_received', title: 'New tutor application', message: 'Anita Sharma applied to your Mathematics requirement.', link: '/student/requirements', read: false, days: 5 },
    { userId: 'user_s01', type: 'application_received', title: 'New tutor application', message: 'Karan Bhatia applied to your Mathematics requirement.', link: '/student/requirements', read: false, days: 4 },
    { userId: 'user_s02', type: 'application_received', title: 'New tutor application', message: 'Fatima Khan applied to your English requirement.', link: '/student/requirements', read: true, days: 9 },
    { userId: 'user_s03', type: 'application_received', title: 'New tutor application', message: 'Rohit Verma applied to your Physics requirement.', link: '/student/requirements', read: false, days: 2 },
    { userId: 'user_s04', type: 'application_accepted', title: 'Application accepted', message: 'Suresh Reddy accepted your Science requirement.', link: '/student/requirements', read: true, days: 12 },
    { userId: 'user_s07', type: 'application_accepted', title: 'Application accepted', message: 'Arjun Patel accepted your Accountancy requirement.', link: '/student/requirements', read: false, days: 16 },
  ];

  setData(KEYS.notifications, notifications.map((n, i) => ({
    id: `notification_${String(i + 1).padStart(3, '0')}`,
    userId: n.userId,
    type: n.type,
    title: n.title,
    message: n.message,
    link: n.link,
    isRead: n.read,
    createdAt: dateAgo(n.days),
  })));

  /* reports -------------------------------------------------------- */
  setData(KEYS.reports, [
    {
      id: 'report_001',
      reporterId: 'user_s03',
      reportedUserId: 'user_016',
      reportedTutorId: 'tutor_016',
      reason: 'Inappropriate content',
      details: 'Some of the project descriptions contain text that is not appropriate for a school student.',
      status: 'open',
      createdAt: dateAgo(3),
    },
    {
      id: 'report_002',
      reporterId: 'user_s09',
      reportedUserId: 'user_012',
      reportedTutorId: 'tutor_012',
      reason: 'Fake profile',
      details: 'The qualification year shown on the profile does not match what was mentioned in the class.',
      status: 'reviewing',
      adminNote: 'Asked the tutor to upload proof of qualification.',
      createdAt: dateAgo(8),
    },
    {
      id: 'report_003',
      reporterId: 'user_s05',
      reportedUserId: 'user_013',
      reportedTutorId: 'tutor_013',
      reason: 'Misconduct',
      details: 'Tutor cancelled two accepted classes at very short notice.',
      status: 'resolved',
      adminNote: 'Warned the tutor. Confirmation received that future cancellations will be communicated earlier.',
      createdAt: dateAgo(20),
    },
  ]);

  return true;
}

function buildTimeline(request) {
  const events = [{ status: 'pending', label: 'Request sent', by: 'student', at: dateAgo(request.ago) }];
  if (request.status === 'pending') return events;

  events.push({ status: 'accepted', label: 'Accepted by tutor', by: 'tutor', at: dateAgo(Math.max(0, request.ago - 1)) });

  if (request.status === 'completed') {
    events.push({ status: 'completed', label: 'Session completed', by: 'tutor', at: dateAgo(request.on) });
  }
  if (request.status === 'cancelled') {
    events.push({ status: 'cancelled', label: 'Cancelled by student', by: 'student', at: dateAgo(Math.max(0, request.ago - 2)) });
  }
  if (request.status === 'rejected') {
    events.push({ status: 'rejected', label: 'Declined by tutor', by: 'tutor', at: dateAgo(Math.max(0, request.ago - 1)) });
  }
  return events;
}

/**
 * Deletes every key this app owns and immediately rewrites the original demo
 * dataset. Only `htf_*` keys are touched, so nothing else on the origin is lost.
 */
export function resetDemoData() {
  resetAll();
  return seedDemoData({ force: true });
}

export default seedDemoData;