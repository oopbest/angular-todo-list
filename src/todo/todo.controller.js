import angular from 'angular';

export default class TodoController {
    constructor() {
        this.todos = [
            {text:'learn angular', done:true},
            {text:'build an angular app', done:false}
        ];
        this.todoText = '';
        this.errorMessage = '';
    }

    addTodo() {
        if (!this.todoText || !this.todoText.trim()) {
            this.errorMessage = 'Please enter a todo item.';
            return;
        }
        this.errorMessage = '';
        this.todos.push({text: this.todoText.trim(), done: false});
        this.todoText = '';
    }

    clearError() {
        if (this.errorMessage) {
            this.errorMessage = '';
        }
    }

    remaining() {
        var count = 0;
        angular.forEach(this.todos, (todo) => {
            count += todo.done ? 0 : 1;
        });
        return count;
    }

    archive() {
        var oldTodos = this.todos;
        this.todos = [];
        angular.forEach(oldTodos, (todo) => {
            if (!todo.done) this.todos.push(todo);
        });
    }

    remove(item) {
        var index = this.todos.indexOf(item);
        if (index > -1) {
            this.todos.splice(index, 1);
        }
    }
}
