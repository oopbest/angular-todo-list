import { ITodo, ITodoControllerScope, ICoreBus, ITodoStore } from '@/types';
import { TODO_EVENTS } from './todo-states.constant';

/**
 * TodoController — Thin Controller
 *
 * Dispatches user actions via lpCoreBus and reads state from TodoStore.
 * Uses $uibModal for confirm delete dialog.
 */
export default class TodoController implements angular.IController {
  private _bus: ICoreBus;
  private _store: ITodoStore;
  private _$uibModal: angular.ui.bootstrap.IModalService;
  private _unsub?: () => void;

  // View properties
  todos: ITodo[] = [];
  todoText: string = '';
  errorMessage: string = '';
  machineState: string = '';
  completionPercent: number = 0;

  /* @ngInject */
  constructor(
    lpCoreBus: ICoreBus,
    TodoStore: ITodoStore,
    $scope: ITodoControllerScope,
    $uibModal: angular.ui.bootstrap.IModalService
  ) {
    this._bus = lpCoreBus;
    this._store = TodoStore;
    this._$uibModal = $uibModal;

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

  private _syncFromStore(): void {
    this.todos = this._store.todos;
    this.errorMessage = this._store.getErrorMessage();
    this.machineState = this._store.getState();
    this.completionPercent = this._store.completionPercent;
  }

  // ── User Actions ──

  addTodo(): void {
    this._bus.emit(TODO_EVENTS.TODO_ADD, { text: this.todoText });
    if (!this._store.getErrorMessage()) {
      this.todoText = '';
    }
  }

  confirmRemove(item: ITodo): void {
    const modalInstance = this._$uibModal.open({
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
      controller: ['$uibModalInstance', function($uibModalInstance: angular.ui.bootstrap.IModalInstanceService) {
        const ctrl = {
          item: item,
          confirm: function() { $uibModalInstance.close('confirm'); },
          cancel: function() { $uibModalInstance.dismiss('cancel'); }
        };
        return ctrl;
      }],
      size: 'sm',
      windowClass: 'dark-modal'
    });

    modalInstance.result.then(() => {
      this._bus.emit(TODO_EVENTS.TODO_REMOVE, { id: item.id });
    });
  }

  toggle(item: ITodo): void {
    this._bus.emit(TODO_EVENTS.TODO_TOGGLE, { id: item.id });
  }

  archive(): void {
    this._bus.emit(TODO_EVENTS.TODO_ARCHIVE);
  }

  remaining(): number {
    return this._store.remaining();
  }

  clearError(): void {
    if (this.errorMessage) {
      this._bus.emit(TODO_EVENTS.RESET);
      this.errorMessage = '';
    }
  }

  // ── Debug ──

  debugHistory(): void {
    console.log('[TodoController] History:', this._store.getHistory());
  }
}

// Static injection annotation
(TodoController as any).$inject = ['lpCoreBus', 'TodoStore', '$scope', '$uibModal'];
