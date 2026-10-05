/**
 * MAIN INTERACTION ENGINE
 * Background Arcane Canvas, Layer Switcher, Ability Kit HUD, Modals & Dispatches
 */

// ==========================================================================
// 1. LAYER SWITCHER: THE RIFT (LAYER 1) vs CHAMPION INFO / RESUME (LAYER 2)
// ==========================================================================
function switchLayer(layerName) {
  const riftLayer = document.getElementById('rift-experience-layer');
  const resumeLayer = document.getElementById('champion-info-layer');
  const btnRift = document.getElementById('btn-layer-rift');
  const btnResume = document.getElementById('btn-layer-resume');

  if (window.arcaneAudio) window.arcaneAudio.playClick();

  if (layerName === 'resume') {
    if (riftLayer) riftLayer.style.display = 'none';
    if (resumeLayer) {
      resumeLayer.classList.add('active');
      resumeLayer.style.display = 'block';
    }
    if (btnResume) btnResume.classList.add('active');
    if (btnRift) btnRift.classList.remove('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    if (resumeLayer) {
      resumeLayer.classList.remove('active');
      resumeLayer.style.display = 'none';
    }
    if (riftLayer) riftLayer.style.display = 'block';
    if (btnRift) btnRift.classList.add('active');
    if (btnResume) btnResume.classList.remove('active');
  }
}

window.switchLayer = switchLayer;

// ==========================================================================
// 2. MODAL INSPECTOR SYSTEM
// ==========================================================================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  if (window.arcaneAudio) window.arcaneAudio.playUnlock();
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
  if (window.arcaneAudio) window.arcaneAudio.playClick();
}

window.openModal = openModal;
window.closeModal = closeModal;

// ==========================================================================
// 3. ABILITY KIT INTERACTIVE SYSTEM
// ==========================================================================
const abilitiesData = {
  passive: {
    key: "PASSIVE",
    title: "Financial Thinking",
    flavor: "Inherent comprehension of institutional flows, banking operations, and financial structures.",
    desc: "Analytical perspective grounded in International Finance at Foreign Trade University. Spans wholesale banking operations (Treasury & Trade Finance), retail banking processes, and systematic comparative analysis of corporate and financial institution metrics.",
    skills: ["International Finance", "Financial Analysis", "Banking Operations", "Trade Finance", "Treasury Controls", "CASA / LDR / NPL Analysis"]
  },
  q: {
    key: "Q",
    title: "Data Exploration & Feature Engineering",
    flavor: "Unraveling high-dimensional data streams into structured predictive signals.",
    desc: "Hands-on data manipulation and engineering across multi-million record environments. Proficient in Python (pandas, NumPy, Polars, scikit-learn), SQL, and PostgreSQL for ETL, exploratory data analysis, data transformation, and feature pipeline construction.",
    skills: ["Python", "SQL", "PostgreSQL", "EDA", "Feature Engineering", "Data Cleaning", "Polars", "pandas"]
  },
  w: {
    key: "W",
    title: "Risk Analytics & Model Evaluation",
    flavor: "Dissecting credit risk distributions, non-linear boundaries, and statistical stability.",
    desc: "Practical exploration of credit risk modeling frameworks using a 20M raw dataset. Experience with Weight of Evidence (WoE), Information Value (IV), binning transformations, variable interactions, and evaluation metrics across Logistic Regression, XGBoost, and LightGBM.",
    skills: ["Credit Risk Modeling", "WoE / IV", "Binning", "Variable Interactions", "Gini Coefficient", "AUC-ROC", "F1-Score"]
  },
  e: {
    key: "E",
    title: "Product Sense & Fintech Architecture",
    flavor: "Translating customer pain points into modular financial applications.",
    desc: "Product ideation, competitive benchmarking, and prototyping. Architected the Cardy credit-card recommendation concept with FastAPI and PostgreSQL, balancing reward mechanics, merchant ecosystems, and clean user experience.",
    skills: ["Fintech Research", "Product Benchmarking", "FastAPI Prototyping", "User Flow Design", "Database Schemas", "Card Ecosystems"]
  },
  r: {
    key: "R",
    title: "Structured Research & Sector Synthesis",
    flavor: "Mobilizing public secondary data to stress-test financial resilience.",
    desc: "Rigorous academic and market inquiry without relying on proprietary data. Led comparative analysis across 27 listed Vietnamese commercial banks and investigating bank resilience under climate shocks using secondary data.",
    skills: ["Secondary Data Analysis", "Banking Resilience", "Climate Risk Disclosure", "Sector Benchmarking", "Stress-Testing Concepts"]
  }
};

