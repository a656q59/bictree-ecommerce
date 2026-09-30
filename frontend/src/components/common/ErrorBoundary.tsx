import { Component, type ErrorInfo, type ReactNode } from "react";

import { reportError } from "../../errors/logger.ts";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    reportError("react", error);
    if (import.meta.env.DEV) {
      console.error(info.componentStack);
    }
  }

  private handleReload = (): void => {
    window.location.assign("/");
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
        <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-8 text-center">
          <h1 className="text-xl font-semibold text-ink">Something went wrong</h1>
          <p className="mt-2 text-sm text-muted">
            This screen could not be shown. Reload MegaMart and try again.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="mt-6 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Reload MegaMart
          </button>
        </div>
      </div>
    );
  }
}
