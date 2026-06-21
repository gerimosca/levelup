import { notFound } from 'next/navigation';

// Catch-all route to trigger the locale-specific not-found page
export default function CatchAllPage() {
  notFound();
}
