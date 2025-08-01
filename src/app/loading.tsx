import { Skeleton } from '@/components/atoms/Skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pt-32 pb-16">
        <div className="text-center mb-8">
          <Skeleton variant="rectangular" width="300px" height="60px" className="mx-auto mb-4" />
          <Skeleton variant="text" width="250px" height="24px" className="mx-auto" />
        </div>
        
        <div className="max-w-2xl mx-auto px-6">
          <Skeleton variant="rectangular" height="56px" className="rounded-lg" />
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <div className="mb-8">
          <Skeleton variant="text" width="200px" height="36px" className="mb-2" />
          <Skeleton variant="text" width="300px" height="20px" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, index) => (
            <div key={index} className="bg-card border border-border rounded-lg p-6">
              <Skeleton variant="text" height="24px" width="70%" className="mb-2" />
              <Skeleton variant="text" height="16px" className="mb-1" />
              <Skeleton variant="text" height="16px" width="90%" className="mb-4" />
              <Skeleton variant="rectangular" height="24px" width="80px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}