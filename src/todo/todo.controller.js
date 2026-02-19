import { TODO_EVENTS } from './todo-states.constant';

/**
 * TodoController — Thin Controller
 *
 * Dispatches user actions via lpCoreBus and reads state from TodoStore.
 * Listens for STATE_CHANGED to keep the view in sync.
 */
export default class TodoController {
    /* @ngInject */
    constructor(lpCoreBus, TodoStore, $scope) {
        this._bus = lpCoreBus;
        this._store = TodoStore;
        this.todoText = '';

        // Sync view with store
        this._syncFromStore();

        // Listen for state changes
        this._unsub = this._bus.on(TODO_EVENTS.STATE_CHANGED, () => {
            this._syncFromStore();
        });

        // Cleanup on scope destroy
        $scope.$on('$destroy', () => {
            if (this._unsub) this._unsub();
        });
    }

    // ── View Data Sync ──

    _syncFromStore() {
        this.todos = this._store.getTodos();
        this.errorMessage = this._store.getErrorMessage();
        this.machineState = this._store.getState();
    }

    // ── User Actions ──

    addTodo() {
        this._bus.emit(TODO_EVENTS.TODO_ADD, { text: this.todoText });
        if (!this._store.getErrorMessage()) {
            this.todoText = '';
        }
    }

    remove(item) {
        this._bus.emit(TODO_EVENTS.TODO_REMOVE, { id: item.id });
    }

    toggle(item) {
        this._bus.emit(TODO_EVENTS.TODO_TOGGLE, { id: item.id });
    }

    archive() {
        this._bus.emit(TODO_EVENTS.TODO_ARCHIVE);
    }

    remaining() {
        return this._store.remaining();
    }

    clearError() {
        if (this.errorMessage) {
            this._bus.emit(TODO_EVENTS.RESET);
            this.errorMessage = '';
        }
    }

    // ── Debug ──

    debugHistory() {
        console.log('[TodoController] History:', this._store.getHistory());
    }
}

TodoController.$inject = ['lpCoreBus', 'TodoStore', '$scope'];
