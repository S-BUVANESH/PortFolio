export const contact = {
  email: 'buvaneshvicky364@gmail.com',
  phone: '+91 6379345945',
  phoneHref: 'tel:+916379345945',
  linkedin: 'https://linkedin.com/in/buvanesh-s-39113632a',
  github: 'https://github.com/S-BUVANESH',
  cv: '/assets/cv.pdf',
}

export const education = {
  degree: 'B.E. Computer Science & Engineering',
  school: 'Kumaraguru College of Technology',
  city: 'Coimbatore',
  years: '2024 — 2028',
  cgpa: '8.48',
}

export const forge = {
  name: 'FORGE — PRICE ProtoSem',
  role: 'Innovation Engineer Trainee',
  summary:
    'Selected for a 20-week industry-integrated innovation programme focused on solving real-world retail and commerce challenges through AI, analytics, intelligent systems, IoT, prototyping, and entrepreneurship.',
  areas: ['AI', 'Analytics', 'Intelligent Systems', 'IoT', 'Prototyping', 'Phygital Retail', 'Intelligent Commerce', 'Entrepreneurship'],
}

export type Layer = { tag: string; label: string }
export type Project = {
  id: string
  name: string
  field: string
  what: string
  problem: string
  built: string
  tech: string[]
  layers: [Layer, Layer, Layer]
  hue: string
  idea: string
  purpose: string
}

export const projects: Project[] = [
  {
    id: 'thunai',
    name: 'THUNAI',
    field: 'Agricultural AI',
    what: 'An AI companion system for agriculture.',
    problem: 'Identifying plant diseases from what a leaf looks like — and knowing what to do next.',
    built: 'A CNN-powered plant disease detection and crop-switching recommendation engine that analyses leaf images to identify diseases and guide farmers toward better outcomes.',
    tech: ['Python', 'CNN', 'Deep Learning', 'Image Processing'],
    layers: [
      { tag: 'Input', label: 'Leaf image' },
      { tag: 'Model', label: 'CNN classifier' },
      { tag: 'Output', label: 'Disease + crop-switch advice' },
    ],
    hue: '#7fa36b',
    idea: 'Let a camera read the leaf. Train a convolutional network on leaf imagery so a photo becomes a diagnosis.',
    purpose: 'Earlier, clearer decisions for farmers: what is wrong with the crop, and what to grow instead.',
  },
  {
    id: 'kovai-surge',
    name: 'KOVAI SURGE',
    field: 'Urban Intelligence',
    what: 'A smart waste management system.',
    problem: 'City waste handling without live visibility of where trucks are or which bins need attention.',
    built: 'Real-time garbage truck tracking and dustbin status monitoring — live IoT integration feeding a dashboard for smarter urban waste handling.',
    tech: ['IoT', 'Real-Time Tracking', 'Smart Systems', 'Dashboard'],
    layers: [
      { tag: 'Sense', label: 'Dustbin status' },
      { tag: 'Track', label: 'Truck location, live' },
      { tag: 'View', label: 'Monitoring dashboard' },
    ],
    hue: '#9aa3ad',
    idea: 'Give the city a live map of its own waste: every truck and every bin reporting in.',
    purpose: 'Smarter urban waste handling: collection routed by real bin status instead of guesswork.',
  },
  {
    id: 'food-os',
    name: 'FOOD OS',
    field: 'Full-Stack · System Design',
    what: 'A food ordering & management system.',
    problem: 'Running menus and orders end to end, efficiently, with every state kept consistent.',
    built: 'An end-to-end ordering platform with menu management, order lifecycle handling and full database integration — designed for efficiency and clean UX.',
    tech: ['Java', 'SQL', 'DBMS', 'System Design'],
    layers: [
      { tag: 'Interface', label: 'Menu & ordering' },
      { tag: 'Logic', label: 'Order lifecycle (Java)' },
      { tag: 'Data', label: 'SQL database' },
    ],
    hue: '#e8743a',
    idea: 'Model the restaurant as a system: menu, order and kitchen state as one consistent lifecycle.',
    purpose: 'Efficient end-to-end ordering where every order state is tracked and consistent.',
  },
]


export type Skill = { name: string; logo?: string; glyph?: string; kind: 'Language' | 'Web' | 'AI' | 'Foundation' | 'Library' | 'Craft' }
export const skills: Skill[] = [
  { name: 'Python', logo: '/logos/python-original.svg', kind: 'Language' },
  { name: 'C / C++', logo: '/logos/cplusplus-original.svg', kind: 'Language' },
  { name: 'Java', logo: '/logos/java-original.svg', kind: 'Language' },
  { name: 'SQL', glyph: 'sql', kind: 'Language' },
  { name: 'HTML', logo: '/logos/html5-original.svg', kind: 'Web' },
  { name: 'CSS', logo: '/logos/css3-original.svg', kind: 'Web' },
  { name: 'Machine Learning', glyph: 'ml', kind: 'AI' },
  { name: 'Artificial Intelligence', glyph: 'ai', kind: 'AI' },
  { name: 'Prompt Engineering', glyph: 'prompt', kind: 'AI' },
  { name: 'NumPy', logo: '/logos/numpy-original.svg', kind: 'Library' },
  { name: 'Data Structures & Algorithms', glyph: 'dsa', kind: 'Foundation' },
  { name: '3D Designing', glyph: '3d', kind: 'Craft' },
]

export const infosys: [string, string][] = [
  ['Artificial Intelligence Primer', 'ai-primer'],
  ['Deep Learning for Developers', 'deep-learning'],
  ['Intro to Natural Language Processing', 'intro-nlp'],
  ['Prompt Engineering Specialization', 'prompt-engineering'],
  ['Introduction to Data Science', 'intro-data-science'],
  ['NumPy and Pandas for Python', 'numpy-pandas'],
  ['Database Management System (DBMS)', 'dbms'],
  ['Agile Scrum in Practice', 'agile-scrum'],
]
export const hackerrank: [string, string][] = [
  ['Python (Basic)', 'hackerrank-python'],
  ['Java (Basic)', 'hackerrank-java'],
  ['SQL (Basic)', 'hackerrank-sql'],
  ['Problem Solving (Basic)', 'hackerrank-problem-solving'],
]
