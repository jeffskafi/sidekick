import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Header() {
  const router = useRouter();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <nav className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            Sidekick
          </Link>
          <div className="space-x-4">
            <Link href="/dashboard" className={`${router.pathname === '/dashboard' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'} hover:text-blue-600 dark:hover:text-blue-400`}>
              Dashboard
            </Link>
            <Link href="/settings" className={`${router.pathname === '/settings' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'} hover:text-blue-600 dark:hover:text-blue-400`}>
              Settings
            </Link>
            <Link href="/design-system" className={`${router.pathname === '/design-system' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'} hover:text-blue-600 dark:hover:text-blue-400`}>
              Design System
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}