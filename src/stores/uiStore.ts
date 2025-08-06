import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { Extension } from '@/types';
import { UIState, UIActions } from './types';

// 초기 상태
const initialUIState: UIState = {
  isSearchSticky: false,
  searchSectionHeight: 0,
  selectedExtension: null,
  modalOpen: false,
  theme: 'dark',
  sidebarOpen: false,
};

// UI 스토어 타입
interface UIStore extends UIState, UIActions {}

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // 상태
        ...initialUIState,

        // 액션들
        setSearchSticky: (sticky: boolean) => {
          set((state) => {
            state.isSearchSticky = sticky;
          });
        },

        setSearchSectionHeight: (height: number) => {
          set((state) => {
            state.searchSectionHeight = height;
          });
        },

        setSelectedExtension: (extension: Extension | null) => {
          set((state) => {
            state.selectedExtension = extension;
            if (extension) {
              state.modalOpen = true;
            }
          });
        },

        setModalOpen: (open: boolean) => {
          set((state) => {
            state.modalOpen = open;
            if (!open) {
              state.selectedExtension = null;
            }
          });
        },

        setTheme: (theme: 'light' | 'dark' | 'system') => {
          set((state) => {
            state.theme = theme;
          });

          // 시스템 테마 적용 로직
          if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            document.documentElement.classList.toggle('dark', systemTheme === 'dark');
          } else {
            document.documentElement.classList.toggle('dark', theme === 'dark');
          }
        },

        setSidebarOpen: (open: boolean) => {
          set((state) => {
            state.sidebarOpen = open;
          });
        },

        toggleModal: () => {
          const state = get();
          set((draft) => {
            draft.modalOpen = !state.modalOpen;
            if (!draft.modalOpen) {
              draft.selectedExtension = null;
            }
          });
        },

        toggleSidebar: () => {
          const state = get();
          set((draft) => {
            draft.sidebarOpen = !state.sidebarOpen;
          });
        },
      })),
      {
        name: 'ui-store',
        partialize: (state) => ({
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    ),
    {
      name: 'ui-store',
    }
  )
);