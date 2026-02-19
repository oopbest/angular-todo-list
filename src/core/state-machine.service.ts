import { IStateConfig } from '@/types';

/**
 * StateMachine — Generic State Machine Factory
 *
 * Creates a state machine from a configuration object.
 *
 * Config format:
 *   {
 *     initial: 'IDLE',
 *     states: {
 *       IDLE: {
 *         on: {
 *           TODO_ADD: {
 *             target: 'ADDING',
 *             guard: (data) => boolean,    // optional
 *             action: (data) => void       // optional side-effect
 *           }
 *         },
 *         onEnter: () => void,   // optional
 *         onExit: () => void     // optional
 *       },
 *       ...
 *     }
 *   }
 *
 * Public API:
 *   - getCurrentState()           — Get current state name
 *   - can(event, data)            — Check if transition is allowed
 *   - transition(event, data)     — Execute transition
 *   - getHistory()                — Get state change history
 *   - reset()                     — Reset to initial state
 */
export default class StateMachine {
  private _config: IStateConfig;
  private _currentState: string;
  private _history: string[] = [];
  private readonly _maxHistory: number = 100;

  /**
   * @param {Object} config — State machine configuration
   */
  constructor(config: IStateConfig) {
    this._config = config;
    this._currentState = config.initial;

    // Run onEnter for initial state
    const initialStateDef = this._config.states[this._currentState];
    if (initialStateDef && initialStateDef.onEnter) {
      initialStateDef.onEnter();
    }
  }

  /**
   * Get current state name
   * @returns {string}
   */
  getCurrentState(): string {
    return this._currentState;
  }

  /**
   * Check if transition is allowed
   * @param {string} event — Event name
   * @param {*} data — Optional data for guard function
   * @returns {boolean}
   */
  can(event: string, data?: any): boolean {
    const currentStateDef = this._config.states[this._currentState];
    if (!currentStateDef || !currentStateDef.on) {
      return false;
    }

    const transition = currentStateDef.on[event];
    if (!transition) {
      return false;
    }

    // Check guard if present
    if (transition.guard && !transition.guard(data)) {
      return false;
    }

    return true;
  }

  /**
   * Execute state transition
   * @param {string} event — Event name
   * @param {*} data — Optional data for guard/action functions
   * @returns {boolean} — true if transition succeeded
   */
  transition(event: string, data?: any): boolean {
    if (!this.can(event, data)) {
      return false;
    }

    const currentStateDef = this._config.states[this._currentState];
    const transition = currentStateDef!.on![event]!;
    const targetState = transition.target;

    // Run onExit for current state
    if (currentStateDef.onExit) {
      currentStateDef.onExit();
    }

    // Run action if present
    if (transition.action) {
      transition.action(data);
    }

    // Update state
    this._currentState = targetState;

    // Add to history
    this._history.push(targetState);
    if (this._history.length > this._maxHistory) {
      this._history.shift();
    }

    // Run onEnter for new state
    const targetStateDef = this._config.states[targetState];
    if (targetStateDef && targetStateDef.onEnter) {
      targetStateDef.onEnter();
    }

    return true;
  }

  /**
   * Get state change history
   * @returns {Array<string>}
   */
  getHistory(): string[] {
    return [...this._history];
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    // Run onExit for current state
    const currentStateDef = this._config.states[this._currentState];
    if (currentStateDef && currentStateDef.onExit) {
      currentStateDef.onExit();
    }

    // Reset state and history
    this._currentState = this._config.initial;
    this._history = [];

    // Run onEnter for initial state
    const initialStateDef = this._config.states[this._currentState];
    if (initialStateDef && initialStateDef.onEnter) {
      initialStateDef.onEnter();
    }
  }
}
