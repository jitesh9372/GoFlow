import React from 'react';
import { Link } from 'react-router-dom';
import { Train, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white border border-transit-border rounded-card p-8 shadow-card text-center max-w-md w-full space-y-4">
        <div className="w-12 h-12 rounded-transit bg-teal-50 text-transit-teal mx-auto flex items-center justify-center">
          <Train size={24} />
        </div>
        <div>
          <span className="font-mono text-xs font-semibold text-rose-600 uppercase">
            Platform 404 • Destination Not Found
          </span>
          <h1 className="text-xl font-bold text-transit-navy mt-1">
            This Transit Route Does Not Exist
          </h1>
          <p className="text-xs text-transit-muted mt-1 leading-relaxed">
            The page or station schedule you are looking for has been redirected or does not exist on the Mumbai suburban network map.
          </p>
        </div>

        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-transit-teal hover:bg-transit-teal-hover text-white text-xs font-semibold rounded-transit transition-colors shadow-xs"
          >
            <ArrowLeft size={14} />
            <span>Return to Network Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
