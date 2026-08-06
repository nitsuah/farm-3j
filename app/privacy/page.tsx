import { SiteLayout } from '@/components/SiteLayout';

export const metadata = {
  title: 'Privacy & Security – PG Farms',
  description: 'How PG Farms handles your data and privacy.',
};

export default function PrivacyPage() {
  return (
    <SiteLayout>
      <main className="mx-auto max-w-3xl flex-1 px-6 py-12">
        <h1 className="mb-2 text-3xl font-bold text-green-900 dark:text-green-400">
          Privacy &amp; Security
        </h1>
        <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
          Last updated: July 2025
        </p>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-green-800 dark:text-green-300">
            What data we store
          </h2>
          <p className="mb-3 text-gray-700 dark:text-gray-300">
            PG Farms currently stores game save files and high scores locally in
            your browser&apos;s <code>localStorage</code>. This data never
            leaves your device unless you choose to share it.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            We are actively building an optional cloud save system backed by a
            secure database. When enabled, save data will be linked to an
            anonymous device identifier (a randomly generated UUID) — no account
            or personal information required. You can also choose to use a
            username or a Web3 wallet address to identify your saves across
            devices.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-green-800 dark:text-green-300">
            What we do NOT collect
          </h2>
          <ul className="list-disc space-y-1 pl-6 text-gray-700 dark:text-gray-300">
            <li>No names, email addresses, or contact information</li>
            <li>No payment information of any kind</li>
            <li>No location data</li>
            <li>No tracking cookies or third-party analytics</li>
            <li>No advertising identifiers</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-green-800 dark:text-green-300">
            Cookies &amp; local storage
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            We use <code>localStorage</code> solely to persist your game saves,
            high scores, and UI preferences (such as dark/light mode). We do not
            use tracking cookies or share any browser storage data with third
            parties.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-green-800 dark:text-green-300">
            Cloud saves (coming soon)
          </h2>
          <p className="mb-3 text-gray-700 dark:text-gray-300">
            Our upcoming cloud save feature will store game state in a secure,
            hosted database (Neon Postgres). Data is tied to your anonymous
            device ID by default. You may optionally link it to a username or a
            Web3 wallet address for cross-device access.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            All data in transit is encrypted via HTTPS. Database credentials are
            never exposed to the client. You may request deletion of your cloud
            save data at any time by contacting us.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xl font-semibold text-green-800 dark:text-green-300">
            Security
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            PG Farms is served over HTTPS. We follow modern web security
            practices including Content Security Policy headers, HTTP-only
            cookies where applicable, and regular dependency audits. If you
            discover a security vulnerability, please contact us at the address
            below.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-green-800 dark:text-green-300">
            Contact
          </h2>
          <p className="text-gray-700 dark:text-gray-300">
            Questions or data deletion requests:{' '}
            <a
              href="mailto:privacy@pgfarms.gg"
              className="text-green-700 underline hover:text-green-900 dark:text-green-400 dark:hover:text-green-200"
            >
              privacy@pgfarms.gg
            </a>
          </p>
        </section>
      </main>
    </SiteLayout>
  );
}
