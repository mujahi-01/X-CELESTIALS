let allMembers = [];

// --- 1. CONFIG & NAVIGATION ---
const FILES = {
    home: 'home.json',
    members: 'members.json',
    achievements: 'achievements.json',
    notices: 'notice.json',
    media: 'media.json',
    join: 'join.json'
};

function switchView(viewName) {
    document.querySelectorAll('.view-section').forEach(el => {
        el.style.display = 'none';
        el.classList.remove('active');
    });
    const activeView = document.getElementById(`view-${viewName}`);
    if (activeView) {
        activeView.style.display = 'block';
        setTimeout(() => activeView.classList.add('active'), 10);
    }
    document.getElementById('sidebar').classList.remove('active');
}

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('active'); }

// --- 2. DATA LOADING ---
document.addEventListener('DOMContentLoaded', () => {
    // Load all data independently for speed
    loadHome();
    loadMembers();
    loadAchievements();
    loadNotices();
    loadMedia();
    loadJoin();

    // Search Listener
    document.getElementById('searchInput').addEventListener('input', (e) => filterMembers(e.target.value));
});

// Generic Fetcher
async function fetchData(filename) {
    try {
        const response = await fetch(filename);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (err) {
        console.error(`Error loading ${filename}:`, err);
        return null;
    }
}

// --- 3. RENDER FUNCTIONS ---

// RENDER HOME
async function loadHome() {
    const data = await fetchData(FILES.home);
    if (!data) return;
    
    document.getElementById('home-title').textContent = data.title;
    document.getElementById('home-tagline').textContent = data.tagline;
    document.getElementById('home-desc').textContent = data.description;
    
    const statsContainer = document.getElementById('home-stats');
    statsContainer.innerHTML = data.stats.map(stat => `
        <div class="stat-box">
            <h3>${stat.value}</h3>
            <span>${stat.label}</span>
        </div>
    `).join('');
}

// RENDER MEMBERS (Slider + Grid)
async function loadMembers() {
    const data = await fetchData(FILES.members);
    if (!data) return;
    allMembers = data.members;

    const gridContainer = document.getElementById('members-grid');
    const sliderContainer = document.getElementById('featured-slider');
    
    gridContainer.innerHTML = '';
    sliderContainer.innerHTML = '';

    // 1. Populate Slider (Featured only)
    const featuredMembers = allMembers.filter(m => m.featured === true);
    
    if (featuredMembers.length > 0) {
        featuredMembers.forEach(member => {
            const card = createCard(member, 'featured');
            sliderContainer.appendChild(card);
        });
    } else {
        // If no featured, hide slider label
        sliderContainer.style.display = 'none';
        document.querySelector('.subsection-label').style.display = 'none';
    }

    // 2. Populate Grid (Everyone)
    renderGrid(allMembers);
}

function renderGrid(members) {
    const container = document.getElementById('members-grid');
    container.innerHTML = '';
    members.forEach(member => {
        container.appendChild(createCard(member, 'mini'));
    });
}

// Helper to create card HTML
function createCard(member, type) {
    const card = document.createElement('div');
    const imgPath = member.image ? `img/${member.image}` : 'img/default.jpg';
    
    // Classes
    card.className = type === 'featured' ? 'glass squircle featured-card' : 'glass squircle mini-card';
    
    // Tier Classes
    const tierClass = `tier-${member.tier || 'normal'}`;
    card.classList.add(tierClass);

    card.onclick = () => openMemberModal(member);

    card.innerHTML = `
        <img src="${imgPath}" class="${type === 'featured' ? 'featured-img' : 'mini-img'}" onerror="this.src='https://via.placeholder.com/150'">
        <div class="${type === 'featured' ? 'mini-name' : 'mini-name'}" style="${type==='featured'?'font-size:16px':''}">${member.name}</div>
        <div class="mini-uid">${member.uid}</div>
        ${type === 'featured' ? `<div style="font-size:11px; opacity:0.7; margin-top:5px">${member.tier ? member.tier.toUpperCase() : ''}</div>` : ''}
    `;
    return card;
}

// RENDER ACHIEVEMENTS
async function loadAchievements() {
    const data = await fetchData(FILES.achievements);
    if (!data) return;
    const container = document.getElementById('achievement-container');
    container.innerHTML = data.achievements.map(a => `
        <div class="glass squircle card">
            <h2>${a.title}</h2>
            <p>${a.description}</p>
        </div>
    `).join('');
}

// RENDER NOTICES
async function loadNotices() {
    const data = await fetchData(FILES.notices);
    if (!data) return;
    const container = document.getElementById('notice-container');
    container.innerHTML = data.notices.map(n => `
        <div class="glass squircle notice-card ${n.urgent ? 'notice-urgent' : ''}">
            <div class="notice-date">${n.date}</div>
            <div class="notice-title">${n.title}</div>
            <div class="notice-body">${n.content}</div>
        </div>
    `).join('');
}

// RENDER MEDIA
async function loadMedia() {
    const data = await fetchData(FILES.media);
    if (!data) return;
    const container = document.getElementById('media-container');
    container.innerHTML = data.media.map(m => `
        <div class="glass squircle media-card" style="padding:20px; margin-bottom:20px">
            <div class="video-placeholder squircle">
                ${m.type === 'video' ? '🎬' : '📷'} ${m.placeholder_text}
            </div>
            <h3>${m.title}</h3>
            <p style="opacity:0.6">${m.description}</p>
        </div>
    `).join('');
}

// RENDER JOIN
async function loadJoin() {
    const data = await fetchData(FILES.join);
    if (!data) return;
    const list = document.getElementById('join-reqs');
    list.innerHTML = data.requirements.map(req => `<li>${req}</li>`).join('');
}

// --- 4. UTILS & MODALS ---
function toggleSearch() {
    const input = document.getElementById('searchInput');
    input.classList.toggle('active');
    if (input.classList.contains('active')) input.focus();
}

function filterMembers(query) {
    const lower = query.toLowerCase();
    const filtered = allMembers.filter(m => 
        (m.name && m.name.toLowerCase().includes(lower)) ||
        (m.uid && m.uid.toString().includes(lower)) ||
        (m.tag && m.tag.toLowerCase().includes(lower))
    );
    renderGrid(filtered);
}

function openMemberModal(member) {
    document.getElementById('modal-name').textContent = member.name;
    document.getElementById('modal-uid').textContent = `UID: ${member.uid}`;
    document.getElementById('modal-bio').textContent = member.bio || "No bio available.";
    document.getElementById('modal-img').src = member.image ? `img/${member.image}` : 'https://via.placeholder.com/400';
    
    const achBox = document.getElementById('modal-achievement-box');
    if (member.achievement) {
        achBox.style.display = 'block';
        document.getElementById('modal-achievement').textContent = member.achievement;
    } else {
        achBox.style.display = 'none';
    }
    
    const modal = document.getElementById('profile-modal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
}

function closeModal() {
    const modal = document.getElementById('profile-modal');
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 300);
}

function openGloryModal() {
    const modal = document.getElementById('glory-modal');
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('active'), 10);
}

function closeGloryModal() {
    const modal = document.getElementById('glory-modal');
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 300);
}

// Ripple Effect
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('glass-button') || e.target.classList.contains('icon-btn')) {
        const ripple = document.createElement('div');
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.4)';
        ripple.style.width = '100px'; ripple.style.height = '100px';
        ripple.style.left = (e.offsetX - 50) + 'px';
        ripple.style.top = (e.offsetY - 50) + 'px';
        ripple.style.animation = 'rippleEffect 0.6s ease-out';
        ripple.style.pointerEvents = 'none';
        e.target.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }
});
// Dynamic CSS for ripple
const style = document.createElement('style');
style.textContent = `@keyframes rippleEffect { from { transform: scale(0); opacity: 1; } to { transform: scale(4); opacity: 0; } }`;
document.head.appendChild(style);
