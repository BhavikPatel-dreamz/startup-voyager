'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Popup Campaign SaaS
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Create powerful popup campaigns for your Shopify store
        </p>
        <div className="space-x-4">
          <a
            href="/login"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md text-sm font-medium"
          >
            Sign In
          </a>
          <a
            href="/register"
            className="bg-white hover:bg-gray-50 text-indigo-600 border border-indigo-600 px-6 py-3 rounded-md text-sm font-medium"
          >
            Get Started
          </a>
        </div>
      </div>
    </div>
  );
}