/* ============================================
   script.js — ChallengeAI
   ============================================ */

// ── PAGE DETECTION ──
const PAGE = document.body.contains(document.getElementById('loginForm')) ? 'auth'
           : document.body.contains(document.getElementById('generator'))  ? 'dashboard'
           : 'landing';

// ── AUTH GUARD (dashboard only) ──
if (PAGE === 'dashboard') {
  const user = JSON.parse(sessionStorage.getItem('cai_user') || 'null');
  if (!user) { window.location.href = 'auth.html'; }
  else {
    const name = user.firstName || 'Champion';
    const heroName = document.getElementById('heroName');
    const userNameNav = document.getElementById('userNameNav');
    if (heroName) heroName.textContent = name;
    if (userNameNav) userNameNav.textContent = name;
  }
}

// ── AUTH PAGE: auto-detect tab from URL ──
if (PAGE === 'auth') {
  const params = new URLSearchParams(window.location.search);
  if (params.get('mode') === 'signup') switchTab('signup');
}

// ── THEME ──
function toggleTheme() {
  document.body.classList.toggle('light-mode');
  document.body.classList.toggle('dark-mode');
  const btn = document.querySelector('.theme-toggle');
  if (btn) btn.textContent = document.body.classList.contains('light-mode') ? '☀️' : '🌙';
}

// ── MOBILE NAV ──
function toggleNav() {
  document.getElementById('mobileNav')?.classList.toggle('open');
}

// ── LOGOUT ──
function logout() {
  sessionStorage.removeItem('cai_user');
  window.location.href = 'landing.html';
}

// ──────────────────────────────────────────
//  AUTH FUNCTIONS
// ──────────────────────────────────────────
function switchTab(tab) {
  const loginForm  = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const loginTab   = document.getElementById('loginTab');
  const signupTab  = document.getElementById('signupTab');
  if (!loginForm) return;
  if (tab === 'login') {
    loginForm.style.display  = 'block';
    signupForm.style.display = 'none';
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
  } else {
    loginForm.style.display  = 'none';
    signupForm.style.display = 'block';
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
  }
  clearAllErrors();
}

function clearAllErrors() {
  document.querySelectorAll('.err').forEach(e => e.textContent = '');
  document.querySelectorAll('input, select').forEach(el => el.classList.remove('invalid'));
}

function showErr(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}
function markInvalid(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('invalid');
}
function markValid(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('invalid');
}

// Password visibility toggle
function togglePass(fieldId, btn) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  if (field.type === 'password') { field.type = 'text'; btn.textContent = '🙈'; }
  else { field.type = 'password'; btn.textContent = '👁'; }
}

// Password strength
const regPassEl = document.getElementById('regPass');
if (regPassEl) {
  regPassEl.addEventListener('input', function() {
    const val = this.value;
    const bar = document.getElementById('passStrength');
    if (!bar) return;
    let strength = 0;
    if (val.length >= 8) strength++;
    if (/[A-Z]/.test(val)) strength++;
    if (/[0-9]/.test(val)) strength++;
    if (/[^A-Za-z0-9]/.test(val)) strength++;
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['', '#e05a7a', '#f0a060', '#f0c060', '#50c878'];
    bar.innerHTML = `<div class="strength-bar"><div style="width:${strength*25}%;background:${colors[strength]};height:4px;border-radius:2px;transition:all .3s"></div></div><span style="font-size:.75rem;color:${colors[strength]}">${labels[strength]}</span>`;
  });
}

// ── LOGIN HANDLER ──
function handleLogin(e) {
  e.preventDefault();
  clearAllErrors();
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPass').value;
  let valid = true;

  if (!email) { showErr('loginEmailErr','Email is required'); markInvalid('loginEmail'); valid=false; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showErr('loginEmailErr','Enter a valid email'); markInvalid('loginEmail'); valid=false; }
  else markValid('loginEmail');

  if (!pass) { showErr('loginPassErr','Password is required'); markInvalid('loginPass'); valid=false; }
  else if (pass.length !== 8) { showErr('loginPassErr','Password must be exactly 8 characters'); markInvalid('loginPass'); valid=false; }
  else markValid('loginPass');

  if (!valid) return;

  // Check stored users (session only)
  const users = JSON.parse(sessionStorage.getItem('cai_users') || '[]');
  const found = users.find(u => u.email === email && u.password === pass);
  if (!found) {
    showErr('loginPassErr', 'Invalid email or password');
    markInvalid('loginEmail'); markInvalid('loginPass');
    return;
  }

  sessionStorage.setItem('cai_user', JSON.stringify(found));

  document.getElementById('loginForm').style.display = 'none';
  const suc = document.getElementById('authSuccess');
  document.getElementById('successHead').textContent = `Welcome back, ${found.firstName}!`;
  document.getElementById('successBody').textContent = 'Taking you to your dashboard...';
  suc.classList.add('show');
  setTimeout(() => { window.location.href = 'index.html'; }, 1500);
}

