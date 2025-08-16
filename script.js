/*
 * ScholarLink – core client‑side logic
 *
 * This script provides the functionality for a static scholarship portal. It fetches
 * initial scholarship and blog data from local JSON files (served over HTTP),
 * handles user authentication with localStorage, allows bookmarking of scholarships,
 * supports newsletter subscriptions, processes contact form submissions,
 * and implements basic admin controls. Because there is no server‑side
 * component in this environment, data persistence is handled in the browser
 * using localStorage. In a production implementation these actions would
 * communicate with a backend via an API. See the README for instructions on
 * deploying the static site with a simple HTTP server so that fetch() calls
 * function correctly.
 */

// Utility functions to interact with localStorage
function getLocalJSON(key, defaultValue = []) {
  const data = localStorage.getItem(key);
  try {
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function setLocalJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Fallback data used when fetch() cannot retrieve JSON files (e.g., when running from the file:// protocol).
const fallbackScholarships = [
  {
    id: '1',
    title: 'Global Excellence Scholarship',
    country: 'United Kingdom',
    eligibleNationality: 'International',
    level: "Master's",
    field: 'Computer Science',
    deadline: '2025-09-30',
    sponsor: 'University of Oxford',
    eligibility: "Applicants must hold an offer for a full‑time master's program at Oxford and demonstrate academic excellence.",
    benefits: 'Full tuition and a stipend for living expenses.',
    description: 'The Global Excellence Scholarship is aimed at outstanding international students applying to master\'s degrees in Computer Science at Oxford University. The scholarship covers full tuition and provides a living stipend.',
    link: 'https://www.ox.ac.uk/scholarships/global‑excellence',
    tags: ['international', 'computer science', 'full scholarship']
  },
  {
    id: '2',
    title: 'African Leaders Fellowship',
    country: 'United States',
    eligibleNationality: 'African countries',
    level: 'PhD',
    field: 'Public Policy',
    deadline: '2025-11-15',
    sponsor: 'Harvard Kennedy School',
    eligibility: 'Citizens of any African country with a strong record of leadership and a commitment to improving governance on the continent.',
    benefits: 'Tuition waiver, travel allowance, and stipend.',
    description: 'The African Leaders Fellowship supports doctoral candidates in Public Policy who aspire to strengthen governance and development in Africa. Fellows receive comprehensive financial support during their studies.',
    link: 'https://www.hks.harvard.edu/fellowships/african-leaders',
    tags: ['africa', 'public policy', 'leadership']
  },
  {
    id: '3',
    title: 'Women in STEM Grant',
    country: 'Canada',
    eligibleNationality: 'International',
    level: 'Undergraduate',
    field: 'Engineering',
    deadline: '2025-08-31',
    sponsor: 'University of Toronto',
    eligibility: 'Female students admitted to an undergraduate engineering program with strong academic records and extracurricular involvement.',
    benefits: 'Partial tuition coverage and mentorship opportunities.',
    description: 'The Women in STEM Grant encourages gender diversity in engineering by providing financial support and mentorship to talented women pursuing undergraduate degrees at the University of Toronto.',
    link: 'https://engineering.utoronto.ca/women-in-stem-grant',
    tags: ['women', 'engineering', 'mentorship']
  },
  {
    id: '4',
    title: 'ASEAN Undergraduate Scholarship',
    country: 'Singapore',
    eligibleNationality: 'ASEAN countries',
    level: 'Undergraduate',
    field: 'Any field',
    deadline: '2025-12-01',
    sponsor: 'National University of Singapore',
    eligibility: 'Citizens from ASEAN member states (excluding Singapore) who have applied to a full‑time undergraduate program.',
    benefits: 'Full tuition and living allowance.',
    description: 'The ASEAN Undergraduate Scholarship is awarded to outstanding students from ASEAN countries who exhibit academic excellence, leadership potential, and a commitment to community service.',
    link: 'https://nus.edu.sg/admissions/ASEAN-scholarship',
    tags: ['asean', 'undergraduate', 'tuition']
  },
  {
    id: '5',
    title: 'Digital Innovators Award',
    country: 'Germany',
    eligibleNationality: 'International',
    level: "Master's",
    field: 'Information Technology',
    deadline: '2025-10-10',
    sponsor: 'Technical University of Munich',
    eligibility: "Applicants must have a bachelor's degree in IT or a related field and demonstrate innovative project experience.",
    benefits: '50% tuition waiver and research internship.',
    description: 'The Digital Innovators Award supports master\'s students who show exceptional promise in creating cutting‑edge digital solutions. Recipients participate in a research internship at TUM\'s Digital Innovation Lab.',
    link: 'https://www.tum.de/digital-innovators-award',
    tags: ['innovation', 'digital', 'research']
  }
];

const fallbackPosts = [
  {
    id: '1',
    title: 'How to Write a Compelling Scholarship Essay',
    author: 'ScholarLink Team',
    date: '2025-08-10',
    summary: 'Tips and tricks to craft a persuasive essay that stands out to scholarship committees.',
    content: 'Scholarship essays often serve as the deciding factor in highly competitive award processes. Begin by understanding the question and tailoring your response to reflect the sponsor’s values. Use concrete examples to demonstrate your achievements and ambitions. Maintain a clear structure with an introduction, body, and conclusion, and don’t forget to proofread before submission.'
  },
  {
    id: '2',
    title: 'Top Mistakes Scholarship Applicants Make',
    author: 'Jane Doe',
    date: '2025-07-25',
    summary: 'Avoid these common pitfalls to improve your chances of securing funding.',
    content: 'From missing deadlines to failing to meet eligibility criteria, applicants often sabotage their chances. Always read the requirements carefully, plan ahead to gather necessary documents, and tailor each application to the specific scholarship. Submitting generic applications or neglecting to follow instructions can cost you the opportunity.'
  }
];

// Fetch scholarships from the static JSON file. When the site is served
// over http (not file://) this will work; otherwise, the fallback data is returned.
async function fetchInitialScholarships() {
  try {
    const res = await fetch('scholarships.json');
    if (!res.ok) throw new Error('Failed to load scholarships.json');
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Using fallback scholarships data due to fetch error.', err);
    return fallbackScholarships;
  }
}

async function fetchBlogPosts() {
  try {
    const res = await fetch('posts.json');
    if (!res.ok) throw new Error('Failed to load posts.json');
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Using fallback blog posts due to fetch error.', err);
    return fallbackPosts;
  }
}

// Authentication helpers
function getCurrentUser() {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
}

function setCurrentUser(user) {
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('currentUser');
  }
}

function getUsers() {
  return getLocalJSON('users');
}

function saveUsers(users) {
  setLocalJSON('users', users);
}

function registerUser(email, password) {
  const users = getUsers();
  if (users.some(u => u.email === email)) {
    return { success: false, message: 'An account with this email already exists.' };
  }
  const newUser = { email, password, bookmarks: [], isAdmin: false };
  users.push(newUser);
  saveUsers(users);
  setCurrentUser({ email, isAdmin: false });
  return { success: true };
}

function loginUser(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return { success: false, message: 'Invalid email or password.' };
  }
  setCurrentUser({ email: user.email, isAdmin: !!user.isAdmin });
  return { success: true, isAdmin: !!user.isAdmin };
}

function logoutUser() {
  setCurrentUser(null);
}

// Scholarship helpers
async function getScholarships() {
  const initial = await fetchInitialScholarships();
  const approved = getLocalJSON('approvedScholarships');
  // Merge initial and approved (avoid duplicates by id)
  const map = new Map();
  [...initial, ...approved].forEach(item => map.set(item.id, item));
  return Array.from(map.values());
}

function getSubmissions() {
  return getLocalJSON('submissions');
}

function saveSubmission(item) {
  const submissions = getSubmissions();
  submissions.push(item);
  setLocalJSON('submissions', submissions);
}

function approveSubmission(id) {
  const submissions = getSubmissions();
  const index = submissions.findIndex(s => s.id === id);
  if (index === -1) return;
  const [approvedItem] = submissions.splice(index, 1);
  const approved = getLocalJSON('approvedScholarships');
  approved.push(approvedItem);
  setLocalJSON('approvedScholarships', approved);
  setLocalJSON('submissions', submissions);
}

function deleteScholarship(id) {
  // Delete from approvedScholarships only, leaving initial intact
  let approved = getLocalJSON('approvedScholarships');
  approved = approved.filter(item => item.id !== id);
  setLocalJSON('approvedScholarships', approved);
}

function getBookmarks() {
  const user = getCurrentUser();
  if (!user) return [];
  const users = getUsers();
  const found = users.find(u => u.email === user.email);
  return found ? found.bookmarks : [];
}

function toggleBookmark(id) {
  const user = getCurrentUser();
  if (!user) return { success: false, message: 'You must be logged in to bookmark.' };
  const users = getUsers();
  const index = users.findIndex(u => u.email === user.email);
  if (index === -1) return { success: false };
  const bookmarks = users[index].bookmarks || [];
  const idx = bookmarks.indexOf(id);
  if (idx === -1) {
    bookmarks.push(id);
  } else {
    bookmarks.splice(idx, 1);
  }
  users[index].bookmarks = bookmarks;
  saveUsers(users);
  return { success: true, bookmarked: idx === -1 };
}

function isBookmarked(id) {
  const bookmarks = getBookmarks();
  return bookmarks.includes(id);
}

// Newsletter subscription
function subscribeNewsletter(email) {
  const list = getLocalJSON('newsletter');
  if (list.includes(email)) {
    return { success: false, message: 'You are already subscribed.' };
  }
  list.push(email);
  setLocalJSON('newsletter', list);
  return { success: true };
}

// Contact form handling
function submitContactForm(name, email, message) {
  const messages = getLocalJSON('contactMessages');
  messages.push({ name, email, message, date: new Date().toISOString() });
  setLocalJSON('contactMessages', messages);
}

// Header and footer
function loadHeader() {
  const header = document.createElement('header');
  const siteName = document.createElement('div');
  siteName.textContent = 'ScholarLink';
  siteName.style.fontSize = '1.5rem';
  siteName.style.fontWeight = 'bold';
  const nav = document.createElement('nav');
  const links = [
    { href: 'index.html', text: 'Home' },
    { href: 'scholarships.html', text: 'Scholarships' },
    { href: 'submit.html', text: 'Submit' },
    { href: 'blog.html', text: 'Blog' },
    { href: 'contact.html', text: 'Contact' }
  ];
  links.forEach(item => {
    const a = document.createElement('a');
    a.href = item.href;
    a.textContent = item.text;
    nav.appendChild(a);
  });
  const authDiv = document.createElement('div');
  authDiv.id = 'auth-controls';
  authDiv.style.display = 'flex';
  authDiv.style.gap = '0.5rem';
  header.appendChild(siteName);
  header.appendChild(nav);
  header.appendChild(authDiv);
  document.body.prepend(header);
  updateAuthControls();
}

function updateAuthControls() {
  const authDiv = document.getElementById('auth-controls');
  if (!authDiv) return;
  authDiv.innerHTML = '';
  const user = getCurrentUser();
  if (user) {
    const dashLink = document.createElement('a');
    dashLink.href = user.isAdmin ? 'admin.html' : 'dashboard.html';
    dashLink.textContent = user.isAdmin ? 'Admin' : 'Dashboard';
    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'button';
    logoutBtn.textContent = 'Logout';
    logoutBtn.addEventListener('click', () => {
      logoutUser();
      window.location.href = 'index.html';
    });
    authDiv.appendChild(dashLink);
    authDiv.appendChild(logoutBtn);
  } else {
    const loginLink = document.createElement('a');
    loginLink.href = 'login.html';
    loginLink.textContent = 'Login';
    authDiv.appendChild(loginLink);
  }
}

function loadFooter() {
  const footer = document.createElement('footer');
  footer.innerHTML = '&copy; ' + new Date().getFullYear() + ' ScholarLink. All rights reserved.';
  document.body.appendChild(footer);
}

// Page initializers
async function initHomePage() {
  // Hero section
  const main = document.querySelector('main');
  if (!main) return;
  const hero = document.createElement('section');
  hero.className = 'hero';
  hero.innerHTML = `
    <h1>Discover Scholarships Around the World</h1>
    <p>Search, filter, and apply to scholarships that match your dreams.</p>
    <a href="scholarships.html" class="button">Browse Scholarships</a>
  `;
  main.appendChild(hero);

  // Featured scholarships
  const scholarships = await getScholarships();
  const featured = scholarships.slice(0, 3);
  const featuredSection = document.createElement('section');
  featuredSection.innerHTML = '<h2>Featured Scholarships</h2>';
  const grid = document.createElement('div');
  grid.className = 'grid';
  featured.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${item.title}</h3>
      <p><strong>Country:</strong> ${item.country}</p>
      <p><strong>Deadline:</strong> ${item.deadline}</p>
      <a href="scholarship.html?id=${item.id}" class="button">View Details</a>
    `;
    grid.appendChild(card);
  });
  featuredSection.appendChild(grid);
  main.appendChild(featuredSection);

  // Newsletter signup
  const newsletter = document.createElement('section');
  newsletter.innerHTML = `
    <h2>Join Our Newsletter</h2>
    <p>Get weekly updates on new scholarship opportunities.</p>
    <form id="newsletter-form">
      <div class="form-group">
        <label for="newsletter-email">Email Address</label>
        <input type="email" id="newsletter-email" required />
      </div>
      <button type="submit" class="button">Subscribe</button>
      <p id="newsletter-msg" style="margin-top:0.5rem;"></p>
    </form>
  `;
  main.appendChild(newsletter);
  const newsletterForm = document.getElementById('newsletter-form');
  newsletterForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('newsletter-email').value.trim();
    const res = subscribeNewsletter(email);
    const msgEl = document.getElementById('newsletter-msg');
    msgEl.style.color = res.success ? 'green' : 'red';
    msgEl.textContent = res.success ? 'Subscribed successfully!' : res.message;
    if (res.success) newsletterForm.reset();
  });
}

async function initListingPage() {
  const main = document.querySelector('main');
  if (!main) return;
  const scholarships = await getScholarships();
  // Build filter controls
  const filterSection = document.createElement('section');
  filterSection.innerHTML = '<h2>Find Scholarships</h2>';
  const form = document.createElement('form');
  form.id = 'filter-form';
  form.innerHTML = `
    <div class="form-group">
      <label for="search">Search</label>
      <input type="text" id="search" placeholder="Keyword" />
    </div>
    <div class="form-group">
      <label for="country">Country</label>
      <select id="country"><option value="">Any</option></select>
    </div>
    <div class="form-group">
      <label for="level">Level</label>
      <select id="level"><option value="">Any</option></select>
    </div>
    <div class="form-group">
      <label for="field">Field</label>
      <select id="field"><option value="">Any</option></select>
    </div>
    <div class="form-group">
      <label for="sponsor">Sponsor</label>
      <select id="sponsor"><option value="">Any</option></select>
    </div>
    <button type="submit" class="button">Apply Filters</button>
  `;
  filterSection.appendChild(form);
  main.appendChild(filterSection);

  // Populate filter options
  const unique = (arr) => Array.from(new Set(arr)).filter(x => x);
  const countries = unique(scholarships.map(s => s.country));
  const levels = unique(scholarships.map(s => s.level));
  const fields = unique(scholarships.map(s => s.field));
  const sponsors = unique(scholarships.map(s => s.sponsor));
  const countrySel = document.getElementById('country');
  const levelSel = document.getElementById('level');
  const fieldSel = document.getElementById('field');
  const sponsorSel = document.getElementById('sponsor');
  countries.forEach(c => { const opt = document.createElement('option'); opt.value = c; opt.textContent = c; countrySel.appendChild(opt); });
  levels.forEach(c => { const opt = document.createElement('option'); opt.value = c; opt.textContent = c; levelSel.appendChild(opt); });
  fields.forEach(c => { const opt = document.createElement('option'); opt.value = c; opt.textContent = c; fieldSel.appendChild(opt); });
  sponsors.forEach(c => { const opt = document.createElement('option'); opt.value = c; opt.textContent = c; sponsorSel.appendChild(opt); });

  // Container for results and pagination
  const resultsSection = document.createElement('section');
  const resultsDiv = document.createElement('div');
  resultsDiv.id = 'results';
  const paginationDiv = document.createElement('div');
  paginationDiv.id = 'pagination';
  paginationDiv.style.marginTop = '1rem';
  resultsSection.appendChild(resultsDiv);
  resultsSection.appendChild(paginationDiv);
  main.appendChild(resultsSection);

  function applyFilters(page = 1) {
    const search = document.getElementById('search').value.toLowerCase();
    const country = countrySel.value;
    const level = levelSel.value;
    const field = fieldSel.value;
    const sponsor = sponsorSel.value;
    let filtered = scholarships.filter(s => {
      return (
        (!search || s.title.toLowerCase().includes(search) || s.description.toLowerCase().includes(search)) &&
        (!country || s.country === country) &&
        (!level || s.level === level) &&
        (!field || s.field === field) &&
        (!sponsor || s.sponsor === sponsor)
      );
    });
    const itemsPerPage = 5;
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    renderResults(filtered.slice(start, end));
    renderPagination(page, totalPages);
  }

  function renderResults(list) {
    resultsDiv.innerHTML = '';
    if (list.length === 0) {
      resultsDiv.textContent = 'No scholarships found.';
      return;
    }
    list.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';
      const tagsHTML = item.tags.map(t => `<span class="tag">${t}</span>`).join('');
      const bookmarked = isBookmarked(item.id);
      card.innerHTML = `
        <h3>${item.title}</h3>
        <p><strong>Country:</strong> ${item.country}</p>
        <p><strong>Level:</strong> ${item.level}</p>
        <p><strong>Field:</strong> ${item.field}</p>
        <div>${tagsHTML}</div>
        <div style="margin-top:0.5rem;">
          <a href="scholarship.html?id=${item.id}" class="button" style="margin-right:0.5rem;">Details</a>
          <button data-id="${item.id}" class="button bookmark-btn" style="background-color:${bookmarked ? '#68d391' : '#3182ce'};">${bookmarked ? 'Unbookmark' : 'Bookmark'}</button>
        </div>
      `;
      resultsDiv.appendChild(card);
    });
    // Attach bookmark handlers
    document.querySelectorAll('.bookmark-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const id = e.target.getAttribute('data-id');
        const res = toggleBookmark(id);
        if (!res.success) {
          alert(res.message || 'Please log in to bookmark.');
        } else {
          e.target.textContent = res.bookmarked ? 'Unbookmark' : 'Bookmark';
          e.target.style.backgroundColor = res.bookmarked ? '#68d391' : '#3182ce';
        }
      });
    });
  }

  function renderPagination(current, total) {
    paginationDiv.innerHTML = '';
    if (total <= 1) return;
    for (let i = 1; i <= total; i++) {
      const btn = document.createElement('button');
      btn.className = 'button';
      btn.textContent = i;
      btn.style.marginRight = '0.25rem';
      if (i === current) {
        btn.style.backgroundColor = '#2b6cb0';
      }
      btn.addEventListener('click', () => applyFilters(i));
      paginationDiv.appendChild(btn);
    }
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    applyFilters(1);
  });
  // Initial render
  applyFilters(1);
}

async function initScholarshipDetail() {
  const main = document.querySelector('main');
  if (!main) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const scholarships = await getScholarships();
  const scholarship = scholarships.find(s => s.id === id);
  if (!scholarship) {
    main.textContent = 'Scholarship not found.';
    return;
  }
  const section = document.createElement('section');
  section.innerHTML = `
    <h2>${scholarship.title}</h2>
    <p><strong>Country:</strong> ${scholarship.country}</p>
    <p><strong>Eligible Nationality:</strong> ${scholarship.eligibleNationality}</p>
    <p><strong>Level:</strong> ${scholarship.level}</p>
    <p><strong>Field:</strong> ${scholarship.field}</p>
    <p><strong>Deadline:</strong> ${scholarship.deadline}</p>
    <p><strong>Sponsor:</strong> ${scholarship.sponsor}</p>
    <h3>Eligibility</h3>
    <p>${scholarship.eligibility}</p>
    <h3>Benefits</h3>
    <p>${scholarship.benefits}</p>
    <h3>Description</h3>
    <p>${scholarship.description}</p>
    <div style="margin:1rem 0;">
      <a href="${scholarship.link}" class="button" target="_blank">Official Application Link</a>
      <button id="bookmark-detail" class="button" style="margin-left:0.5rem;"></button>
    </div>
    <h3>Share</h3>
    <div id="share-buttons"></div>
  `;
  main.appendChild(section);
  // Bookmark button state
  const bookmarkBtn = document.getElementById('bookmark-detail');
  const updateBookmarkButton = () => {
    const bookmarked = isBookmarked(scholarship.id);
    bookmarkBtn.textContent = bookmarked ? 'Remove Bookmark' : 'Bookmark';
    bookmarkBtn.style.backgroundColor = bookmarked ? '#68d391' : '#3182ce';
  };
  updateBookmarkButton();
  bookmarkBtn.addEventListener('click', () => {
    const res = toggleBookmark(scholarship.id);
    if (!res.success) {
      alert(res.message || 'Please log in to bookmark.');
    } else {
      updateBookmarkButton();
    }
  });
  // Share buttons
  const shareDiv = document.getElementById('share-buttons');
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(`${scholarship.title} – apply by ${scholarship.deadline}`);
  const shareLinks = [
    { name: 'WhatsApp', url: `https://wa.me/?text=${text}%20${url}` },
    { name: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${url}` },
    { name: 'Twitter/X', url: `https://twitter.com/share?text=${text}&url=${url}` },
    { name: 'Email', url: `mailto:?subject=${encodeURIComponent('Scholarship Opportunity')}&body=${text}%20${url}` }
  ];
  shareLinks.forEach(item => {
    const a = document.createElement('a');
    a.href = item.url;
    a.className = 'button';
    a.style.marginRight = '0.5rem';
    a.target = '_blank';
    a.textContent = item.name;
    shareDiv.appendChild(a);
  });
}

function initLoginPage() {
  const main = document.querySelector('main');
  if (!main) return;
  const section = document.createElement('section');
  section.innerHTML = `
    <h2>Login or Register</h2>
    <form id="auth-form">
      <div class="form-group">
        <label for="auth-email">Email</label>
        <input type="email" id="auth-email" required />
      </div>
      <div class="form-group">
        <label for="auth-password">Password</label>
        <input type="password" id="auth-password" required />
      </div>
      <button type="submit" class="button">Login / Register</button>
      <p id="auth-msg" style="margin-top:0.5rem;"></p>
    </form>
  `;
  main.appendChild(section);
  const form = document.getElementById('auth-form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    // Try login first
    let res = loginUser(email, password);
    const msgEl = document.getElementById('auth-msg');
    if (!res.success) {
      // Register
      res = registerUser(email, password);
      if (!res.success) {
        msgEl.style.color = 'red';
        msgEl.textContent = res.message;
        return;
      }
      msgEl.style.color = 'green';
      msgEl.textContent = 'Account created and logged in.';
    } else {
      msgEl.style.color = 'green';
      msgEl.textContent = 'Logged in successfully.';
    }
    updateAuthControls();
    setTimeout(() => {
      window.location.href = res.isAdmin ? 'admin.html' : 'dashboard.html';
    }, 1000);
  });
}

