// src/components/calculators/SocialCardGenerator.jsx


const SocialCardGenerator = ({ formData, results }) => {

  if (!results) return null;

  const generateCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630; // Standard social media card size

    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0f172a'); // slate-950
    gradient.addColorStop(1, '#1e293b'); // slate-800
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GTA Manager Assessment', canvas.width / 2, 100);

    // Tier and Score
    ctx.fillStyle = '#fbbf24'; // yellow-400
    ctx.font = 'bold 72px Arial';
    ctx.fillText(`Tier ${results.tier}`, canvas.width / 2, 200);
    
    ctx.fillStyle = '#e2e8f0'; // slate-200
    ctx.font = 'bold 36px Arial';
    ctx.fillText(`Score: ${results.score}/100`, canvas.width / 2, 260);

    // Stats
    ctx.fillStyle = '#94a3b8'; // slate-400
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
    ctx.fillStyle = '#64748b'; // slate-500
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
    <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center gap-3 text-xl font-bold hover:scale-[1.02] transition-transform shadow-lg shadow-blue-900/20">
      <button
        onClick={shareCard}
        className="flex items-center gap-2 text-white hover:text-blue-100 transition-colors"
      >
        <Share2 className="w-6 h-6" /> Share Results
      </button>
      <span className="text-white/50">|</span>
      <button
        onClick={downloadCard}
        className="flex items-center gap-2 text-white hover:text-blue-100 transition-colors"
      >
        <Download className="w-6 h-6" /> Download Card
      </button>
    </div>
  );
};

export default SocialCardGenerator;
