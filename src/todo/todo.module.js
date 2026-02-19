import angular from 'angular';
import coreModule from '../core/core.module';
import TodoController from './todo.controller';
import TodoStore from './todo.store';
import template from './todo.html';

export default angular.module('todo', [coreModule])
    .service('TodoStore', TodoStore)
    .component('todoList', {
        template: template,
        controller: TodoController
    })
    .name;
