import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { WEEKLY_EVENTS } from '../../config/weeklyEvents';

const CarWashExpiryBadge = ({ claimed }) => {
  const [hoursLeft, setHoursLeft] = useState(0);
  
  useEffect(() => {
    if (claimed) return; // Don't show countdown if already claimed
    
    const updateCountdown = () => {
      const now = Date.now();
      const expiryDate = new Date(WEEKLY_EVENTS.bonuses?.carWash?.validUntil || WEEKLY_EVENTS.meta.validUntil).getTime();
      const hours = Math.max(0, Math.ceil((expiryDate - now) / (1000 * 60 * 60)));
      setHoursLeft(hours);
    };
    
    updateCountdown();
    const timer = setInterval(updateCountdown, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [claimed]);
  
  if (claimed) {
    return <div className="text-xs text-green-400">✅ Claimed (Saving $1.4M)</div>;
  }
  
  if (hoursLeft === 0) {
    return <div className="text-xs text-red-400">❌ Expired</div>;
  }
  
  if (hoursLeft < 24) {
    return (
      <div className="text-xs text-red-400 font-semibold animate-pulse">
        ⚠️ Expires in {hoursLeft} hours!
      </div>
    );
  }
  
  if (hoursLeft < 72) {
    return <div className="text-xs text-yellow-400">🕐 Expires in {Math.ceil(hoursLeft / 24)} days</div>;
  }
  
  const expiryDate = new Date(WEEKLY_EVENTS.bonuses?.carWash?.validUntil || WEEKLY_EVENTS.meta.validUntil);
  const expiryLabel = expiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  return <div className="text-xs text-green-400">Free until {expiryLabel} (Save $1.4M)</div>;
};

CarWashExpiryBadge.propTypes = {
  claimed: PropTypes.bool,
};

export default CarWashExpiryBadge;
