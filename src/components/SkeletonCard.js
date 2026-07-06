import React from 'react';

export const SkeletonCard = () => (
  <div className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10">
    <div className="relative h-48 bg-white/5 overflow-hidden">
      <div className="shimmer-overlay" />
    </div>
    <div className="p-4 space-y-3">
      <div className="relative h-4 bg-white/10 rounded-lg w-3/4 overflow-hidden">
        <div className="shimmer-overlay" />
      </div>
      <div className="relative h-4 bg-white/10 rounded-lg w-1/2 overflow-hidden">
        <div className="shimmer-overlay" />
      </div>
      <div className="relative h-10 bg-white/10 rounded-xl w-full overflow-hidden">
        <div className="shimmer-overlay" />
      </div>
    </div>
  </div>
);

export const SkeletonLine = ({ className = '' }) => (
  <div className={`relative bg-white/10 rounded-lg overflow-hidden ${className}`}>
    <div className="shimmer-overlay" />
  </div>
);

export default SkeletonCard;
