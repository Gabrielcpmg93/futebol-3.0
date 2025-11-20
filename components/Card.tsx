import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = "", title, action }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="px-4 py-3 md:px-6 md:py-4 border-b border-slate-100 flex justify-between items-center">
            {title && <h3 className="font-bold text-base md:text-lg text-slate-800">{title}</h3>}
            {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-4 md:p-6">
        {children}
      </div>
    </div>
  );
};