// ── SIGNUP HANDLER ──
function handleSignup(e) {
  e.preventDefault();
  clearAllErrors();
  const first  = document.getElementById('regFirst').value.trim();
  const last   = document.getElementById('regLast').value.trim();
  const email  = document.getElementById('regEmail').value.trim();
  const pass   = document.getElementById('regPass').value;
  const pass2  = document.getElementById('regPass2').value;
  const cat    = document.getElementById('regCat').value;
  const agree  = document.getElementById('agreeTerms').checked;
  let valid = true;

  if (!first) { showErr('regFirstErr','First name is required'); markInvalid('regFirst'); valid=false; }
  else if (first.length < 2) { showErr('regFirstErr','At least 2 characters'); markInvalid('regFirst'); valid=false; }
  else markValid('regFirst');

  if (!last) { showErr('regLastErr','Last name is required'); markInvalid('regLast'); valid=false; }
  else markValid('regLast');

  if (!email) { showErr('regEmailErr','Email is required'); markInvalid('regEmail'); valid=false; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showErr('regEmailErr','Enter a valid email'); markInvalid('regEmail'); valid=false; }
  else markValid('regEmail');

  if (!pass) { showErr('regPassErr','Password is required'); markInvalid('regPass'); valid=false; }
  else if (pass.length !== 8) { showErr('regPassErr','Password must be exactly 8 characters'); markInvalid('regPass'); valid=false; }
  else if ((pass.match(/[A-Z]/g) || []).length !== 1) { showErr('regPassErr','Password must contain exactly one uppercase letter'); markInvalid('regPass'); valid=false; }
  else if (!/[0-9]/.test(pass)) { showErr('regPassErr','Include at least one number'); markInvalid('regPass'); valid=false; }
  else markValid('regPass');

  if (!pass2) { showErr('regPass2Err','Please confirm your password'); markInvalid('regPass2'); valid=false; }
  else if (pass !== pass2) { showErr('regPass2Err','Passwords do not match'); markInvalid('regPass2'); valid=false; }
  else markValid('regPass2');

  if (!cat) { showErr('regCatErr','Please select a category'); markInvalid('regCat'); valid=false; }
  else markValid('regCat');

  if (!agree) { showErr('agreeTermsErr','You must agree to the terms'); valid=false; }

  if (!valid) return;

  // Check duplicate email
  const users = JSON.parse(sessionStorage.getItem('cai_users') || '[]');
  if (users.find(u => u.email === email)) {
    showErr('regEmailErr','This email is already registered'); markInvalid('regEmail'); return;
  }

  const newUser = { firstName: first, lastName: last, email, password: pass, favCat: cat };
  users.push(newUser);
  sessionStorage.setItem('cai_users', JSON.stringify(users));
  sessionStorage.setItem('cai_user', JSON.stringify(newUser));

  document.getElementById('signupForm').style.display = 'none';
  const suc = document.getElementById('authSuccess');
  document.getElementById('successHead').textContent = `Welcome, ${first}!`;
  document.getElementById('successBody').textContent = 'Your account is ready. Taking you to your dashboard...';
  suc.classList.add('show');
  setTimeout(() => { window.location.href = 'index.html'; }, 1800);
}

