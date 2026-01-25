'use client';

import { Header } from '@/components/shared/Header';
import { StoreForm } from '@/components/stores/StoreForm';

export default function NewStorePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header title="Create Store" showBack />

      <main className="container px-4 py-6 max-w-lg mx-auto">
        <StoreForm />
      </main>
    </div>
  );
}
