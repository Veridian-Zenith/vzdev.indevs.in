//! License: Open Software License 3.0 (OSL-3.0)
//! Copyright (c) 2026 Dae Euhwa

import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { withTranslation } from 'react-i18next';
import type { WithTranslation } from 'react-i18next';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
} & WithTranslation;

type State = {
  hasError: boolean;
};

class ErrorBoundaryComponent extends Component<Props, State> {
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
    const { t } = this.props;
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="fixed inset-0 z-[300] bg-black flex flex-col items-center justify-center font-mono text-amber-100/50 p-4 text-center">
          <h1 className="text-xl sm:text-2xl font-black mb-4 text-amber-300 tracking-tight">{t('error.title')}</h1>
          <p className="mb-6 text-sm opacity-60">{t('error.message')}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-full border border-amber-400/40 text-amber-300 hover:bg-amber-500 hover:text-black transition-colors font-bold uppercase tracking-widest text-xs"
          >
            {t('error.button')}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export const ErrorBoundary = withTranslation()(ErrorBoundaryComponent);

