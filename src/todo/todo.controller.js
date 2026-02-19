import { TODO_EVENTS } from './todo-states.constant';

/**
 * TodoController — Thin Controller
 *
 * Dispatches user actions via lpCoreBus and reads state from TodoStore.
 * Uses $uibModal for confirm delete dialog.
 */
export default class TodoController {
    /* @ngInject */
    constructor(lpCoreBus, TodoStore, $scope, $uibModal) {
        this._bus = lpCoreBus;
        this._store = TodoStore;
        this._$uibModal = $uibModal;
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
        this.completionPercent = this.todos.length > 0
            ? Math.round(((this.todos.length - this._store.remaining()) / this.todos.length) * 100)
            : 0;
    }

    // ── User Actions ──

    addTodo() {
        this._bus.emit(TODO_EVENTS.TODO_ADD, { text: this.todoText });
        if (!this._store.getErrorMessage()) {
            this.todoText = '';
        }
    }

    confirmRemove(item) {
        var modalInstance = this._$uibModal.open({
            animation: true,
            template: `
                <div class="confirm-modal">
                    <div class="modal-header">
                        <h4 class="modal-title">🗑️ Confirm Delete</h4>
                    </div>
                    <div class="modal-body">
                        <p>Are you sure you want to delete "<strong>{{$ctrl.item.text}}</strong>"?</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-modal btn-modal-cancel"
                                ng-click="$ctrl.cancel()">Cancel</button>
                        <button class="btn-modal btn-modal-delete"
                                ng-click="$ctrl.confirm()">Delete</button>
                    </div>
                </div>
            `,
            controllerAs: '$ctrl',
            controller: ['$uibModalInstance', function($uibModalInstance) {
                this.item = item;
                this.confirm = function() { $uibModalInstance.close('confirm'); };
                this.cancel = function() { $uibModalInstance.dismiss('cancel'); };
            }],
            size: 'sm',
            windowClass: 'dark-modal'
        });

        modalInstance.result.then(() => {
            this._bus.emit(TODO_EVENTS.TODO_REMOVE, { id: item.id });
        });
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

TodoController.$inject = ['lpCoreBus', 'TodoStore', '$scope', '$uibModal'];
