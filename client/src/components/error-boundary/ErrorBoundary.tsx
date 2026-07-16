import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('[ErrorBoundary]', error, info);
    }

    handleReload = () => {
        window.location.assign('/');
    };

    render() {
        if (!this.state.hasError) {
            return this.props.children;
        }

        return (
            <div className="error-boundary">
                <div className="error-boundary__card">
                    <div className="error-boundary__badge">!</div>
                    <h1 className="error-boundary__title">Something broke.</h1>
                    <p className="error-boundary__message">
                        An unexpected error knocked the page off the rails. Head back to
                        the home page and give it another shot.
                    </p>
                    <button
                        type="button"
                        className="error-boundary__button"
                        onClick={this.handleReload}
                    >
                        Back to home
                    </button>
                </div>
            </div>
        );
    }
}

export default ErrorBoundary;