async function initDashboard() {
  const user = getCurrentUser();
  const main = document.querySelector('main');
  if (!user) {
    main.textContent = 'You must be logged in to view this page.';
    return;
  }
  const scholarships = await getScholarships();
  const bookmarks = getBookmarks();
  const saved = scholarships.filter(s => bookmarks.includes(s.id));
  const section = document.createElement('section');
  section.innerHTML = `<h2>Your Saved Scholarships</h2>`;
  const listDiv = document.createElement('div');
  listDiv.className = 'grid';
  saved.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${item.title}</h3>
      <p><strong>Country:</strong> ${item.country}</p>
      <a href="scholarship.html?id=${item.id}" class="button">Details</a>
    `;
    listDiv.appendChild(card);
  });
  if (saved.length === 0) {
    listDiv.textContent = 'You have no saved scholarships yet.';
  }
  section.appendChild(listDiv);
  main.appendChild(section);
}

function generateID(prefix) {
  return prefix + '-' + Math.random().toString(36).substr(2, 9);
}

function initSubmissionPage() {
  const main = document.querySelector('main');
  const user = getCurrentUser();
  if (!user) {
    main.textContent = 'You must be logged in to submit scholarships.';
    return;
  }
  const section = document.createElement('section');
  section.innerHTML = `
    <h2>Submit a Scholarship</h2>
    <form id="submit-form">
      <div class="form-group"><label for="sub-title">Title</label><input type="text" id="sub-title" required /></div>
      <div class="form-group"><label for="sub-country">Country</label><input type="text" id="sub-country" required /></div>
      <div class="form-group"><label for="sub-nationality">Eligible Nationality</label><input type="text" id="sub-nationality" required /></div>
      <div class="form-group"><label for="sub-level">Level (e.g., Undergraduate, Master's, PhD)</label><input type="text" id="sub-level" required /></div>
      <div class="form-group"><label for="sub-field">Field of Study</label><input type="text" id="sub-field" required /></div>
      <div class="form-group"><label for="sub-deadline">Application Deadline</label><input type="date" id="sub-deadline" required /></div>
      <div class="form-group"><label for="sub-sponsor">Sponsor</label><input type="text" id="sub-sponsor" required /></div>
      <div class="form-group"><label for="sub-eligibility">Eligibility</label><textarea id="sub-eligibility" rows="3" required></textarea></div>
      <div class="form-group"><label for="sub-benefits">Benefits</label><textarea id="sub-benefits" rows="3" required></textarea></div>
      <div class="form-group"><label for="sub-description">Description</label><textarea id="sub-description" rows="4" required></textarea></div>
      <div class="form-group"><label for="sub-link">Official Application Link</label><input type="text" id="sub-link" required /></div>
      <div class="form-group"><label for="sub-tags">Tags (comma‑separated)</label><input type="text" id="sub-tags" /></div>
      <button type="submit" class="button">Submit Scholarship</button>
      <p id="sub-msg" style="margin-top:0.5rem;"></p>
    </form>
  `;
  main.appendChild(section);
  const form = document.getElementById('submit-form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const newItem = {
      id: generateID('sub'),
      title: document.getElementById('sub-title').value.trim(),
      country: document.getElementById('sub-country').value.trim(),
      eligibleNationality: document.getElementById('sub-nationality').value.trim(),
      level: document.getElementById('sub-level').value.trim(),
      field: document.getElementById('sub-field').value.trim(),
      deadline: document.getElementById('sub-deadline').value,
      sponsor: document.getElementById('sub-sponsor').value.trim(),
      eligibility: document.getElementById('sub-eligibility').value.trim(),
      benefits: document.getElementById('sub-benefits').value.trim(),
      description: document.getElementById('sub-description').value.trim(),
      link: document.getElementById('sub-link').value.trim(),
      tags: document.getElementById('sub-tags').value.split(',').map(t => t.trim()).filter(t => t)
    };
    saveSubmission(newItem);
    const msgEl = document.getElementById('sub-msg');
    msgEl.style.color = 'green';
    msgEl.textContent = 'Scholarship submitted and awaiting approval.';
    form.reset();
  });
}

async function initAdminPage() {
  const main = document.querySelector('main');
  const user = getCurrentUser();
  if (!user || !user.isAdmin) {
    main.textContent = 'You do not have permission to view this page.';
    return;
  }
  // Ensure an admin account exists in users list
  const users = getUsers();
  const adminIndex = users.findIndex(u => u.email === user.email);
  if (adminIndex !== -1) users[adminIndex].isAdmin = true;
  saveUsers(users);
  // Sections: pending submissions, all scholarships, users, newsletter
  const tabs = document.createElement('div');
  tabs.style.display = 'flex';
  tabs.style.gap = '1rem';
  const tabButtons = ['Submissions', 'Scholarships', 'Users', 'Newsletter'];
  let currentTab = 'Submissions';
  tabButtons.forEach(name => {
    const btn = document.createElement('button');
    btn.className = 'button';
    btn.textContent = name;
    btn.addEventListener('click', () => {
      currentTab = name;
      renderTab();
    });
    tabs.appendChild(btn);
  });
  main.appendChild(tabs);
  const content = document.createElement('div');
  content.style.marginTop = '1rem';
  main.appendChild(content);

  function renderTab() {
    content.innerHTML = '';
    if (currentTab === 'Submissions') {
      const submissions = getSubmissions();
      if (submissions.length === 0) {
        content.textContent = 'No submissions pending.';
        return;
      }
      submissions.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <h3>${item.title}</h3>
          <p><strong>Country:</strong> ${item.country}</p>
          <p><strong>Level:</strong> ${item.level}</p>
          <button class="button approve-btn" data-id="${item.id}" style="background-color:#68d391;margin-right:0.5rem;">Approve</button>
          <button class="button delete-btn" data-id="${item.id}" style="background-color:#e53e3e;">Delete</button>
        `;
        content.appendChild(card);
      });
      content.querySelectorAll('.approve-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          approveSubmission(id);
          renderTab();
        });
      });
      content.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          // Delete from submissions only
          let submissions = getSubmissions();
          submissions = submissions.filter(s => s.id !== id);
          setLocalJSON('submissions', submissions);
          renderTab();
        });
      });
    } else if (currentTab === 'Scholarships') {
      getScholarships().then(list => {
        if (list.length === 0) {
          content.textContent = 'No scholarships available.';
          return;
        }
        list.forEach(item => {
          const card = document.createElement('div');
          card.className = 'card';
          card.innerHTML = `
            <h3>${item.title}</h3>
            <p><strong>Country:</strong> ${item.country}</p>
            <p><strong>Level:</strong> ${item.level}</p>
            <button class="button delete-sch-btn" data-id="${item.id}" style="background-color:#e53e3e;">Delete</button>
          `;
          content.appendChild(card);
        });
        content.querySelectorAll('.delete-sch-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            deleteScholarship(id);
            renderTab();
          });
        });
      });
    } else if (currentTab === 'Users') {
      const users = getUsers();
      if (users.length === 0) {
        content.textContent = 'No users registered.';
        return;
      }
      users.forEach(u => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
          <p><strong>Email:</strong> ${u.email}</p>
          <p><strong>Admin:</strong> ${u.isAdmin ? 'Yes' : 'No'}</p>
        `;
        content.appendChild(div);
      });
    } else if (currentTab === 'Newsletter') {
      const list = getLocalJSON('newsletter');
      if (list.length === 0) {
        content.textContent = 'No newsletter subscriptions yet.';
        return;
      }
      list.forEach(email => {
        const p = document.createElement('p');
        p.textContent = email;
        content.appendChild(p);
      });
    }
  }
  renderTab();
}

async function initContactPage() {
  const main = document.querySelector('main');
  const section = document.createElement('section');
  section.innerHTML = `
    <h2>Contact Us</h2>
    <p>Have a question? Send us a message and we'll get back to you soon.</p>
    <form id="contact-form">
      <div class="form-group"><label for="contact-name">Name</label><input type="text" id="contact-name" required /></div>
      <div class="form-group"><label for="contact-email">Email</label><input type="email" id="contact-email" required /></div>
      <div class="form-group"><label for="contact-message">Message</label><textarea id="contact-message" rows="4" required></textarea></div>
      <button type="submit" class="button">Send Message</button>
      <p id="contact-msg" style="margin-top:0.5rem;"></p>
    </form>
  `;
  main.appendChild(section);
  const form = document.getElementById('contact-form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const message = document.getElementById('contact-message').value.trim();
    submitContactForm(name, email, message);
    const msgEl = document.getElementById('contact-msg');
    msgEl.style.color = 'green';
    msgEl.textContent = 'Message sent successfully!';
    form.reset();
  });
}

async function initBlogPage() {
  const main = document.querySelector('main');
  const posts = await fetchBlogPosts();
  const listSection = document.createElement('section');
  listSection.innerHTML = '<h2>Blog</h2>';
  posts.forEach(post => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${post.title}</h3>
      <p><em>${post.date} | ${post.author}</em></p>
      <p>${post.summary}</p>
      <a href="blog.html?id=${post.id}" class="button">Read More</a>
    `;
    listSection.appendChild(card);
  });
  main.appendChild(listSection);

  // If a specific post is requested
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (id) {
    const post = posts.find(p => p.id === id);
    if (post) {
      const detail = document.createElement('section');
      detail.innerHTML = `
        <h2>${post.title}</h2>
        <p><em>${post.date} | ${post.author}</em></p>
        <p>${post.content}</p>
      `;
      main.appendChild(detail);
    }
  }
}

// Initialize page based on filename
document.addEventListener('DOMContentLoaded', () => {
  loadHeader();
  loadFooter();
  const path = window.location.pathname.split('/').pop();
  const page = path || 'index.html';
  if (page === '' || page === 'index.html') {
    initHomePage();
  } else if (page === 'scholarships.html') {
    initListingPage();
  } else if (page === 'scholarship.html') {
    initScholarshipDetail();
  } else if (page === 'login.html') {
    initLoginPage();
  } else if (page === 'dashboard.html') {
    initDashboard();
  } else if (page === 'submit.html') {
    initSubmissionPage();
  } else if (page === 'admin.html') {
    initAdminPage();
  } else if (page === 'contact.html') {
    initContactPage();
  } else if (page === 'blog.html') {
    initBlogPage();
  }
});