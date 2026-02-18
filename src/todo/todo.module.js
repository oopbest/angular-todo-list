import angular from 'angular';
import TodoController from './todo.controller';
import template from './todo.html';

export default angular.module('todo', [])
    .component('todoList', {
        template: template,
        controller: TodoController
    })
    .name;
