import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/molecules/Modal';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { categoryLabels } from '@/data/categories';
import { ExtensionCategory, RepositoryEntry } from '@/types';
import { cn } from '@/utils/classNames';

export interface AddExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: RepositoryEntry) => void;
}

interface FormState {
  name: string;
  githubUrl: string;
  category: ExtensionCategory;
  tags: string;
}

const toTagArray = (value: string): string[] =>
  value
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean);

export const AddExtensionModal: React.FC<AddExtensionModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const categoryOptions = useMemo(
    () => Object.entries(categoryLabels) as [ExtensionCategory, string][],
    []
  );

  const defaultCategory = (categoryOptions[0]?.[0] ?? 'ide-integration') as ExtensionCategory;

  const getInitialState = useCallback<FormState>(
    () => ({
      name: '',
      githubUrl: '',
      category: defaultCategory,
      tags: ''
    }),
    [defaultCategory]
  );

  const [formState, setFormState] = useState<FormState>(getInitialState);

  useEffect(() => {
    if (isOpen) {
      setFormState(getInitialState());
    }
  }, [isOpen, getInitialState]);

  const parsedTags = useMemo(() => toTagArray(formState.tags), [formState.tags]);

  const previewData: RepositoryEntry = useMemo(
    () => ({
      name: formState.name.trim() || 'your-extension-name',
      github_url: formState.githubUrl.trim() || 'https://github.com/owner/repo',
      category: formState.category,
      tags: parsedTags.length > 0 ? parsedTags : ['tag-one', 'tag-two']
    }),
    [formState, parsedTags]
  );

  const previewJson = useMemo(() => JSON.stringify(previewData, null, 2), [previewData]);

  const isValid = useMemo(() => {
    const hasName = formState.name.trim().length > 0;
    const hasUrl = formState.githubUrl.trim().length > 0;
    const appearsGitHub = /^https?:\/\/(www\.)?github\.com\//i.test(formState.githubUrl.trim());
    return hasName && hasUrl && appearsGitHub;
  }, [formState.name, formState.githubUrl]);

  const handleChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) return;

    const entry: RepositoryEntry = {
      name: formState.name.trim(),
      github_url: formState.githubUrl.trim(),
      category: formState.category,
      tags: parsedTags
    };

    onSubmit(entry);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h2 className="text-2xl font-bold text-accent">Add New Extension</h2>
            <p className="text-sm text-gray-400 mt-2 max-w-lg">
              Enter the new extension information following the JSON schema (<code>name</code>, <code>github_url</code>, <code>category</code>, <code>tags</code>).
              Including a GitHub link will populate additional details automatically.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-accent transition-colors text-2xl"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-4">
            <div>
              <label htmlFor="extension-name" className="block text-sm font-semibold text-gray-400 mb-1">
                Name
              </label>
              <Input
                id="extension-name"
                value={formState.name}
                onChange={(event) => handleChange('name', event.target.value)}
                placeholder="ex. cline"
                required
              />
            </div>

            <div>
              <label htmlFor="extension-github" className="block text-sm font-semibold text-gray-400 mb-1">
                GitHub URL
              </label>
              <Input
                id="extension-github"
                type="url"
                value={formState.githubUrl}
                onChange={(event) => handleChange('githubUrl', event.target.value)}
                placeholder="https://github.com/owner/repo"
                required
              />
              <p className="text-xs text-gray-500 mt-1 font-mono">
                You must enter a GitHub repository URL.
              </p>
            </div>

            <div>
              <label htmlFor="extension-category" className="block text-sm font-semibold text-gray-400 mb-1">
                Category
              </label>
              <select
                id="extension-category"
                value={formState.category}
                onChange={(event) => handleChange('category', event.target.value as ExtensionCategory)}
                className={cn(
                  'w-full h-10 px-4 rounded-lg font-mono text-sm',
                  'bg-card border border-border focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent',
                  'transition-all duration-200 text-foreground'
                )}
              >
                {categoryOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="extension-tags" className="block text-sm font-semibold text-gray-400 mb-1">
                Tags
              </label>
              <Input
                id="extension-tags"
                value={formState.tags}
                onChange={(event) => handleChange('tags', event.target.value)}
                placeholder="comma, separated, tags"
              />
              <p className="text-xs text-gray-500 mt-1 font-mono">
                Enter a comma-separated list of tags. e.g., ide, agent, coding
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-400">Preview JSON</h3>
            <pre className="bg-gray-950 border border-border rounded-lg p-4 text-sm text-gray-300 overflow-auto max-h-64 whitespace-pre-wrap">
              {previewJson}
            </pre>
            <p className="text-xs text-gray-500 font-mono">
              Submitting will add the extension based on the pre-generated JSON.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={!isValid}>
            Save Extension
          </Button>
        </div>
      </form>
    </Modal>
  );
};
