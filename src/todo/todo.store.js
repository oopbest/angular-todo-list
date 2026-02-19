import { TODO_STATES, TODO_EVENTS } from './todo-states.constant';

/**
 * TodoStore — Centralized State Store
 *
 * Manages all todo data. Listens for action events on lpCoreBus,
 * transitions the StateMachine, mutates data, and emits STATE_CHANGED.
 *
 * Components should:
 *   - Read state from TodoStore (getTodos, getState, etc.)
 *   - Dispatch actions via lpCoreBus.emit(TODO_EVENTS.TODO_ADD, data)
 *   - Listen for STATE_CHANGED to update their views
 */
export default class TodoStore {
    /* @ngInject */
    constructor(lpCoreBus, StateMachine, $rootScope) {
        this._bus = lpCoreBus;
        this._$rootScope = $rootScope;

        // ── Initial data ──
        this._todos = [
            { id: this._generateId(), text: 'learn angular', done: true },
            { id: this._generateId(), text: 'build an angular app', done: false }
        ];
        this._errorMessage = '';

        // ── State Machine ──
        this._machine = new StateMachine(this._buildMachineConfig());

        // ── Subscribe to bus events ──
        this._bus.on(TODO_EVENTS.TODO_ADD, (data) => this._handleAdd(data));
        this._bus.on(TODO_EVENTS.TODO_REMOVE, (data) => this._handleRemove(data));
        this._bus.on(TODO_EVENTS.TODO_TOGGLE, (data) => this._handleToggle(data));
        this._bus.on(TODO_EVENTS.TODO_ARCHIVE, () => this._handleArchive());
    }

    // ═══════════════════════════════
    // Public API (read-only)
    // ═══════════════════════════════

    getTodos() {
        return this._todos;
    }

    getState() {
        return this._machine.getState();
    }

    getErrorMessage() {
        return this._errorMessage;
    }

    remaining() {
        return this._todos.filter((t) => !t.done).length;
    }

    completedCount() {
        return this._todos.filter((t) => t.done).length;
    }

    getHistory() {
        return {
            bus: this._bus.getHistory(),
            machine: this._machine.getHistory()
        };
    }

    // ═══════════════════════════════
    // Private — Event Handlers
    // ═══════════════════════════════

    _handleAdd(data) {
        var text = data && data.text ? data.text.trim() : '';

        if (!text) {
            // Transition to ERROR
            this._machine.transition(TODO_EVENTS.ADD_FAIL);
            this._errorMessage = 'Please enter a todo item.';
            this._notifyChanged();
            return;
        }

        // Transition IDLE → ADDING
        var result = this._machine.transition(TODO_EVENTS.TODO_ADD, data);
        if (!result.success) return;

        // Mutate data
        this._todos.push({
            id: this._generateId(),
            text: text,
            done: false
        });
        this._errorMessage = '';

        // Transition ADDING → IDLE
        this._machine.transition(TODO_EVENTS.ADD_SUCCESS);
        this._notifyChanged();
    }

    _handleRemove(data) {
        var result = this._machine.transition(TODO_EVENTS.TODO_REMOVE, data);
        if (!result.success) return;

        var index = this._todos.findIndex((t) => t.id === data.id);
        if (index > -1) {
            this._todos.splice(index, 1);
        }

        this._machine.transition(TODO_EVENTS.REMOVE_SUCCESS);
        this._notifyChanged();
    }

    _handleToggle(data) {
        var result = this._machine.transition(TODO_EVENTS.TODO_TOGGLE, data);
        if (!result.success) return;

        var todo = this._todos.find((t) => t.id === data.id);
        if (todo) {
            todo.done = !todo.done;
        }

        this._machine.transition(TODO_EVENTS.TOGGLE_SUCCESS);
        this._notifyChanged();
    }

    _handleArchive() {
        var result = this._machine.transition(TODO_EVENTS.TODO_ARCHIVE);
        if (!result.success) return;

        this._todos = this._todos.filter((t) => !t.done);

        this._machine.transition(TODO_EVENTS.ARCHIVE_DONE);
        this._notifyChanged();
    }

    // ═══════════════════════════════
    // Private — State Machine Config
    // ═══════════════════════════════

    _buildMachineConfig() {
        return {
            initial: TODO_STATES.IDLE,
            states: {
                [TODO_STATES.IDLE]: {
                    on: {
                        [TODO_EVENTS.TODO_ADD]: {
                            target: TODO_STATES.ADDING
                        },
                        [TODO_EVENTS.TODO_REMOVE]: {
                            target: TODO_STATES.REMOVING
                        },
                        [TODO_EVENTS.TODO_TOGGLE]: {
                            target: TODO_STATES.TOGGLING
                        },
                        [TODO_EVENTS.TODO_ARCHIVE]: {
                            target: TODO_STATES.ARCHIVING,
                            guard: () => this.completedCount() > 0
                        },
                        [TODO_EVENTS.ADD_FAIL]: {
                            target: TODO_STATES.ERROR
                        }
                    }
                },
                [TODO_STATES.ADDING]: {
                    on: {
                        [TODO_EVENTS.ADD_SUCCESS]: {
                            target: TODO_STATES.IDLE
                        },
                        [TODO_EVENTS.ADD_FAIL]: {
                            target: TODO_STATES.ERROR
                        }
                    }
                },
                [TODO_STATES.REMOVING]: {
                    on: {
                        [TODO_EVENTS.REMOVE_SUCCESS]: {
                            target: TODO_STATES.IDLE
                        }
                    }
                },
                [TODO_STATES.TOGGLING]: {
                    on: {
                        [TODO_EVENTS.TOGGLE_SUCCESS]: {
                            target: TODO_STATES.IDLE
                        }
                    }
                },
                [TODO_STATES.ARCHIVING]: {
                    on: {
                        [TODO_EVENTS.ARCHIVE_DONE]: {
                            target: TODO_STATES.IDLE
                        }
                    }
                },
                [TODO_STATES.ERROR]: {
                    on: {
                        [TODO_EVENTS.RESET]: {
                            target: TODO_STATES.IDLE
                        },
                        [TODO_EVENTS.TODO_ADD]: {
                            target: TODO_STATES.ADDING
                        },
                        [TODO_EVENTS.ADD_FAIL]: {
                            target: TODO_STATES.ERROR
                        }
                    }
                }
            }
        };
    }

    // ═══════════════════════════════
    // Private — Utilities
    // ═══════════════════════════════

    _notifyChanged() {
        this._bus.emit(TODO_EVENTS.STATE_CHANGED, {
            todos: this._todos,
            machineState: this._machine.getState(),
            errorMessage: this._errorMessage
        });
        // Trigger Angular digest cycle
        this._$rootScope.$applyAsync();
    }

    _generateId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }
}

TodoStore.$inject = ['lpCoreBus', 'StateMachine', '$rootScope'];
