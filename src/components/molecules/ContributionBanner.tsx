import React from 'react';

export const ContributionBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-accent/10 via-accent/5 to-accent/10 border-b border-accent/20">
      <div className="max-w-6xl mx-auto px-6 py-3">
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="text-gray-300">
            📁 Extension list is sourced from the GitHub file system.
          </span>
          <a
            href="https://github.com/pinion05/claude-hub"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent-hover transition-colors font-medium"
          >
            Contribute now! →
          </a>
        </div>
      </div>
    </div>
  );
};