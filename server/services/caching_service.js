export class Cache {
    constructor(duration = 7 * 86400000) {
        this.cache = new Map();
        this.CACHE_DURATION = duration;
        this.createdAt = new Date();
    }

    set(key, value) {
        const expiry = Date.now() + this.CACHE_DURATION;
        this.cache.set(key, {
            value,
            expiry
        });
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    delete(key) {
        if (this.get(id))
            this.cache.delete(key);
        return;
    }

    clear() {
        this.cache.clear();
    }

    invalidate(id) {
        if (!id) return;
        this.cache.delete(id);
    }

    isExpired() {
        return Date.now() - this.createdAt > this.CACHE_DURATION;
    }
}