export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastItem {
    id: number;
    variant: ToastVariant;
    message: string;
    duration: number;
}

type Listener = (toasts: ToastItem[]) => void;

interface ToastTimer {
    handle: ReturnType<typeof setTimeout>;
    expiresAt: number;
    remaining: number;
}

const listeners = new Set<Listener>();
const timers = new Map<number, ToastTimer>();
let toasts: ToastItem[] = [];
let nextId = 1;

const notify = () => {
    for (const listener of listeners) listener(toasts);
};

const schedule = (id: number, ms: number) => {
    timers.set(id, {
        handle: setTimeout(() => dismissToast(id), ms),
        expiresAt: Date.now() + ms,
        remaining: 0,
    });
};

const push = (variant: ToastVariant, message: string, duration: number) => {
    const id = nextId++;
    toasts = [...toasts, { id, variant, message, duration }];
    notify();
    if (duration > 0) {
        schedule(id, duration);
    }
    return id;
};

export const toast = {
    success: (message: string, duration = 3500) => push('success', message, duration),
    error: (message: string, duration = 4500) => push('error', message, duration),
    info: (message: string, duration = 3500) => push('info', message, duration),
};

export const dismissToast = (id: number) => {
    const timer = timers.get(id);
    if (timer) {
        clearTimeout(timer.handle);
        timers.delete(id);
    }
    toasts = toasts.filter((t) => t.id !== id);
    notify();
};

export const pauseToast = (id: number) => {
    const timer = timers.get(id);
    if (!timer) return;
    clearTimeout(timer.handle);
    timer.remaining = Math.max(0, timer.expiresAt - Date.now());
};

export const resumeToast = (id: number) => {
    const timer = timers.get(id);
    if (!timer || timer.remaining <= 0) return;
    schedule(id, timer.remaining);
};

export const subscribeToasts = (listener: Listener) => {
    listeners.add(listener);
    listener(toasts);
    return () => {
        listeners.delete(listener);
    };
};
