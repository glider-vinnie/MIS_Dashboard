import { Link } from 'react-router-dom'

/**
 * NotFound — 404 page shown for unmatched routes.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-primary-bg flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        {/* 404 number */}
        <div className="mb-6">
          <span className="text-8xl font-black bg-gradient-to-br from-accent-400 to-accent-600 bg-clip-text text-transparent select-none">
            404
          </span>
        </div>

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-accent-500/10 flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-text-primary mb-2">Page not found</h1>
        <p className="text-text-secondary text-sm mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
          <br />Check the URL or head back to the dashboard.
        </p>

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent-500 text-white font-semibold text-sm
            hover:bg-accent-600 shadow-lg shadow-accent-500/25 transition-all active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
