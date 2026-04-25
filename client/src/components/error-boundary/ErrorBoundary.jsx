import { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
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
                        An unexpected error knocked the page off the rails. The team has been notified — give it another shot from the home page.
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
