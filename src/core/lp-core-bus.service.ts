import { ICoreBus } from '@/types';

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
export default class LpCoreBus implements ICoreBus {
  private _listeners: { [eventName: string]: Function[] } = {};
  private _history: Array<{ event: string; data: any; timestamp: number }> = [];
  private readonly _maxHistory: number = 50;

  /**
   * Subscribe to an event
   * @param eventName
   * @param callback
   * @returns unsubscribe function
   */
  on(eventName: string, callback: (data?: any) => void): () => void {
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
   * @param eventName
   * @param callback
   * @returns unsubscribe function
   */
  once(eventName: string, callback: (data?: any) => void): () => void {
    const wrapper = (data?: any) => {
      this.off(eventName, wrapper);
      callback(data);
    };
    return this.on(eventName, wrapper);
  }

  /**
   * Unsubscribe a specific callback from an event
   * @param eventName
   * @param callback
   */
  off(eventName: string, callback?: (data?: any) => void): void {
    if (!this._listeners[eventName]) return;
    
    if (callback) {
      this._listeners[eventName] = this._listeners[eventName].filter(
        (cb) => cb !== callback
      );
      if (this._listeners[eventName].length === 0) {
        delete this._listeners[eventName];
      }
    } else {
      // Remove all listeners for this event
      delete this._listeners[eventName];
    }
  }

  /**
   * Emit an event to all subscribers
   * @param eventName
   * @param data
   */
  emit(eventName: string, data?: any): void {
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
   * @returns Array of events
   */
  getHistory(): Array<{ event: string; data: any; timestamp: number }> {
    return this._history.slice();
  }

  /**
   * Remove all listeners
   */
  clear(): void {
    this._listeners = {};
  }
}
