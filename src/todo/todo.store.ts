import { TODO_STATES, TODO_EVENTS } from './todo-states.constant';
import { ITodo, ICoreBus } from '@/types';
import StateMachine from '@/core/state-machine.service';

/**
 * TodoStore — Centralized State Store
 *
 * Manages all todo data. Listens for action events on lpCoreBus,
 * transitions StateMachine, mutates data, and emits STATE_CHANGED.
 *
 * Components should:
 *   - Read state from TodoStore (getTodos, getState, etc.)
 *   - Dispatch actions via lpCoreBus.emit(TODO_EVENTS.TODO_ADD, data)
 *   - Listen for STATE_CHANGED to update their views
 */
export default class TodoStore {
  private _bus: ICoreBus;
  private _$rootScope: angular.IRootScopeService;
  private _machine: StateMachine;
  private _todos: ITodo[] = [];
  private _errorMessage: string = '';

  /* @ngInject */
  constructor(lpCoreBus: ICoreBus, StateMachineService: any, $rootScope: angular.IRootScopeService) {
    this._bus = lpCoreBus;
    this._$rootScope = $rootScope;

    // ── Initial data ──
    this._todos = [
      { id: this._generateId(), text: 'learn angular', done: true, createdAt: new Date() },
      { id: this._generateId(), text: 'build an angular app', done: false, createdAt: new Date() }
    ];
    this._errorMessage = '';

    // ── State Machine ──
    this._machine = new StateMachineService(this._buildMachineConfig());

    // ── Subscribe to bus events ──
    this._bus.on(TODO_EVENTS.TODO_ADD, (data) => this._handleAdd(data));
    this._bus.on(TODO_EVENTS.TODO_REMOVE, (data) => this._handleRemove(data));
    this._bus.on(TODO_EVENTS.TODO_TOGGLE, (data) => this._handleToggle(data));
    this._bus.on(TODO_EVENTS.TODO_ARCHIVE, () => this._handleArchive());
  }

  // ═════════════════════════════
  // Public API (read-only)
  // ═════════════════════════════

  get todos(): ITodo[] {
    return this._todos;
  }

  get completionPercent(): number {
    if (this._todos.length === 0) return 0;
    return Math.round(((this._todos.length - this.remaining()) / this._todos.length) * 100);
  }

  getState(): string {
    return this._machine.getCurrentState();
  }

  getErrorMessage(): string {
    return this._errorMessage;
  }

  remaining(): number {
    return this._todos.filter((t) => !t.done).length;
  }

  completedCount(): number {
    return this._todos.filter((t) => t.done).length;
  }

  getHistory(): { bus: any; machine: string[] } {
    return {
      bus: (this._bus as any).getHistory(),
      machine: this._machine.getHistory()
    };
  }

  // ═════════════════════════════
  // Public Actions
  // ═════════════════════════════

  add(text: string): void {
    this._bus.emit(TODO_EVENTS.TODO_ADD, { text });
  }

  toggle(id: string): void {
    this._bus.emit(TODO_EVENTS.TODO_TOGGLE, { id });
  }

  remove(id: string): void {
    this._bus.emit(TODO_EVENTS.TODO_REMOVE, { id });
  }

  archive(): void {
    this._bus.emit(TODO_EVENTS.TODO_ARCHIVE);
  }

  // ═════════════════════════════
  // Private — Event Handlers
  // ═════════════════════════════

  private _handleAdd(data: { text?: string }): void {
    const text = data && data.text ? data.text.trim() : '';

    if (!text) {
      // Transition to ERROR
      this._machine.transition(TODO_EVENTS.ADD_FAIL);
      this._errorMessage = 'Please enter a todo item.';
      this._notifyChanged();
      return;
    }

    // Transition IDLE → ADDING
    const result = this._machine.transition(TODO_EVENTS.TODO_ADD, data);
    if (!result) return;

    // Mutate data
    this._todos.push({
      id: this._generateId(),
      text: text,
      done: false,
      createdAt: new Date()
    });
    this._errorMessage = '';

    // Transition ADDING → IDLE
    this._machine.transition(TODO_EVENTS.ADD_SUCCESS);
    this._notifyChanged();
  }

  private _handleRemove(data: { id: string }): void {
    const result = this._machine.transition(TODO_EVENTS.TODO_REMOVE, data);
    if (!result) return;

    const index = this._todos.findIndex((t) => t.id === data.id);
    if (index > -1) {
      this._todos.splice(index, 1);
    }

    this._machine.transition(TODO_EVENTS.REMOVE_SUCCESS);
    this._notifyChanged();
  }

  private _handleToggle(data: { id: string }): void {
    const result = this._machine.transition(TODO_EVENTS.TODO_TOGGLE, data);
    if (!result) return;

    const todo = this._todos.find((t) => t.id === data.id);
    if (todo) {
      todo.done = !todo.done;
    }

    this._machine.transition(TODO_EVENTS.TOGGLE_SUCCESS);
    this._notifyChanged();
  }

  private _handleArchive(): void {
    const result = this._machine.transition(TODO_EVENTS.TODO_ARCHIVE);
    if (!result) return;

    this._todos = this._todos.filter((t) => !t.done);

    this._machine.transition(TODO_EVENTS.ARCHIVE_DONE);
    this._notifyChanged();
  }

  // ═════════════════════════════
  // Private — State Machine Config
  // ═════════════════════════════

  private _buildMachineConfig() {
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

  // ═════════════════════════════
  // Private — Utilities
  // ═════════════════════════════

  private _notifyChanged(): void {
    this._bus.emit(TODO_EVENTS.STATE_CHANGED, {
      todos: this._todos,
      machineState: this._machine.getCurrentState(),
      errorMessage: this._errorMessage
    });
    // Trigger Angular digest cycle
    this._$rootScope.$applyAsync();
  }

  private _generateId(): string {
    return '_' + Math.random().toString(36).substr(2, 9);
  }
}

// Static injection annotation
(TodoStore as any).$inject = ['lpCoreBus', 'StateMachine', '$rootScope'];