// ──────────────────────────────────────────
//  CHALLENGE DATA
// ──────────────────────────────────────────
const challenges = {
  Fitness: [
    { title: "100 Rep Bodyweight Blitz", description: "Complete 100 total reps using any combination of push-ups, squats, and lunges. Rest as needed but track your total time.", duration: "20 minutes", difficulty: "Medium", tip: "Break reps into sets of 10–15 to stay consistent." },
    { title: "Wall Sit Endurance Test", description: "Hold a wall sit for as long as possible. Rest 60 seconds, then repeat 3 times. Beat your first time on the last round.", duration: "15 minutes", difficulty: "Hard", tip: "Keep your back flat against the wall and breathe steadily." },
    { title: "Morning Stretch Routine", description: "Do a full-body 10-minute stretch focusing on hips, hamstrings, shoulders, and neck. Hold each stretch for 30 seconds.", duration: "10 minutes", difficulty: "Easy", tip: "Do this right after waking up before checking your phone." },
    { title: "Stair Climb Sprint", description: "Find a staircase and climb it 10 times as fast as you can. Walk down each time as your rest.", duration: "15 minutes", difficulty: "Hard", tip: "Pump your arms — it helps more than you think." },
    { title: "Plank Challenge", description: "Hold a plank for 1 minute, rest 30 seconds, and repeat 5 times. Focus on keeping your core tight throughout.", duration: "12 minutes", difficulty: "Medium", tip: "Look at the floor, not forward, to keep your neck neutral." },
  ],
  Mindfulness: [
    { title: "5-Minute Breath Reset", description: "Find a quiet spot and practice box breathing — inhale 4s, hold 4s, exhale 4s, hold 4s. Repeat for 5 minutes.", duration: "5 minutes", difficulty: "Easy", tip: "Close your eyes and focus on the physical sensation of air." },
    { title: "Gratitude Journal Sprint", description: "Write down 10 things you are genuinely grateful for right now. Be specific — avoid generic answers.", duration: "10 minutes", difficulty: "Easy", tip: "The more specific you are, the more powerful the effect." },
    { title: "Digital Detox Hour", description: "Put your phone in another room for one full hour. No screens. Sit, walk, read a physical book, or just be present.", duration: "1 hour", difficulty: "Medium", tip: "Tell someone you'll be offline so you don't feel anxious." },
    { title: "Body Scan Meditation", description: "Lie down and slowly bring attention to each part of your body from toes to head. Notice tension without trying to fix it.", duration: "15 minutes", difficulty: "Easy", tip: "Use a free guided body scan on YouTube if it helps to start." },
    { title: "Mindful Meal", description: "Eat one meal today with zero distractions — no phone, no TV. Chew slowly and notice every flavor and texture.", duration: "20 minutes", difficulty: "Medium", tip: "Put your fork down between every bite to slow yourself down." },
  ],
  Creativity: [
    { title: "Blind Contour Portrait", description: "Draw a portrait of someone without looking at your paper. Keep your pen moving the entire time without lifting it.", duration: "10 minutes", difficulty: "Easy", tip: "Don't judge the result — the process is the point." },
    { title: "6-Word Story Challenge", description: "Write 5 different stories, each exactly 6 words long. Try to make each one tell a complete emotional narrative.", duration: "15 minutes", difficulty: "Easy", tip: "Start with an emotion you felt recently and work backwards." },
    { title: "Photo Walk", description: "Go outside with your phone and take 20 photos with a theme — shadows, textures, reflections, or anything symmetrical.", duration: "30 minutes", difficulty: "Easy", tip: "Shoot from low angles and close up — change your perspective." },
    { title: "Remake a Song Differently", description: "Take any song you love and rewrite its chorus in a completely different genre — country, rap, opera.", duration: "20 minutes", difficulty: "Medium", tip: "Focus on matching the rhythm of the original lyrics first." },
    { title: "30-Circle Drawing", description: "Draw 30 circles on paper and turn each one into a different object or face in 10 minutes. Speed is the goal.", duration: "10 minutes", difficulty: "Easy", tip: "Don't overthink — your first instinct is usually the best one." },
  ],
  Learning: [
    { title: "10-Minute Deep Dive", description: "Pick one concept you've always wanted to understand. Spend 10 focused minutes reading about it from a reliable source.", duration: "10 minutes", difficulty: "Easy", tip: "Write down one key takeaway afterward to cement it in memory." },
    { title: "Teach It Back", description: "Pick something you learned this week and explain it out loud as if teaching a 10-year-old. Record yourself.", duration: "15 minutes", difficulty: "Medium", tip: "If you struggle to explain it simply, you don't fully know it yet." },
    { title: "New Language: 10 Words", description: "Learn 10 words in a language you've never studied. Write them, say them out loud, and use them in a sentence.", duration: "20 minutes", difficulty: "Easy", tip: "Pick words you'd actually use in daily conversation first." },
    { title: "Documentary Challenge", description: "Watch a short documentary (under 30 min) on a topic completely outside your usual interests. Take 3 notes while watching.", duration: "30 minutes", difficulty: "Easy", tip: "YouTube and Vimeo have hundreds of free short docs." },
    { title: "Flashcard Sprint", description: "Create 15 flashcards on any topic you want to learn. Write the question on one side and the answer on the other.", duration: "20 minutes", difficulty: "Easy", tip: "Use Anki (free app) to review them with spaced repetition." },
  ],
  Social: [
    { title: "Reconnect Message", description: "Send a genuine, thoughtful message to someone you haven't spoken to in over a month. Ask how they're really doing.", duration: "5 minutes", difficulty: "Easy", tip: "Mention a specific memory or shared interest to make it feel real." },
    { title: "Compliment 3 People", description: "Give 3 genuine, specific compliments today — to coworkers, friends, or even strangers. Be sincere, not generic.", duration: "All day", difficulty: "Easy", tip: "Compliment something they did or created, not just how they look." },
    { title: "Coffee Chat Invite", description: "Ask someone you admire but don't know well to grab a coffee or a 15-min call. Keep your message short and genuine.", duration: "5 minutes", difficulty: "Medium", tip: "Say why you want to connect — people appreciate specificity." },
    { title: "Leave a Positive Review", description: "Think of a local business or product that genuinely helped you. Write a detailed, honest positive review.", duration: "10 minutes", difficulty: "Easy", tip: "Mention one specific thing that stood out — it makes it credible." },
    { title: "Active Listening Challenge", description: "In your next conversation, ask 3 follow-up questions and don't talk about yourself unless directly asked.", duration: "One conversation", difficulty: "Medium", tip: "Reflect back what they said before asking your next question." },
  ],
  Nutrition: [
    { title: "Rainbow Plate Challenge", description: "Eat at least 5 different colored vegetables or fruits today. Document each one as you eat it.", duration: "All day", difficulty: "Medium", tip: "Prep them in the morning so they're easy to grab later." },
    { title: "No Sugar Before Noon", description: "Avoid all added sugar until after 12pm today — including coffee sweeteners, juices, and breakfast cereals.", duration: "Half day", difficulty: "Medium", tip: "Drink black coffee or tea — you'll adjust faster than you think." },
    { title: "Cook a New Vegetable", description: "Buy one vegetable you've never cooked before and look up a simple recipe. Make it your main side dish today.", duration: "30 minutes", difficulty: "Easy", tip: "Roasting almost any vegetable with olive oil and salt is foolproof." },
    { title: "Hydration Tracker Day", description: "Drink 8 full glasses of water today. Set an alarm every 90 minutes as a reminder and track each glass.", duration: "All day", difficulty: "Easy", tip: "Drink a full glass right when you wake up before anything else." },
    { title: "Meal Prep 3 Lunches", description: "Spend 45 minutes today prepping 3 healthy lunches for the week. Keep it simple — protein, veg, and carb.", duration: "45 minutes", difficulty: "Medium", tip: "Batch cook a grain like rice or quinoa — it saves the most time." },
  ],
  Productivity: [
    { title: "Single-Task Sprint", description: "Choose your most important task and work on ONLY that for 45 uninterrupted minutes. No phone, no tabs, no distractions.", duration: "45 minutes", difficulty: "Medium", tip: "Put your phone in another room before you start the timer." },
    { title: "Inbox Zero", description: "Clear your entire email inbox today. Archive, reply, delete, or create a folder for everything. Get to zero.", duration: "1 hour", difficulty: "Hard", tip: "Unsubscribe from 5 newsletters while you're in there." },
    { title: "Tomorrow's Top 3", description: "Before bed tonight, write down the 3 most important things you need to accomplish tomorrow. Nothing more.", duration: "5 minutes", difficulty: "Easy", tip: "Order them by importance — tackle number one before anything else." },
    { title: "Tab Audit", description: "Close every browser tab you have open right now. Bookmark anything you actually need. Start fresh with a clean browser.", duration: "10 minutes", difficulty: "Easy", tip: "If you haven't looked at a tab in 2 days, you don't need it." },
    { title: "2-Minute Rule Day", description: "Any task that takes less than 2 minutes — do it immediately today. Don't defer it to a list.", duration: "All day", difficulty: "Medium", tip: "Reply to short messages, wash one dish, file one document — now." },
  ],
  Adventure: [
    { title: "Unknown Street Walk", description: "Walk for 20 minutes taking only streets or paths you've never been on before. See what you discover.", duration: "20 minutes", difficulty: "Easy", tip: "Leave your destination open — the adventure is in the unknown." },
    { title: "Sunrise or Sunset Watch", description: "Find a good spot and watch today's sunrise or sunset without your phone in your hand. Just watch.", duration: "30 minutes", difficulty: "Easy", tip: "Check the exact time online and leave 10 minutes early." },
    { title: "Try a New Cuisine", description: "Find a restaurant or recipe from a country whose food you've never eaten. Order or cook something completely unfamiliar.", duration: "1 hour", difficulty: "Easy", tip: "Ask the restaurant owner what they personally recommend." },
    { title: "Visit Somewhere New Nearby", description: "Find a park, cafe, museum, or street in your own city that you've never been to. Go explore it today.", duration: "1–2 hours", difficulty: "Easy", tip: "Search 'your city hidden gems' for inspiration before you go." },
    { title: "Cold Water Challenge", description: "End your shower today with 60 seconds of cold water. Focus on controlled breathing while you do it.", duration: "5 minutes", difficulty: "Hard", tip: "Count slowly to 60 — the mental focus makes it more manageable." },
  ],
};

