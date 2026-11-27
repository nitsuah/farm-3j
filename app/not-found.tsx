import Link from 'next/link';
import { SiteLayout } from '@/components/SiteLayout';

export default function NotFound() {
  return (
    <SiteLayout>
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-12 text-center text-green-900 dark:text-white">
        <h1 className="text-3xl font-bold">404 - Page not found</h1>
        <p>That page does not exist on this farm.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-lg border-2 border-green-700 px-5 py-2 font-medium underline">
            Home
          </Link>
          <Link href="/rtsfarm" className="rounded-lg bg-yellow-700 px-5 py-2 font-medium text-white">
            Play the RTS
          </Link>
        </div>
      </main>
    </SiteLayout>
  );
}
