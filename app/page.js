"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RegisterPage from './register/page';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return <RegisterPage />;
}
