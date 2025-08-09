// app/page.js
export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import PageClient from '../components/PageClient';

export default function Page() {
  // Suspense boundary is here, in a Server Component
  return (
    <Suspense fallback={null}>
      <PageClient />
    </Suspense>
  );
}
