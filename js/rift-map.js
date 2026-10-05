/**
 * RIFT BATTLEGROUND MAP CONTROLLER
 * Connects map nodes with dynamic glowing arcane Ley-lines
 * Handles tactical inspection and smooth teleportation to target realms.
 */

(function () {
  const nodes = [
    { id: 'node-origin', name: 'The Origin', subtitle: 'FTU / Foundations', target: '#champion-profile', x: 18, y: 35, icon: '🏛️' },
    { id: 'node-banking', name: 'The Banking Realm', subtitle: 'VPBank & MB Bank Operations', target: '#missions', x: 38, y: 22, icon: '🏦' },
    { id: 'node-data', name: 'The Data Abyss', subtitle: '20M Credit Risk Models', target: '#artifact-creditrisk', x: 62, y: 25, icon: '📊' },
    { id: 'node-forge', name: 'The Forge', subtitle: 'Cardy & Banking Analysis', target: '#artifact-cardy', x: 48, y: 55, icon: '💳' },
    { id: 'node-market', name: 'The Marketplace', subtitle: 'Fintech BD & Research', target: '#mission-u2u', x: 26, y: 72, icon: '🌐' },
    { id: 'node-climate', name: 'The Climate Frontier', subtitle: 'Climate Risk & Bank Shocks', target: '#artifact-climate', x: 80, y: 45, icon: '🌪️' },
    { id: 'node-guild', name: 'The Guild', subtitle: 'TEC FTU Team & 50+ Partners', target: '#mission-tec', x: 74, y: 76, icon: '🛡️' },
    { id: 'node-next', name: 'The Next Rift', subtitle: 'Future Career Intersection', target: '#next-arc', x: 50, y: 88, icon: '✨' },
  ];

  const connections = [
    ['node-origin', 'node-banking'],
    ['node-banking', 'node-data'],
    ['node-banking', 'node-market'],
    ['node-data', 'node-forge'],
    ['node-market', 'node-forge'],
    ['node-data', 'node-climate'],
    ['node-market', 'node-guild'],
    ['node-forge', 'node-next'],
    ['node-climate', 'node-next'],
    ['node-guild', 'node-next']
  ];

  function initMap() {
    const mapWrap = document.getElementById('rift-map-svg-wrap');
    const canvas = document.getElementById('rift-canvas-lines');
    if (!mapWrap || !canvas) return;

    // Render nodes
    mapWrap.innerHTML = '';
    mapWrap.appendChild(canvas);

    nodes.forEach(node => {
      const nodeEl = document.createElement('a');
      nodeEl.className = 'map-node';
      nodeEl.id = node.id;
      nodeEl.href = node.target;
      nodeEl.style.left = `${node.x}%`;
      nodeEl.style.top = `${node.y}%`;

      nodeEl.innerHTML = `
        <div class="node-crystal">
          <span>${node.icon}</span>
        </div>
        <div class="node-label">
          <span>${node.name}</span>
        </div>
      `;

      nodeEl.addEventListener('mouseenter', () => {
        if (window.arcaneAudio) window.arcaneAudio.playHover();
      });

      nodeEl.addEventListener('click', (e) => {
        if (window.arcaneAudio) window.arcaneAudio.playClick();
        const targetEl = document.querySelector(node.target);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          targetEl.classList.add('hex-highlight-pulse');
          setTimeout(() => targetEl.classList.remove('hex-highlight-pulse'), 1500);
        }
      });

      mapWrap.appendChild(nodeEl);
    });

    // Draw canvas lines
    drawLeyLines(canvas, mapWrap);
    window.addEventListener('resize', () => drawLeyLines(canvas, mapWrap));
  }

  function drawLeyLines(canvas, container) {
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    connections.forEach(([sourceId, targetId]) => {
      const srcNode = nodes.find(n => n.id === sourceId);
      const tgtNode = nodes.find(n => n.id === targetId);
      if (!srcNode || !tgtNode) return;

      const x1 = (srcNode.x / 100) * canvas.width;
      const y1 = (srcNode.y / 100) * canvas.height;
      const x2 = (tgtNode.x / 100) * canvas.width;
      const y2 = (tgtNode.y / 100) * canvas.height;

      // Draw Ley-line path
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(168, 139, 250, 0.28)';
      ctx.setLineDash([4, 4]);
      ctx.stroke();

      // Subtle gold glow
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(200, 170, 110, 0.4)';
      ctx.setLineDash([]);
      ctx.stroke();
    });
  }

  window.addEventListener('DOMContentLoaded', initMap);
})();
