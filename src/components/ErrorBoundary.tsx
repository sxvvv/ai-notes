import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

const serializeError = (error: any) => {
  if (error instanceof Error) {
    return error.message + '\n' + error.stack;
  }
  return JSON.stringify(error, null, 2);
};

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: any }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen bg-bg-base flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-bg-surface rounded-xl border border-error/20 p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-error/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-error" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-text-primary">出现错误</h2>
                <p className="text-sm text-text-muted">应用遇到了一个意外错误</p>
              </div>
            </div>
            
            <div className="bg-bg-base rounded-lg p-4 mb-6 border border-border-subtle">
              <pre className="text-xs text-text-muted font-mono overflow-auto max-h-64">
                {serializeError(this.state.error)}
              </pre>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-accent-primary hover:bg-accent-hover text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                刷新页面
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center gap-2 px-4 py-2 bg-bg-elevated hover:bg-bg-overlay text-text-primary rounded-lg transition-colors border border-border-subtle"
              >
                <Home className="w-4 h-4" />
                返回首页
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}