// ──────────────────────────────────────────
//  GENERATOR
// ──────────────────────────────────────────
let selectedCat = 'Fitness';
let currentChallenge = null;

function selectCat(el) {
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  selectedCat = el.dataset.cat;
  document.getElementById('resultBox').classList.remove('visible');
  document.querySelector('.btn-text').textContent = '✦ Generate My Challenge';
  currentChallenge = null;
}

function generateChallenge() {
  const list = challenges[selectedCat];
  currentChallenge = list[Math.floor(Math.random() * list.length)];
  showResult(currentChallenge);
  document.querySelector('.btn-text').textContent = '✦ Generate Another Challenge';
}

function showResult(d) {
  document.getElementById('resCat').textContent = selectedCat;
  document.getElementById('resTitle').textContent = d.title;
  document.getElementById('resDesc').textContent = d.description;
  document.getElementById('resMeta').innerHTML = `
    <div class="meta-pill">⏱ Duration: <span>${d.duration}</span></div>
    <div class="meta-pill">🔥 Difficulty: <span>${d.difficulty}</span></div>
    <div class="meta-pill">💡 Tip: <span>${d.tip}</span></div>
  `;
  const box = document.getElementById('resultBox');
  box.classList.remove('visible');
  void box.offsetWidth;
  box.classList.add('visible');
}

