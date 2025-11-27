// src/pages/ExploreCourses.tsx
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, BookOpen, Users, Star, Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const ExploreCourses = () => {
  const { courses, enrollCourse } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const availableCourses = courses.filter(
    (c) =>
      !c.isEnrolled &&
      (c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.instructor.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleEnroll = (courseId: string, courseName: string) => {
    enrollCourse(courseId);
    toast.success('Course enrolled successfully!', {
      description: `You are now enrolled in "${courseName}"`,
    });
    navigate(`/dashboard/course/${courseId}`);
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-4'>
        <div>
          <h1 className='text-3xl font-bold'>Explore Courses</h1>
          <p className='text-muted-foreground'>
            Discover and enroll in amazing courses to boost your skills
          </p>
        </div>

        <div className='relative max-w-md'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            type='search'
            placeholder='Search courses...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-9'
          />
        </div>
      </div>

      {availableCourses.length === 0 ? (
        <Card>
          <CardContent className='flex flex-col items-center justify-center py-12'>
            <BookOpen className='mb-4 h-16 w-16 text-muted-foreground' />
            <h3 className='mb-2 text-xl font-semibold'>No courses found</h3>
            <p className='text-muted-foreground'>
              {searchQuery
                ? 'Try searching with different keywords'
                : 'All available courses have been enrolled'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {availableCourses.map((course) => (
            <Card
              key={course.id}
              className='group overflow-hidden transition-all hover:shadow-lg'
            >
              <div className='relative aspect-video w-full overflow-hidden bg-muted'>
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className='h-full w-full object-cover transition-transform group-hover:scale-105'
                />
                <div className='absolute right-2 top-2'>
                  <Badge className='bg-primary shadow-lg'>
                    {course.category}
                  </Badge>
                </div>
              </div>

              <CardHeader>
                <CardTitle className='line-clamp-2'>{course.title}</CardTitle>
                <p className='text-sm text-muted-foreground'>
                  {course.instructor}
                </p>
              </CardHeader>

              <CardContent className='space-y-4'>
                <p className='line-clamp-2 text-sm text-muted-foreground'>
                  {course.description}
                </p>

                <div className='flex items-center gap-1'>
                  <Star className='h-4 w-4 fill-accent text-accent' />
                  <span className='font-medium'>{course.rating}</span>
                </div>

                <div className='flex items-center justify-between pt-2'>
                  <span className='text-2xl font-bold text-primary'>
                    ₹{course.price}
                  </span>
                  <Button
                    className='bg-gradient-accent hover:opacity-90'
                    onClick={() => handleEnroll(course.id, course.title)}
                  >
                    Enroll Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExploreCourses;
