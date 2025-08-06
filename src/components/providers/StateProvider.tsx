'use client';

import React, { useEffect } from 'react';
import { Extension } from '@/types';
import { useAppStore } from '@/stores';
import { useStateSync } from '@/hooks/useStateSync';

interface StateProviderProps {
  children: React.ReactNode;
  initialExtensions?: Extension[];
  initialSuggestions?: string[];
}

export const StateProvider: React.FC<StateProviderProps> = ({ 
  children, 
  initialExtensions = [], 
  initialSuggestions = [] 
}) => {
  const { 
    setExtensions, 
    setSuggestionsList, 
    loadExtensions, 
    loadSuggestions,
    extensions,
    suggestions,
  } = useAppStore();

  // 상태 동기화 훅 사용
  useStateSync();

  // 초기 데이터 설정
  useEffect(() => {
    if (initialExtensions.length > 0 && extensions.length === 0) {
      setExtensions(initialExtensions);
    }
    
    if (initialSuggestions.length > 0 && suggestions.length === 0) {
      setSuggestionsList(initialSuggestions);
    }
  }, [initialExtensions, initialSuggestions, extensions.length, suggestions.length, setExtensions, setSuggestionsList]);

  // 데이터가 없을 경우 로드
  useEffect(() => {
    if (extensions.length === 0 && initialExtensions.length === 0) {
      loadExtensions();
    }
    
    if (suggestions.length === 0 && initialSuggestions.length === 0) {
      loadSuggestions();
    }
  }, [extensions.length, suggestions.length, initialExtensions.length, initialSuggestions.length, loadExtensions, loadSuggestions]);

  return <>{children}</>;
};