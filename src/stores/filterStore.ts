import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { ExtensionCategory } from '@/types';
import { FilterState, FilterActions } from './types';

// 초기 상태
const initialFilterState: FilterState = {
  category: undefined,
  sortBy: 'name',
  sortOrder: 'asc',
  tags: [],
  minStars: 0,
  dateRange: undefined,
};

// 필터 스토어 타입
interface FilterStore extends FilterState, FilterActions {}

export const useFilterStore = create<FilterStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // 상태
        ...initialFilterState,

        // 액션들
        setCategory: (category?: ExtensionCategory) => {
          set((state) => {
            state.category = category;
          });
        },

        setSortBy: (sortBy: 'name' | 'stars' | 'downloads' | 'lastUpdated') => {
          set((state) => {
            state.sortBy = sortBy;
          });
        },

        setSortOrder: (order: 'asc' | 'desc') => {
          set((state) => {
            state.sortOrder = order;
          });
        },

        setTags: (tags: string[]) => {
          set((state) => {
            state.tags = tags;
          });
        },

        setMinStars: (stars: number) => {
          set((state) => {
            state.minStars = Math.max(0, stars);
          });
        },

        setDateRange: (range?: { start: Date; end: Date }) => {
          set((state) => {
            state.dateRange = range;
          });
        },

        addTag: (tag: string) => {
          const state = get();
          if (!state.tags.includes(tag)) {
            set((draft) => {
              draft.tags.push(tag);
            });
          }
        },

        removeTag: (tag: string) => {
          set((state) => {
            state.tags = state.tags.filter(t => t !== tag);
          });
        },

        resetFilters: () => {
          set((state) => {
            Object.assign(state, initialFilterState);
          });
        },
      })),
      {
        name: 'filter-store',
        partialize: (state) => ({
          category: state.category,
          sortBy: state.sortBy,
          sortOrder: state.sortOrder,
          tags: state.tags,
          minStars: state.minStars,
        }),
      }
    ),
    {
      name: 'filter-store',
    }
  )
);