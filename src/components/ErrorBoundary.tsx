//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="fixed inset-0 z-[300] bg-primary-themeable flex flex-col items-center justify-center font-mono text-secondary-themeable p-4 text-center">
          <h1 className="text-2xl font-bold mb-4 text-primary-themeable">SYSTEM CRITICAL ERROR</h1>
          <p className="mb-6 opacity-70">An unexpected error occurred in the digital realm.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 border border-primary-themeable text-primary-themeable hover:bg-primary-themeable hover:text-primary-themeable transition-colors font-bold uppercase tracking-widest"
          >
            Reboot System
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
