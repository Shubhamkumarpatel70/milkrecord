import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-4 px-6 border-t border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md transition-colors duration-200 mt-auto no-print">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
        
        {/* Left: Product Name */}
        <div className="flex items-center gap-2 font-medium">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span>© {currentYear} <strong className="text-slate-800 dark:text-slate-200 font-bold">Milk Record</strong>. All rights reserved.</span>
        </div>

        {/* Right: Technology Partner Link */}
        <div className="flex items-center gap-1.5">
          <span>Powered by</span>
          <a
            href="https://askctechnologies.in"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 py-0.5"
            title="Visit ASKC TECHNOLOGIES"
          >
            <span>ASKC TECHNOLOGIES</span>
            <svg
              className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full"></span>
          </a>
        </div>
      </div>
    </footer>
  );
}
