'use client';

import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useApp } from '@/contexts/AppContext';
import { apiClient } from '@/services/api';

export default function EmailVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateUser } = useApp();

  // Form data received from ProfileSetup page
  const details = location.state?.formData;

  const newEmail = details?.email;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  if (!details) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <p className='text-white'>Invalid request</p>
      </div>
    );
  }

  const handleVerify = async () => {
    if (otp.length < 4) {
      toast.error('Please enter a valid OTP');
      return;
    }

    setLoading(true);

    try {
      // Backend verification (placeholder)
      // Your backend dev will implement this.
      // -------------------------------------------------------
      // await apiClient.post("/auth/verify-otp", {
      //   email: newEmail,
      //   otp,
      // });
      // -------------------------------------------------------

      // Simulate success for now:
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Update user with new details
      updateUser({
        name: details.fullName,
        email: details.email,
        phone: details.phone,
      });

      toast.success('Email verified & profile updated!');

      navigate('/dashboard/profile');
    } catch (err) {
      console.error(err);
      toast.error('Incorrect OTP, please try again.');
    }

    setLoading(false);
  };

  return (
    <main className='min-h-screen bg-gradient-to-br from-[#0b1f3a] to-[#090e1d] flex items-center justify-center px-4 py-8 text-white'>
      <Card className='w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 text-white shadow-2xl'>
        <CardHeader>
          <CardTitle className='text-2xl font-bold text-center'>
            Verify Your Email
          </CardTitle>
        </CardHeader>

        <CardContent>
          <p className='text-center text-white/80 mb-6'>
            An OTP has been sent to <b>{newEmail}</b>. Please enter it below to
            confirm the change.
          </p>

          <Input
            type='text'
            maxLength={6}
            placeholder='Enter OTP'
            className='bg-white/20 text-white border-white/40 placeholder:text-gray-300 text-center text-lg tracking-widest py-5'
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <Button
            className='w-full mt-6 bg-[#F6A32F] hover:bg-[#d88c25] text-white font-semibold py-3 text-lg'
            onClick={handleVerify}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </Button>

          <Button
            variant='ghost'
            className='w-full mt-3 text-white/80'
            onClick={() => navigate('/dashboard/profile-setup')}
          >
            Go Back
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
