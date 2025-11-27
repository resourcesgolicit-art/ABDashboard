import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/services/api';

const Profile = () => {
  const { user, updateUser } = useApp();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load saved picture from localStorage
  useEffect(() => {
    const savedPic = localStorage.getItem('user_profile_pic');
    if (savedPic) {
      setPreviewImage(savedPic);
      updateUser({ avatar: savedPic });
    }
  }, []);

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;

      // Update preview
      setPreviewImage(base64);

      // Save to localStorage
      localStorage.setItem('user_profile_pic', base64);

      // Update user in context
      updateUser({ avatar: base64 });

      toast.success('Profile picture updated successfully!');

      // Optional backend upload
      uploadToBackend(file);
    };

    reader.readAsDataURL(file);
  };

  // Optional backend upload
  const uploadToBackend = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      // Backend dev will update this endpoint
      await apiClient.post('/user/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (error) {
      console.warn(
        'Backend avatar upload failed (safe to ignore for now)',
        error
      );
    }
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>Profile Settings</h1>
        <p className='text-muted-foreground'>Manage your account information</p>
      </div>

      <div className='grid gap-6 lg:grid-cols-3'>
        {/* Profile Card */}
        <Card className='lg:col-span-1'>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col items-center space-y-4'>
            <Avatar className='h-32 w-32'>
              <AvatarImage src={previewImage || user.avatar} alt={user.name} />
              <AvatarFallback className='text-2xl'>
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            {/* Hidden File Input */}
            <input
              type='file'
              id='profilePicUpload'
              accept='image/*'
              className='hidden'
              onChange={handleImageUpload}
            />

            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                document.getElementById('profilePicUpload')?.click()
              }
            >
              Change Picture
            </Button>
          </CardContent>
        </Card>

        {/* Personal Information (Read-Only) */}
        <Card className='lg:col-span-2'>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle>Personal Information</CardTitle>

            {/* Edit button redirects to profile-setup page */}
            <Button
              variant='outline'
              size='sm'
              onClick={() => navigate('/dashboard/profile-setup')}
            >
              Edit
            </Button>
          </CardHeader>

          <CardContent className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <p className='text-sm text-muted-foreground'>Full Name</p>
                <p className='text-lg font-semibold'>{user.name}</p>
              </div>
              <div className='space-y-2'>
                <p className='text-sm text-muted-foreground'>Email</p>
                <p className='text-lg font-semibold'>{user.email}</p>
              </div>
            </div>

            <div className='space-y-2'>
              <p className='text-sm text-muted-foreground'>Phone Number</p>
              <p className='text-lg font-semibold'>{user.phone}</p>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card className='lg:col-span-3'>
          <CardHeader>
            <CardTitle>Learning Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid gap-6 md:grid-cols-3'>
              <div className='space-y-2'>
                <p className='text-sm text-muted-foreground'>
                  Enrolled Courses
                </p>
                <p className='text-3xl font-bold'>{user.enrolledCourses}</p>
              </div>
              <div className='space-y-2'>
                <p className='text-sm text-muted-foreground'>Active Courses</p>
                <p className='text-3xl font-bold'>{user.activeCourses}</p>
              </div>
              <div className='space-y-2'>
                <p className='text-sm text-muted-foreground'>
                  Certificates Earned
                </p>
                <p className='text-3xl font-bold'>{user.certificatesEarned}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className='lg:col-span-3'>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between border-b border-border pb-4'>
              <div>
                <h4 className='font-medium'>Change Password</h4>
                <p className='text-sm text-muted-foreground'>
                  Update your password to keep your account secure
                </p>
              </div>
              <Button variant='outline'>Change Password</Button>
            </div>
            <div className='flex items-center justify-between'>
              <div>
                <h4 className='font-medium text-destructive'>Delete Account</h4>
                <p className='text-sm text-muted-foreground'>
                  Permanently delete your account and all data
                </p>
              </div>
              <Button variant='destructive'>Delete Account</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
