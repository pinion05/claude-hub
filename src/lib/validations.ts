import { z } from 'zod';
import { ExtensionCategory } from '@/types';

// 검색 폼 스키마
export const searchFormSchema = z.object({
  query: z.string()
    .min(1, '검색어를 입력해주세요')
    .max(100, '검색어는 100자 이내로 입력해주세요')
    .trim(),
});

export type SearchFormData = z.infer<typeof searchFormSchema>;

// 필터 폼 스키마
export const filterFormSchema = z.object({
  category: z.enum([
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
  ]).optional(),
  
  sortBy: z.enum(['name', 'stars', 'downloads', 'lastUpdated'])
    .default('name'),
    
  sortOrder: z.enum(['asc', 'desc'])
    .default('asc'),
    
  tags: z.array(z.string())
    .max(10, '태그는 최대 10개까지 선택 가능합니다')
    .default([]),
    
  minStars: z.number()
    .min(0, '최소 스타 수는 0 이상이어야 합니다')
    .max(10000, '최소 스타 수는 10,000 이하여야 합니다')
    .default(0),
    
  dateRange: z.object({
    start: z.date(),
    end: z.date(),
  }).optional().refine(
    (data) => !data || data.start <= data.end,
    {
      message: '시작 날짜는 종료 날짜보다 이전이어야 합니다',
    }
  ),
});

export type FilterFormData = z.infer<typeof filterFormSchema>;

// 확장 등록 폼 스키마 (미래 확장)
export const extensionSubmissionSchema = z.object({
  name: z.string()
    .min(2, '이름은 최소 2자 이상이어야 합니다')
    .max(50, '이름은 50자 이내여야 합니다')
    .trim(),
    
  description: z.string()
    .min(10, '설명은 최소 10자 이상이어야 합니다')
    .max(500, '설명은 500자 이내여야 합니다')
    .trim(),
    
  category: z.enum([
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
  ]),
  
  repoUrl: z.string()
    .url('올바른 URL을 입력해주세요')
    .refine(
      (url) => url.includes('github.com') || url.includes('gitlab.com'),
      { message: 'GitHub 또는 GitLab 저장소 URL만 허용됩니다' }
    ),
    
  tags: z.array(z.string())
    .max(5, '태그는 최대 5개까지 추가할 수 있습니다')
    .default([]),
    
  author: z.string()
    .min(2, '작성자 이름은 최소 2자 이상이어야 합니다')
    .max(30, '작성자 이름은 30자 이내여야 합니다')
    .trim()
    .optional(),
    
  version: z.string()
    .regex(/^\d+\.\d+\.\d+$/, '버전은 x.y.z 형식이어야 합니다')
    .optional(),
});

export type ExtensionSubmissionData = z.infer<typeof extensionSubmissionSchema>;

// 피드백 폼 스키마
export const feedbackFormSchema = z.object({
  type: z.enum(['bug', 'feature', 'improvement', 'other'])
    .default('other'),
    
  title: z.string()
    .min(5, '제목은 최소 5자 이상이어야 합니다')
    .max(100, '제목은 100자 이내여야 합니다')
    .trim(),
    
  description: z.string()
    .min(10, '내용은 최소 10자 이상이어야 합니다')
    .max(1000, '내용은 1000자 이내여야 합니다')
    .trim(),
    
  email: z.string()
    .email('올바른 이메일 주소를 입력해주세요')
    .optional(),
    
  priority: z.enum(['low', 'medium', 'high'])
    .default('medium'),
});

export type FeedbackFormData = z.infer<typeof feedbackFormSchema>;

// 평점 폼 스키마
export const ratingFormSchema = z.object({
  extensionId: z.number()
    .positive('유효한 확장 ID가 필요합니다'),
    
  rating: z.number()
    .min(1, '평점은 최소 1점이어야 합니다')
    .max(5, '평점은 최대 5점이어야 합니다')
    .int('평점은 정수여야 합니다'),
    
  review: z.string()
    .max(500, '리뷰는 500자 이내여야 합니다')
    .trim()
    .optional(),
    
  anonymous: z.boolean()
    .default(false),
});

export type RatingFormData = z.infer<typeof ratingFormSchema>;

// 폼 기본값들
export const defaultValues = {
  search: {
    query: '',
  },
  
  filter: {
    category: undefined,
    sortBy: 'name' as const,
    sortOrder: 'asc' as const,
    tags: [],
    minStars: 0,
    dateRange: undefined,
  },
  
  extensionSubmission: {
    name: '',
    description: '',
    category: 'Development' as ExtensionCategory,
    repoUrl: '',
    tags: [],
    author: '',
    version: '',
  },
  
  feedback: {
    type: 'other' as const,
    title: '',
    description: '',
    email: '',
    priority: 'medium' as const,
  },
  
  rating: {
    extensionId: 0,
    rating: 5,
    review: '',
    anonymous: false,
  },
} as const;