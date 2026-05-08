export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastItem {
    id: number;
    variant: ToastVariant;
    message: string;
    duration: number;
}

type Listener = (toasts: ToastItem[]) => void;

const listeners = new Set<Listener>();
let toasts: ToastItem[] = [];
let nextId = 1;

const notify = () => {
    for (const listener of listeners) listener(toasts);
};

const push = (variant: ToastVariant, message: string, duration: number) => {
    const id = nextId++;
    toasts = [...toasts, { id, variant, message, duration }];
    notify();
    if (duration > 0) {
        setTimeout(() => dismissToast(id), duration);
    }
    return id;
};

export const toast = {
    success: (message: string, duration = 3500) => push('success', message, duration),
    error: (message: string, duration = 4500) => push('error', message, duration),
    info: (message: string, duration = 3500) => push('info', message, duration),
};

export const dismissToast = (id: number) => {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
};

export const subscribeToasts = (listener: Listener) => {
    listeners.add(listener);
    listener(toasts);
    return () => {
        listeners.delete(listener);
    };
};
