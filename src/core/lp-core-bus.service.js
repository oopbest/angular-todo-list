/**
 * lpCoreBus — Custom Event Bus Service
 *
 * A lightweight pub/sub event bus for decoupled component communication.
 * 
 * API:
 *   - emit(eventName, data)       — Publish an event with optional data
 *   - on(eventName, callback)     — Subscribe to an event, returns unsubscribe fn
 *   - off(eventName, callback)    — Unsubscribe a specific callback
 *   - once(eventName, callback)   — Subscribe once, auto-unsubscribes after first call
 *   - clear()                     — Remove all listeners
 *
 * Usage:
 *   const unsub = lpCoreBus.on('TODO_ADD', (data) => { ... });
 *   lpCoreBus.emit('TODO_ADD', { text: 'new item' });
 *   unsub(); // or lpCoreBus.off('TODO_ADD', callback)
 */
export default class LpCoreBus {
    constructor() {
        this._listeners = {};
        this._history = [];
        this._maxHistory = 50;
    }

    /**
     * Subscribe to an event
     * @param {string} eventName
     * @param {Function} callback
     * @returns {Function} unsubscribe function
     */
    on(eventName, callback) {
        if (!this._listeners[eventName]) {
            this._listeners[eventName] = [];
        }
        this._listeners[eventName].push(callback);

        // Return unsubscribe function
        return () => {
            this.off(eventName, callback);
        };
    }

    /**
     * Subscribe once — auto-unsubscribes after first invocation
     * @param {string} eventName
     * @param {Function} callback
     * @returns {Function} unsubscribe function
     */
    once(eventName, callback) {
        const wrapper = (data) => {
            this.off(eventName, wrapper);
            callback(data);
        };
        return this.on(eventName, wrapper);
    }

    /**
     * Unsubscribe a specific callback from an event
     * @param {string} eventName
     * @param {Function} callback
     */
    off(eventName, callback) {
        if (!this._listeners[eventName]) return;
        this._listeners[eventName] = this._listeners[eventName].filter(
            (cb) => cb !== callback
        );
        if (this._listeners[eventName].length === 0) {
            delete this._listeners[eventName];
        }
    }

    /**
     * Emit an event to all subscribers
     * @param {string} eventName
     * @param {*} data
     */
    emit(eventName, data) {
        // Record in history
        this._history.push({
            event: eventName,
            data: data,
            timestamp: Date.now()
        });
        if (this._history.length > this._maxHistory) {
            this._history.shift();
        }

        if (!this._listeners[eventName]) return;

        // Copy array to avoid issues if callbacks modify the listeners
        const callbacks = this._listeners[eventName].slice();
        callbacks.forEach((cb) => {
            try {
                cb(data);
            } catch (err) {
                console.error(`[lpCoreBus] Error in listener for "${eventName}":`, err);
            }
        });
    }

    /**
     * Get event history (useful for debugging)
     * @returns {Array}
     */
    getHistory() {
        return this._history.slice();
    }

    /**
     * Remove all listeners
     */
    clear() {
        this._listeners = {};
    }
}
