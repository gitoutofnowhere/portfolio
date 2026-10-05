/**
 * COMPANION CONTROLLER: ASTRA (THE ARCANE GUIDE)
 * Original companion character guiding visitors through the Rift.
 * Reacts dynamically to user scroll, navigation, and inspection actions.
 */

(function () {
  const dialogues = {
    hero: [
      "Greetings, Traveler! You stand at the gates of Minh Thuận's realm.",
      "Seeking a quick recruiter briefing? Tap 'Quick Resume' at the top anytime!",
      "An International Finance mind forging paths through Data, Risk, and Product."
    ],
    profile: [
      "Here lies the Champion Sheet: Foreign Trade University, class of 2027.",
      "Notice the balance: no exaggerated scores, just four rigorous core paths.",
      "Fluent in English (IELTS 8.0), native Vietnamese, elementary Chinese."
    ],
    lore: [
      "The chronicle traces a real trajectory: from wholesale banking to massive credit risk data.",
      "Every chapter represents an actual milestone in financial operations and analytics.",
      "Hover over any node to witness how the journey unfolded."
    ],
    map: [
      "The Rift Realm Map! Click any realm node to navigate directly to that domain.",
      "Explore The Banking Bastion, The Data Abyss, or The Product Forge."
    ],
    missions: [
      "Battles fought in real financial institutions: VPBank Wholesale Operations & MB Bank.",
      "Wholesale banking operations, trade finance documentation, and retail customer service.",
      "Zero fabricated claims: real operational controls and risk awareness."
    ],
    artifacts: [
      "Artifacts forged! Take a look at Cardy, our credit-card recommendation platform.",
      "“Thanh toán card đi? Để Cardy!” Test out the interactive card simulator!",
      "Inspect the 20M-record credit risk stability project and 27-bank comparative study."
    ],
    ability: [
      "The Champion's ability kit: Passive Financial Thinking, Q Data, W Risk, E Product, R Research.",
      "Click through the Q, W, E, R slots to inspect tools and applications."
    ],
    loadout: [
      "The current loadout: Python, SQL/PostgreSQL, Excel, Power BI, and FastAPI.",
      "Every tool corresponds to actual project and operational experience."
    ],
    achievements: [
      "Top 16 at Deloitte Tax Challenge 2027 and DataCamp Credit Risk Modeling.",
      "Milestones earned through competition and continuous study."
    ],
    nextarc: [
      "The journey continues! Exploring roles at the intersection of Finance, Risk, Data, and Product.",
      "Ready to initiate contact? Send a transmission or connect on LinkedIn!"
    ]
  };

  let currentSection = 'hero';
  let bubbleTimeout = null;

  function initCompanion() {
    const bubble = document.getElementById('companion-bubble');
    const bubbleText = document.getElementById('companion-dialogue');
    const avatarBtn = document.getElementById('companion-avatar-btn');

    if (!bubble || !bubbleText || !avatarBtn) return;

    // Show initial welcome after short delay
    setTimeout(() => {
      setDialogue(getRandomDialogue('hero'));
      showBubble();
    }, 1200);

    // Click on avatar cycles witty dialogue
    avatarBtn.addEventListener('click', () => {
      if (window.arcaneAudio) window.arcaneAudio.playClick();
      setDialogue(getRandomDialogue(currentSection));
      showBubble();
    });

    // Observer to detect which section is currently on screen
    setupScrollObserver();
  }

  function getRandomDialogue(section) {
    const list = dialogues[section] || dialogues.hero;
    return list[Math.floor(Math.random() * list.length)];
  }

  function setDialogue(text) {
    const bubbleText = document.getElementById('companion-dialogue');
    if (bubbleText) {
      bubbleText.textContent = text;
    }
  }

  function showBubble(duration = 7000) {
    const bubble = document.getElementById('companion-bubble');
    if (!bubble) return;

    bubble.classList.add('visible');

    if (bubbleTimeout) clearTimeout(bubbleTimeout);
    if (duration > 0) {
      bubbleTimeout = setTimeout(() => {
        bubble.classList.remove('visible');
      }, duration);
    }
  }

  function setupScrollObserver() {
    const sections = [
      { id: 'hero', key: 'hero' },
      { id: 'champion-profile', key: 'profile' },
      { id: 'lore', key: 'lore' },
      { id: 'rift-map', key: 'map' },
      { id: 'missions', key: 'missions' },
      { id: 'artifacts', key: 'artifacts' },
      { id: 'ability-kit', key: 'ability' },
      { id: 'loadout', key: 'loadout' },
      { id: 'achievements', key: 'achievements' },
      { id: 'next-arc', key: 'nextarc' },
      { id: 'summon', key: 'nextarc' }
    ];

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const match = sections.find(s => s.id === entry.target.id);
          if (match && match.key !== currentSection) {
            currentSection = match.key;
            setDialogue(getRandomDialogue(currentSection));
            showBubble(6000);
          }
        }
      });
    }, { threshold: 0.35 });

    sections.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
  }

  window.addEventListener('DOMContentLoaded', initCompanion);
})();
