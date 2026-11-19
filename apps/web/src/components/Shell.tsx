import { ChevronLeftIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ConnectionBanner } from './ConnectionBanner.js';
import { QuickNoteButton } from './QuickNoteButton.js';

export interface ShellProps {
  title: string;
  /** Where the back chevron goes; none on Home. */
  back?: string;
  actions?: ReactNode;
  /** Show the floating Quick note button; on by default. */
  quickNote?: boolean;
  children: ReactNode;
}

/** The page frame: sticky header, the connection banner and a column that is phone-wide on
 *  a phone and grows to a reading width on a laptop. */
export function Shell({ title, back, actions, quickNote = true, children }: ShellProps) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col md:max-w-3xl">
      <header className="bg-background/95 sticky top-0 z-40 flex items-center gap-2 border-b px-3 py-2 backdrop-blur">
        {back !== undefined ? (
          <Link to={back} aria-label="Back" className="rounded-md p-1 hover:bg-accent">
            <ChevronLeftIcon className="size-6" />
          </Link>
        ) : null}
        <h1 className="flex-1 truncate text-lg font-semibold">{title}</h1>
        {actions}
      </header>
      <ConnectionBanner />
      <main className="flex flex-1 flex-col gap-4 p-4 pb-24">{children}</main>
      {quickNote && <QuickNoteButton />}
    </div>
  );
}
