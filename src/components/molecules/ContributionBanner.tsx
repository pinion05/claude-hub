import React from 'react';

export const ContributionBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-accent/10 via-accent/5 to-accent/10 border-b border-accent/20">
      <div className="max-w-6xl mx-auto px-6 py-3">
        <div className="flex items-center justify-center gap-2 text-sm">
          <span className="text-gray-300">
            📁 Extension 리스트는 GitHub 파일시스템을 참조합니다.
          </span>
          <a
            href="https://github.com/pinion05/claude-hub"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent-hover transition-colors font-medium"
          >
            기여하세요! →
          </a>
        </div>
      </div>
    </div>
  );
};