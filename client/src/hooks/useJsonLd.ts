import { useEffect } from 'react';

export function useJsonLd(data: object | null) {
    const json = data ? JSON.stringify(data).replace(/</g, '\\u003c') : null;

    useEffect(() => {
        if (!json) return;
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = json;
        document.head.appendChild(script);
        return () => {
            script.remove();
        };
    }, [json]);
}
