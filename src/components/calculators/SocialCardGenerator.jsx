// src/components/calculators/SocialCardGenerator.jsx
import { Share2, Download } from 'lucide-react';

import React from 'react';
import PropTypes from 'prop-types';

const SocialCardGenerator = ({ formData, results }) => {

  if (!results) return null;

  const generateCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630; // Standard social media card size

    const ctx = canvas.getContext('2d');

    // Background gradient (Arcade HUD: deep navy -> slate blue)
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#050b14');
    gradient.addColorStop(1, '#0a192f');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#E6EEF7';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GTA Empire Report Card', canvas.width / 2, 100);

    // Tier and Score
    ctx.fillStyle = '#29d2e3'; // HUD Blue
    ctx.font = 'bold 72px Arial';
    ctx.fillText(`Tier ${results.tier}`, canvas.width / 2, 200);

    ctx.fillStyle = '#A7BAD0';
    ctx.font = 'bold 36px Arial';
    ctx.fillText(`Score: ${results.score}/100`, canvas.width / 2, 260);

    // Stats
    ctx.fillStyle = '#8399B4';
    ctx.font = '24px Arial';
    ctx.textAlign = 'left';

    const stats = [
      `Income: $${(results.incomePerHour / 1000).toFixed(0)}k/hr`,
      `Rank: ${formData.rank || 'N/A'}`,
      `Heist Ready: ${results.heistReadyPercent.toFixed(0)}%`,
    ];

    let yPos = 350;
    stats.forEach((stat, index) => {
      ctx.fillText(stat, 100, yPos + index * 50);
    });

    // Footer
    ctx.fillStyle = '#8399B4';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('gta-manager.com', canvas.width / 2, canvas.height - 40);

    return canvas;
  };

  const downloadCard = () => {
    const canvas = generateCard();
    const link = document.createElement('a');
    link.download = `gta-assessment-tier-${results.tier}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const shareCard = async () => {
    try {
      const canvas = generateCard();
      canvas.toBlob(async (blob) => {
        if (navigator.share && navigator.canShare) {
          const file = new File([blob], 'gta-assessment.png', { type: 'image/png' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `GTA Manager - Tier ${results.tier} (${results.score}/100)`,
              text: `I scored ${results.score}/100 on the GTA Manager assessment! Tier ${results.tier} with $${(results.incomePerHour / 1000).toFixed(0)}k/hr income.`,
              files: [file],
            });
            return;
          }
        }
        // Fallback: download
        downloadCard();
      });
    } catch (error) {
      console.error('Share failed:', error);
      downloadCard();
    }
  };

  return (
    <div className="p-6 bg-hud-blue text-text-on-accent rounded-xl flex items-center justify-center gap-3 text-xl font-bold hover:brightness-110 transition-all shadow-glow-blue">
      <button
        type="button"
        onClick={shareCard}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <Share2 className="w-6 h-6" /> Share Results
      </button>
      <span className="opacity-50">|</span>
      <button
        type="button"
        onClick={downloadCard}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <Download className="w-6 h-6" /> Download Card
      </button>
    </div>
  );
};

SocialCardGenerator.propTypes = {
  formData: PropTypes.shape({
    rank: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  results: PropTypes.shape({
    tier: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    score: PropTypes.number.isRequired,
    incomePerHour: PropTypes.number.isRequired,
    heistReadyPercent: PropTypes.number.isRequired,
  }),
};

export default SocialCardGenerator;
