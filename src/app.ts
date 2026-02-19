import * as angular from 'angular';
import 'bootstrap/dist/css/bootstrap.min.css';
import todoModule from '@/todo/todo.module';
import './style.less';

// Initialize main application module
(angular as any).module('todoApp', [todoModule]);
