// src/pages/CourseDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Lock, BookOpen } from 'lucide-react';
import { useEffect } from 'react';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { courses } = useApp();

  const course = courses.find(
    (c) => c.id === id || c.id === 'option-analysis-strategy'
  );

  if (!course) {
    return (
      <div className='flex min-h-[60vh] items-center justify-center'>
        <div className='text-center'>
          <h2 className='mb-2 text-2xl font-bold'>Course not found</h2>
          <Button onClick={() => navigate('/dashboard/my-courses')}>
            Back to My Courses
          </Button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // basic anti-inspect restrictions (same as before)
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.userSelect = 'none';
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.userSelect = 'auto';
    };
  }, []);

  return (
    <div className='space-y-4'>
      <Button variant='ghost' onClick={() => navigate('/dashboard/my-courses')}>
        <ArrowLeft className='mr-2 h-4 w-4' />
        Back to My Courses
      </Button>

      <div className='space-y-4'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-start justify-between mb-4'>
              <div>
                <h1 className='text-2xl font-bold mb-2'>{course.title}</h1>
                <p className='text-muted-foreground'>By {course.instructor}</p>
              </div>
              <Badge variant='secondary'>{course.category}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6 relative'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-xl font-bold flex items-center gap-2'>
                <BookOpen className='h-5 w-5 text-primary' /> Course E-Book
              </h2>
              <Badge variant='destructive' className='flex items-center gap-1'>
                <Lock className='h-3 w-3' /> Locked
              </Badge>
            </div>

            <div className='flex flex-col items-center justify-center h-72 text-center bg-muted/40 rounded-lg border'>
              <Lock className='h-12 w-12 text-muted-foreground mb-4' />
              <p className='text-muted-foreground text-sm max-w-sm'>
                This e-book is available only to paid users. Please complete
                your payment to unlock access.
              </p>
              <Button
                className='mt-4 bg-[#F7A530] hover:bg-[#e8991e] text-white'
                onClick={() => navigate(`/dashboard/course/${course.id}`)}
              >
                Start / Unlock
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CourseDetail;
