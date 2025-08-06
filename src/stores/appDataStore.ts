import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Extension, ExtensionCategory } from '@/types';
import { AppDataState, AppDataActions } from './types';

// 초기 상태
const initialAppDataState: AppDataState = {
  extensions: [],
  suggestions: [],
  categories: [
    'Development',
    'API', 
    'Browser',
    'Productivity',
    'Terminal',
    'Data',
    'Mobile',
    'DevOps',
    'CMS',
    'E-commerce',
    'Education'
  ],
  isLoading: false,
  error: null,
};

// 앱 데이터 스토어 타입
interface AppDataStore extends AppDataState, AppDataActions {}

export const useAppDataStore = create<AppDataStore>()(
  devtools(
    immer((set, _get) => ({
      // 상태
      ...initialAppDataState,

      // 액션들
      setExtensions: (extensions: Extension[]) => {
        set((state) => {
          state.extensions = extensions;
        });
      },

      setSuggestionsList: (suggestions: string[]) => {
        set((state) => {
          state.suggestions = suggestions;
        });
      },

      setCategories: (categories: ExtensionCategory[]) => {
        set((state) => {
          state.categories = categories;
        });
      },

      setIsLoading: (loading: boolean) => {
        set((state) => {
          state.isLoading = loading;
        });
      },

      setError: (error: string | null) => {
        set((state) => {
          state.error = error;
        });
      },

      loadExtensions: async () => {
        try {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          // API 호출 대신 정적 데이터 로드
          const { extensions } = await import('@/data/extensions');
          
          set((state) => {
            state.extensions = extensions;
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Extensions 로드 실패';
            state.isLoading = false;
          });
        }
      },

      loadSuggestions: async () => {
        try {
          set((state) => {
            state.isLoading = true;
            state.error = null;
          });

          // API 호출 대신 정적 데이터 로드
          const { suggestions } = await import('@/data/suggestions');
          
          set((state) => {
            state.suggestions = suggestions;
            state.isLoading = false;
          });
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Suggestions 로드 실패';
            state.isLoading = false;
          });
        }
      },
    })),
    {
      name: 'app-data-store',
    }
  )
);