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
 * API:
 *   - transition(eventName, data)  — Attempt state transition
 *   - getState()                   — Get current state name
 *   - canTransition(eventName)     — Check if event is valid in current state
 *   - getHistory()                 — Get transition history
 *   - reset()                     — Reset to initial state
 */
export default class StateMachine {
    /**
     * @param {Object} config — State machine configuration
     */
    constructor(config) {
        this._config = config;
        this._currentState = config.initial;
        this._history = [];
        this._maxHistory = 100;

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
    getState() {
        return this._currentState;
    }

    /**
     * Check if a transition is possible for the given event
     * @param {string} eventName
     * @param {*} data
     * @returns {boolean}
     */
    canTransition(eventName, data) {
        const stateDef = this._config.states[this._currentState];
        if (!stateDef || !stateDef.on || !stateDef.on[eventName]) {
            return false;
        }

        const transitionDef = stateDef.on[eventName];
        if (transitionDef.guard && !transitionDef.guard(data)) {
            return false;
        }

        return true;
    }

    /**
     * Attempt a state transition
     * @param {string} eventName
     * @param {*} data
     * @returns {{ success: boolean, from: string, to: string, event: string }}
     */
    transition(eventName, data) {
        const fromState = this._currentState;
        const stateDef = this._config.states[fromState];

        // State not defined
        if (!stateDef || !stateDef.on || !stateDef.on[eventName]) {
            console.warn(
                `[StateMachine] No transition for event "${eventName}" in state "${fromState}"`
            );
            return { success: false, from: fromState, to: fromState, event: eventName };
        }

        const transitionDef = stateDef.on[eventName];

        // Guard check
        if (transitionDef.guard && !transitionDef.guard(data)) {
            console.warn(
                `[StateMachine] Guard rejected transition "${fromState}" → "${transitionDef.target}" on "${eventName}"`
            );
            return { success: false, from: fromState, to: fromState, event: eventName };
        }

        const toState = transitionDef.target;

        // onExit of current state
        if (stateDef.onExit) {
            stateDef.onExit();
        }

        // Execute action side-effect
        if (transitionDef.action) {
            transitionDef.action(data);
        }

        // Transition
        this._currentState = toState;

        // Record history
        const record = {
            from: fromState,
            to: toState,
            event: eventName,
            timestamp: Date.now()
        };
        this._history.push(record);
        if (this._history.length > this._maxHistory) {
            this._history.shift();
        }

        // onEnter of new state
        const newStateDef = this._config.states[toState];
        if (newStateDef && newStateDef.onEnter) {
            newStateDef.onEnter();
        }

        return { success: true, from: fromState, to: toState, event: eventName };
    }

    /**
     * Get transition history
     * @returns {Array}
     */
    getHistory() {
        return this._history.slice();
    }

    /**
     * Reset state machine to initial state
     */
    reset() {
        const oldState = this._currentState;
        const oldStateDef = this._config.states[oldState];

        if (oldStateDef && oldStateDef.onExit) {
            oldStateDef.onExit();
        }

        this._currentState = this._config.initial;
        this._history = [];

        const initialStateDef = this._config.states[this._currentState];
        if (initialStateDef && initialStateDef.onEnter) {
            initialStateDef.onEnter();
        }
    }
}
