// Course API service for frontend integration
// Use this in your React components to interact with course endpoints

const API_BASE_URL = 'http://localhost:3000/api';

export interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number; // in paise
  originalPrice?: number; // in paise
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseData {
  title: string;
  description: string;
  price: number; // in paise
  originalPrice?: number; // in paise
}

export interface UpdateCourseData {
  title?: string;
  description?: string;
  price?: number; // in paise
  originalPrice?: number; // in paise
  isActive?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

class CourseService {
  // Get all active courses
  static async getAllCourses(): Promise<Course[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/courses`);
      const result: ApiResponse<Course[]> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return result.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  }

  // Get course by slug
  static async getCourseBySlug(slug: string): Promise<Course> {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${slug}`);
      const result: ApiResponse<Course> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return result.data;
    } catch (error) {
      console.error('Error fetching course:', error);
      throw error;
    }
  }

  // Create new course
  static async createCourse(courseData: CreateCourseData): Promise<Course> {
    try {
      const response = await fetch(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });
      
      const result: ApiResponse<Course> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return result.data;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  }

  // Update course
  static async updateCourse(slug: string, updateData: UpdateCourseData): Promise<Course> {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      const result: ApiResponse<Course> = await response.json();
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      return result.data;
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  }

  // Delete course (soft delete)
  static async deleteCourse(slug: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${slug}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  }

  // Helper function to format price from paise to rupees
  static formatPrice(priceInPaise: number): string {
    return `₹${(priceInPaise / 100).toFixed(2)}`;
  }

  // Helper function to convert rupees to paise
  static rupeesToPaise(rupees: number): number {
    return Math.round(rupees * 100);
  }
}

export default CourseService;

// Example usage in React component:
/*
import React, { useState, useEffect } from 'react';
import CourseService, { Course } from './services/CourseService';

const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const coursesData = await CourseService.getAllCourses();
        setCourses(coursesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) return <div>Loading courses...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Available Courses</h1>
      {courses.map((course) => (
        <div key={course._id} className="course-card">
          <h3>{course.title}</h3>
          <p>{course.description}</p>
          <div className="price">
            <span className="current-price">
              {CourseService.formatPrice(course.price)}
            </span>
            {course.originalPrice && (
              <span className="original-price">
                {CourseService.formatPrice(course.originalPrice)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CoursesPage;
*/