function copyChallenge() {
  const title = document.getElementById('resTitle').textContent;
  const desc  = document.getElementById('resDesc').textContent;
  navigator.clipboard.writeText(`${title}\n\n${desc}`).then(() => {
    const btn = document.querySelector('.copy-btn');
    btn.textContent = '✅ Copied!';
    setTimeout(() => btn.textContent = '📋 Copy', 2000);
  });
}

// ──────────────────────────────────────────
//  TRACKER
// ──────────────────────────────────────────
let trackerData = [];

function addToTracker() {
  if (!currentChallenge) {
    alert('Generate a challenge first!');
    return;
  }
  // English-only check (no non-Latin / non-ASCII characters in title)
  if (/[^\x00-\x7F]/.test(currentChallenge.title)) {
    alert('Challenge title must be in English only.');
    return;
  }
  // Avoid exact duplicate
  const exists = trackerData.find(r => r.title === currentChallenge.title && r.category === selectedCat);
  if (exists) {
    alert('This challenge is already in your tracker!');
    return;
  }
  const row = {
    id: Date.now(),
    title: currentChallenge.title,
    category: selectedCat,
    difficulty: currentChallenge.difficulty,
    duration: currentChallenge.duration,
    date: new Date().toLocaleDateString('en-GB'),
    status: 'Pending'
  };
  trackerData.push(row);
  renderTable();
  updateStats();

  // Feedback on button
  const btn = document.querySelector('.add-btn');
  btn.textContent = '✅ Added!';
  setTimeout(() => btn.textContent = '➕ Add to Tracker', 2000);

  // Scroll to tracker
  document.getElementById('tracker').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderTable(data) {
  const rows = data || trackerData;
  const tbody = document.getElementById('tableBody');
  if (!tbody) return;

  if (rows.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="7"><div class="empty-state"><div class="empty-icon">📋</div><div>No challenges yet — generate one above and click "Add to Tracker"!</div></div></td></tr>`;
    updateStats();
    return;
  }

  tbody.innerHTML = rows.map(r => `
    <tr id="row-${r.id}">
      <td>${r.title}</td>
      <td>${r.category}</td>
      <td><span class="badge badge-${r.difficulty.toLowerCase()}">${r.difficulty}</span></td>
      <td>${r.duration}</td>
      <td>${r.date}</td>
      <td>
        <button class="status-toggle ${r.status === 'Done' ? 'done' : ''}"
          onclick="toggleStatus(${r.id})">
          ${r.status === 'Done' ? '✅ Done' : '⏳ Pending'}
        </button>
      </td>
      <td><button class="remove-btn" onclick="removeRow(${r.id})" title="Remove">🗑</button></td>
    </tr>
  `).join('');
  updateStats();
}

function toggleStatus(id) {
  const row = trackerData.find(r => r.id === id);
  if (!row) return;
  row.status = row.status === 'Done' ? 'Pending' : 'Done';
  renderTable();
  updateStats();
}

function removeRow(id) {
  trackerData = trackerData.filter(r => r.id !== id);
  renderTable();
  updateStats();
}

function clearCompleted() {
  trackerData = trackerData.filter(r => r.status !== 'Done');
  renderTable();
  updateStats();
}

function updateStats() {
  const total   = trackerData.length;
  const done    = trackerData.filter(r => r.status === 'Done').length;
  const pending = total - done;

  // Navbar stats
  const stTotal   = document.getElementById('statTotal');
  const stDone    = document.getElementById('statDone');
  const stPending = document.getElementById('statPending');
  if (stTotal)   stTotal.textContent   = total;
  if (stDone)    stDone.textContent    = done;
  if (stPending) stPending.textContent = pending;

  // Table stats
  const statsEl = document.getElementById('tableStats');
  if (statsEl && total > 0) {
    statsEl.innerHTML = `Total: <span>${total}</span> &nbsp;|&nbsp; Completed: <span>${done}</span> &nbsp;|&nbsp; Pending: <span>${pending}</span>`;
  } else if (statsEl) {
    statsEl.innerHTML = '';
  }
}

// ── SEARCH ──
function filterTable() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const filtered = trackerData.filter(r =>
    r.title.toLowerCase().includes(q) ||
    r.category.toLowerCase().includes(q) ||
    r.difficulty.toLowerCase().includes(q)
  );
  renderTable(filtered);
}

// ── SORT (dropdown) ──
function sortTable() {
  const val = document.getElementById('sortSelect').value;
  const sorted = [...trackerData];
  if (val === 'date-desc') sorted.sort((a,b) => b.id - a.id);
  else if (val === 'date-asc') sorted.sort((a,b) => a.id - b.id);
  else if (val === 'cat')  sorted.sort((a,b) => a.category.localeCompare(b.category));
  else if (val === 'diff') sorted.sort((a,b) => ['Easy','Medium','Hard'].indexOf(a.difficulty) - ['Easy','Medium','Hard'].indexOf(b.difficulty));
  else if (val === 'status') sorted.sort((a,b) => a.status.localeCompare(b.status));
  renderTable(sorted);
}

// ── SORT (column header click) ──
let colSortDir = {};
function sortByCol(col) {
  colSortDir[col] = colSortDir[col] === 'asc' ? 'desc' : 'asc';
  const dir = colSortDir[col] === 'asc' ? 1 : -1;
  const sorted = [...trackerData].sort((a,b) => {
    const av = (a[col] || '').toString().toLowerCase();
    const bv = (b[col] || '').toString().toLowerCase();
    return av < bv ? -dir : av > bv ? dir : 0;
  });
  renderTable(sorted);
}

// ──────────────────────────────────────────
//  GALLERY FILTER
// ──────────────────────────────────────────
function filterGallery(cat, btn) {
  document.querySelectorAll('.gal-filter').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.gal-item').forEach(item => {
    if (cat === 'all' || item.dataset.cat === cat) {
      item.classList.remove('hidden');
      item.style.animation = 'fadeUp .4s ease both';
    } else {
      item.classList.add('hidden');
    }
  });
}

// ──────────────────────────────────────────
//  HOVER CARDS
// ──────────────────────────────────────────
function hoverCard(el, title, desc) {
  el.querySelector('h3').textContent = title;
  el.querySelector('p').textContent  = desc;
  el.style.background = 'rgba(240,192,96,.08)';
  el.style.borderColor = 'rgba(240,192,96,.5)';
}
function unhoverCard(el) {
  const originals = {
    '🎯 Tailored to You': ['Category-Specific', 'No generic content. Every challenge fits exactly what you want to improve.'],
    '🔀 Always Different': ['Always Fresh', 'Multiple challenges per category means you always get something new.'],
    '📋 Your Progress':   ['Track Progress',  'Log challenges, mark them done, and build your daily streak.'],
    '⚡ Zero Wait':       ['Instant Results', 'No waiting. Pick a category and your challenge appears instantly.'],
    '🌤️ Weather-Smart':   ['Weather-Smart',   'Outdoor or indoor — we suggest based on what the weather is doing.'],
  };
  const h3 = el.querySelector('h3');
  const p  = el.querySelector('p');
  // find by scanning keys
  for (const [hoverTitle, [orig, origDesc]] of Object.entries(originals)) {
    if (h3.textContent === hoverTitle) {
      h3.textContent = orig;
      p.textContent  = origDesc;
      break;
    }
  }
  el.style.background  = '';
  el.style.borderColor = '';
}

// ──────────────────────────────────────────
//  WEATHER API
// ──────────────────────────────────────────
function fetchWeather() {
  if (!navigator.geolocation) { setWeatherFallback(); return; }
  navigator.geolocation.getCurrentPosition(async pos => {
    try {
      const { latitude: lat, longitude: lon } = pos.coords;
      // Open-Meteo — free, no API key needed
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
      const res  = await fetch(url);
      const data = await res.json();
      const cw   = data.current_weather;
      const temp = Math.round(cw.temperature);
      const code = cw.weathercode;

      let icon = '🌤️', desc = 'Clear skies', suggestion = '🌍 Great day for an outdoor Adventure challenge!';
      if (code === 0) { icon='☀️'; desc=`Sunny, ${temp}°C`; suggestion='☀️ Perfect for an outdoor Fitness or Adventure challenge!'; }
      else if (code <= 3) { icon='⛅'; desc=`Partly cloudy, ${temp}°C`; suggestion='⛅ Nice conditions — try a Fitness challenge outside!'; }
      else if (code <= 48) { icon='🌫️'; desc=`Foggy, ${temp}°C`; suggestion='🧘 Perfect Mindfulness weather — stay in and reflect.'; }
      else if (code <= 67) { icon='🌧️'; desc=`Rainy, ${temp}°C`; suggestion='🎨 Rainy day? Perfect for a Creativity challenge indoors!'; }
      else if (code <= 77) { icon='❄️'; desc=`Snowy, ${temp}°C`; suggestion='📚 Snow day — great for a Learning challenge indoors!'; }
      else { icon='⛈️'; desc=`Stormy, ${temp}°C`; suggestion='⚡ Stay in and tackle a Productivity challenge!'; }

      document.getElementById('weatherIcon').textContent      = icon;
      document.getElementById('weatherTitle').textContent     = desc;
      document.getElementById('weatherSub').textContent       = 'Based on your current location';
      document.getElementById('weatherSuggestion').textContent = suggestion;
    } catch { setWeatherFallback(); }
  }, setWeatherFallback);
}

function setWeatherFallback() {
  document.getElementById('weatherIcon').textContent       = '🌤️';
  document.getElementById('weatherTitle').textContent      = 'Weather unavailable';
  document.getElementById('weatherSub').textContent        = 'Allow location for weather suggestions';
  document.getElementById('weatherSuggestion').textContent = '⚡ Try any challenge — every day is a good day!';
}

// ──────────────────────────────────────────
//  LANDING PAGE: hover cards (same originals without dashboard text)
// ──────────────────────────────────────────
// These work on both landing and dashboard pages via the hoverCard/unhoverCard fn above

// ──────────────────────────────────────────
//  INIT
// ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (PAGE === 'dashboard') {
    renderTable();
    fetchWeather();
    updateStats();
  }
});
