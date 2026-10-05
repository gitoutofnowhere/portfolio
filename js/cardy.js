/**
 * CARDY — card mockup & prototype flow controller
 * 3D card tilt & goal-based recommendation demo (prototype data)
 * Slogan: "Thanh toán card đi? Để Cardy!"
 */

(function () {
  const recommendationsData = {
    cashback: {
      cardName: "VPBank Step Up",
      issuer: "Vietnam Prosperity Commercial Bank",
      rate: "15%",
      rateLabel: "Max Cashback on E-Commerce",
      desc: "Optimized for digital spenders. Maximizes cashback on online shopping, ride-hailing (Grab/Be), and digital subscriptions with capped tier bonuses.",
      merchants: ["Shopee", "Grab", "Tiki", "Lazada", "Netflix"],
      alternatives: ["Techcombank Spark (5% everyday)", "VIB Cash Back (Unlimited 0.5% base)"]
    },
    travel: {
      cardName: "BIDV Premier / JCB Miles",
      issuer: "Bank for Investment & Development of Vietnam",
      rate: "1.5x",
      rateLabel: "Miles Conversion Rate",
      desc: "Tailored for frequent flyers and international travelers. Accelerated Lotusmiles accrual, airport lounge access, and zero FX surcharge tiers.",
      merchants: ["Vietnam Airlines", "Agoda", "Booking.com", "Duty Free"],
      alternatives: ["MB Priority Visa (Lounge access)", "VPBank Travel Miles"]
    },
    dining: {
      cardName: "Techcombank Spark Dining",
      issuer: "Techcombank",
      rate: "10%",
      rateLabel: "Rebate on Food & Beverage",
      desc: "Perfect for gastronomy lovers and cafe regulars. Automatic rebates at partner restaurant chains, coffee hubs, and weekend dining promotions.",
      merchants: ["Starbucks", "Highlands Coffee", "Golden Gate Group", "Pizza 4P's"],
      alternatives: ["VIB Online Rebel (F&B tiers)", "MB Visa Platinum"]
    },
    shopping: {
      cardName: "VIB Online Rebel / Shopee Platinum",
      issuer: "Vietnam International Bank",
      rate: "10%",
      rateLabel: "Online Merchant Points",
      desc: "Engineered for high-frequency e-commerce shoppers. Instant vouchers, 0% interest flexible installments, and fee waivers on milestone spend.",
      merchants: ["Shopee", "Lazada", "Tiki", "Apple Store VN", "Uniqlo"],
      alternatives: ["VPBank Step Up", "Techcombank Spark"]
    }
  };

  function initCardySimulator() {
    const cardWrap = document.getElementById('cardy-card-element');
    const glare = document.getElementById('cardy-glare-element');
    const goalBtns = document.querySelectorAll('.goal-pill-btn');

    if (cardWrap) {
      // Gentle 3D tilt on mouse move
      cardWrap.addEventListener('mousemove', (e) => {
        const rect = cardWrap.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -9;
        const rotateY = ((x - centerX) / centerX) * 9;

        cardWrap.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

        if (glare) {
          const glareX = (x / rect.width) * 100;
          const glareY = (y / rect.height) * 100;
          glare.style.transform = `translate(${glareX - 50}%, ${glareY - 50}%) rotate(25deg)`;
        }
      });

      cardWrap.addEventListener('mouseleave', () => {
        cardWrap.style.transform = '';
      });

      // Click / Enter opens the case notes
      const openNotes = () => {
        if (typeof window.openModal === 'function') window.openModal('modal-cardy-details');
      };
      cardWrap.addEventListener('click', openNotes);
      cardWrap.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openNotes(); }
      });
    }

    goalBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        goalBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateRecommendationDisplay(btn.dataset.goal || 'cashback');
      });
    });
  }

  function updateRecommendationDisplay(goalKey) {
    const data = recommendationsData[goalKey];
    if (!data) return;

    const card = document.querySelector('.sim-results-card');
    const apply = () => {
      const nameEl = document.getElementById('sim-rec-name');
      const rateValEl = document.getElementById('sim-rec-rate-val');
      const rateLblEl = document.getElementById('sim-rec-rate-lbl');
      const descEl = document.getElementById('sim-rec-desc');
      const merchantsEl = document.getElementById('sim-rec-merchants');
      const altsEl = document.getElementById('sim-rec-alts');

      if (nameEl) nameEl.textContent = data.cardName;
      if (rateValEl) rateValEl.textContent = data.rate;
      if (rateLblEl) rateLblEl.textContent = data.rateLabel;
      if (descEl && data.desc) descEl.textContent = data.desc;

      if (merchantsEl) {
        merchantsEl.innerHTML = data.merchants
          .map(m => `<span class="merchant-tag">${m}</span>`)
          .join('');
      }
      if (altsEl) altsEl.textContent = `Ranked alternatives: ${data.alternatives.join(' · ')}`;
      if (card) card.classList.remove('updating');
    };

    if (card) {
      card.classList.add('updating');
      setTimeout(apply, 250);
    } else {
      apply();
    }
  }

  window.addEventListener('DOMContentLoaded', initCardySimulator);
})();