function selectAbility(slotKey) {
  const data = abilitiesData[slotKey];
  if (!data) return;

  if (window.arcaneAudio) window.arcaneAudio.playClick();

  document.querySelectorAll('.ability-slot-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.ability === slotKey);
  });

  const titleEl = document.getElementById('ability-showcase-title');
  const flavorEl = document.getElementById('ability-showcase-flavor');
  const descEl = document.getElementById('ability-showcase-desc');
  const tagsEl = document.getElementById('ability-showcase-tags');

  if (titleEl) titleEl.textContent = `[${data.key}] — ${data.title}`;
  if (flavorEl) flavorEl.textContent = `“${data.flavor}”`;
  if (descEl) descEl.textContent = data.desc;

  if (tagsEl) {
    tagsEl.innerHTML = data.skills
      .map(s => `<span class="badge-pill badge-gold">${s}</span>`)
      .join('');
  }
}

window.selectAbility = selectAbility;

// ==========================================================================
// 4. COPY EMAIL & NOTIFICATIONS
// ==========================================================================
function copyEmailToClipboard(email = 'minhthuanha.work@gmail.com') {
  if (window.arcaneAudio) window.arcaneAudio.playClick();
  navigator.clipboard.writeText(email).then(() => {
    showToast(`Summon address copied: ${email}`);
  }).catch(() => {
    window.location.href = `mailto:${email}`;
  });
}

function showToast(message) {
  let toast = document.getElementById('arcane-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'arcane-toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '30px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = 'rgba(16, 20, 34, 0.96)';
    toast.style.border = '1px solid #c8aa6e';
    toast.style.color = '#f0e6d2';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '30px';
    toast.style.fontFamily = 'var(--font-mono)';
    toast.style.fontSize = '0.82rem';
    toast.style.letterSpacing = '0.12em';
    toast.style.boxShadow = '0 0 25px rgba(200, 170, 110, 0.4)';
    toast.style.zIndex = '3000';
    toast.style.transition = 'all 0.3s ease';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.visibility = 'visible';

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.visibility = 'hidden';
  }, 3200);
}

window.copyEmailToClipboard = copyEmailToClipboard;

// ==========================================================================
// 5. BACKGROUND ARCANE CANVAS PARTICLE SYSTEM
// ==========================================================================
function initArcaneCanvas() {
  const canvas = document.getElementById('arcane-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const numParticles = 45;
  const particles = [];

  for (let i = 0; i < numParticles; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 0.8,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.6 + 0.2,
      color: Math.random() > 0.4 ? 'rgba(167, 139, 250,' : 'rgba(200, 170, 110,'
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `${p.color} ${p.opacity})`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color === 'rgba(167, 139, 250,' ? '#a78bfa' : '#c8aa6e';
      ctx.fill();
    });

    requestAnimationFrame(render);
  }

  render();
}

// ==========================================================================
// 6. INITIALIZATION & LISTENERS
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initArcaneCanvas();

  // Scroll effect on top-hud
  const hud = document.querySelector('.top-hud');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      hud?.classList.add('scrolled');
    } else {
      hud?.classList.remove('scrolled');
    }
  });

  // Sound toggle button in HUD
  const soundBtn = document.getElementById('sound-toggle-btn');
  if (soundBtn && window.arcaneAudio) {
    function updateSoundBtnUI() {
      const isMuted = window.arcaneAudio.isMuted;
      soundBtn.innerHTML = isMuted ? '🔇' : '🔊';
      soundBtn.title = isMuted ? 'Audio: Muted' : 'Audio: Active';
    }
    updateSoundBtnUI();

    soundBtn.addEventListener('click', () => {
      const muted = window.arcaneAudio.toggleMute();
      updateSoundBtnUI();
      showToast(muted ? 'Sound Muted' : 'Sound Effects Active');
    });
  }

  // Mobile drawer toggle
  const mobileToggle = document.getElementById('mobile-toggle-btn');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
    });
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
      });
    });
  }

  // Close modals on escape key or backdrop click
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.active').forEach(m => {
        m.classList.remove('active');
      });
      document.body.style.overflow = '';
    }
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  // Dispatch transmission form
  const dispatchForm = document.getElementById('summon-dispatch-form');
  if (dispatchForm) {
    dispatchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const senderName = document.getElementById('dispatch-name')?.value || 'Guest Challenger';
      const senderOrg = document.getElementById('dispatch-org')?.value || 'Organization';
      const msg = document.getElementById('dispatch-msg')?.value || '';

      const subject = encodeURIComponent(`[Rift Summon] Inquiring regarding Ha Minh Thuan from ${senderName} (${senderOrg})`);
      const body = encodeURIComponent(`Sender: ${senderName}\nOrganization: ${senderOrg}\n\nMessage:\n${msg}`);

      window.location.href = `mailto:minhthuanha.work@gmail.com?subject=${subject}&body=${body}`;
      showToast("Preparing dispatch transmission in your mail client...");
    });
  }
});
