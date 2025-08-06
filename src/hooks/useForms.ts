import React from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  searchFormSchema,
  SearchFormData,
  filterFormSchema,
  FilterFormData,
  extensionSubmissionSchema,
  ExtensionSubmissionData,
  feedbackFormSchema,
  FeedbackFormData,
  ratingFormSchema,
  RatingFormData,
  defaultValues,
} from '@/lib/validations';

// 검색 폼 훅
export const useSearchForm = (
  onSubmit: (data: SearchFormData) => void,
  initialValues?: Partial<SearchFormData>
) => {
  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      ...defaultValues.search,
      ...initialValues,
    },
    mode: 'onChange', // 실시간 유효성 검증
  });

  const submitHandler = form.handleSubmit((data) => {
    onSubmit(data);
  });

  return {
    ...form,
    handleSubmit: submitHandler,
  };
};

// 필터 폼 훅
export const useFilterForm = (
  onSubmit: (data: FilterFormData) => void,
  initialValues?: Partial<FilterFormData>
) => {
  const form = useForm<FilterFormData>({
    resolver: zodResolver(filterFormSchema) as any,
    defaultValues: {
      ...defaultValues.filter,
      ...initialValues,
    } as any,
    mode: 'onChange',
  });

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
  });

  const reset = () => {
    form.reset(defaultValues.filter as any);
  };

  return {
    ...form,
    handleSubmit,
    reset,
  };
};

// 확장 등록 폼 훅
export const useExtensionSubmissionForm = (
  onSubmit: (data: ExtensionSubmissionData) => void,
  initialValues?: Partial<ExtensionSubmissionData>
) => {
  const form = useForm<ExtensionSubmissionData>({
    resolver: zodResolver(extensionSubmissionSchema),
    defaultValues: {
      ...defaultValues.extensionSubmission,
      ...initialValues,
    },
    mode: 'onBlur', // blur 시 유효성 검증
  });

  const handleSubmit = form.handleSubmit(
    (data) => {
      onSubmit(data);
    },
    (errors) => {
      console.error('Form validation errors:', errors);
    }
  );

  return {
    ...form,
    handleSubmit,
  };
};

// 피드백 폼 훅
export const useFeedbackForm = (
  onSubmit: (data: FeedbackFormData) => void,
  initialValues?: Partial<FeedbackFormData>
) => {  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      ...defaultValues.feedback,
      ...initialValues,
    },
    mode: 'onBlur',
  });

  const submitHandler = form.handleSubmit((data) => {
    onSubmit(data);
  });

  return {
    ...form,
    handleSubmit: submitHandler,
  };
};

// 평점 폼 훅
export const useRatingForm = (
  onSubmit: (data: RatingFormData) => void,
  initialValues?: Partial<RatingFormData>
) => {  const form = useForm<RatingFormData>({
    resolver: zodResolver(ratingFormSchema),
    defaultValues: {
      ...defaultValues.rating,
      ...initialValues,
    },
    mode: 'onChange',
  });

  const submitHandler = form.handleSubmit((data) => {
    onSubmit(data);
  });

  return {
    ...form,
    handleSubmit: submitHandler,
  };
};

// 폼 상태 유틸리티 훅
export const useFormUtils = () => {
  // 폼 에러 메시지 포매터
  const formatErrorMessage = (error: any): string => {
    if (typeof error?.message === 'string') {
      return error.message;
    }
    return '유효하지 않은 입력입니다.';
  };

  // 폼 필드 상태 확인
  const getFieldState = (form: UseFormReturn<any>, fieldName: string) => {
    const fieldState = form.getFieldState(fieldName);
    const hasError = !!fieldState.error;
    const isDirty = fieldState.isDirty;
    const isTouched = fieldState.isTouched;

    return {
      hasError,
      isDirty,
      isTouched,
      errorMessage: hasError ? formatErrorMessage(fieldState.error) : '',
      className: hasError ? 'border-red-500' : isDirty ? 'border-green-500' : '',
    };
  };

  // 폼 제출 상태 관리
  const useSubmitState = () => {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [submitError, setSubmitError] = React.useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = React.useState(false);

    const handleSubmit = async (submitFn: () => Promise<void> | void) => {
      try {
        setIsSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(false);
        
        await Promise.resolve(submitFn());
        
        setSubmitSuccess(true);
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : '제출 중 오류가 발생했습니다.');
      } finally {
        setIsSubmitting(false);
      }
    };

    const reset = () => {
      setIsSubmitting(false);
      setSubmitError(null);
      setSubmitSuccess(false);
    };

    return {
      isSubmitting,
      submitError,
      submitSuccess,
      handleSubmit,
      reset,
    };
  };

  return {
    formatErrorMessage,
    getFieldState,
    useSubmitState,
  };
};