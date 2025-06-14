
'use client';

import dynamic from 'next/dynamic';

// Define the loading component separately
function AppLoadingFallback() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      Loading Ashground...
    </div>
  );
}

const AshgroundApp = dynamic(() => import('@/app/ashground-app'), {
  ssr: false,
  loading: AppLoadingFallback, // Use the defined component
});

export default function Page() {
  return <AshgroundApp />;
}
