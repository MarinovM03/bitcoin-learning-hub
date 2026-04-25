import { BrowserRouter } from 'react-router';
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/error-boundary/ErrorBoundary.jsx';

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </BrowserRouter>
)
