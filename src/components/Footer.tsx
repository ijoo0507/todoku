import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-900 py-6 px-4">
      <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-500">
        <span>届く · Todoku · free</span>
        <span className="text-slate-700">·</span>
        <Link href="/about" className="hover:text-slate-300 transition-colors">about</Link>
        <Link href="/privacy" className="hover:text-slate-300 transition-colors">privacy</Link>
        <Link href="/terms" className="hover:text-slate-300 transition-colors">terms</Link>
      </div>
    </footer>
  );
}
