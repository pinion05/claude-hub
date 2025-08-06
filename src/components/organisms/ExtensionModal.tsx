import React from 'react';
import { Extension } from '@/types';
import { Modal } from '@/components/molecules/Modal';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { CategoryIcon } from '@/components/atoms/CategoryIcon';

export interface ExtensionModalProps {
  extension: Extension | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ExtensionModal: React.FC<ExtensionModalProps> = ({
  extension,
  isOpen,
  onClose
}) => {
  if (!extension) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <CategoryIcon category={extension.category} className="text-3xl" />
          <h2 className="text-2xl font-bold text-accent">{extension.name}</h2>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-accent transition-colors text-2xl"
          aria-label="Close modal"
        >
          ✕
        </button>
      </div>
      
      <p className="text-gray-300 mb-6">{extension.description}</p>
      
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Badge variant="accent">
          {extension.category}
        </Badge>
        
        {extension.stars && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>⭐</span>
            <span>{extension.stars.toLocaleString()} stars</span>
          </div>
        )}
        
        {extension.downloads && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>⬇️</span>
            <span>{extension.downloads.toLocaleString()} downloads</span>
          </div>
        )}
        
        {extension.lastUpdated && (
          <div className="text-sm text-gray-400">
            Updated: {new Date(extension.lastUpdated).toLocaleDateString()}
          </div>
        )}
      </div>
      
      {extension.tags && extension.tags.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {extension.tags.map((tag) => (
              <Badge key={tag} variant="default" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      <Button
        as="a"
        href={extension.repoUrl}
        target="_blank"
        rel="noopener noreferrer"
        variant="primary"
        className="inline-flex items-center gap-2"
      >
        View Repository →
      </Button>
    </Modal>
  );
};