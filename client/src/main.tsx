import { BrowserRouter } from 'react-router';
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import ErrorBoundary from './components/error-boundary/ErrorBoundary';
import { queryClient } from './lib/queryClient';

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <App />
            </QueryClientProvider>
        </ErrorBoundary>
    </BrowserRouter>
)
