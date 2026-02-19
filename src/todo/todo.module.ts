import * as angular from 'angular';
import uiBootstrap from 'angular-ui-bootstrap';
import coreModule from '@/core/core.module';
import TodoController from './todo.controller';
import TodoStore from './todo.store';
import template from './todo.html';

export default (angular as any).module('todo', [coreModule, uiBootstrap])
  .service('TodoStore', TodoStore)
  .component('todoList', {
    template: template,
    controller: TodoController
  })
  .name;
