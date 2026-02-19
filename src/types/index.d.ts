// AngularJS augmentations
import * as angular from 'angular';

declare global {
  namespace angular {
    interface IController {
      // Base controller interface
    }
    
    namespace ui {
      namespace bootstrap {
        interface IModalService {
          open(options: IModalSettings): IModalInstanceService;
        }
        
        interface IModalSettings {
          animation?: boolean;
          template?: string;
          templateUrl?: string;
          controller?: any;
          controllerAs?: string;
          size?: string;
          windowClass?: string;
          resolve?: any;
        }
        
        interface IModalInstanceService {
          result: Promise<any>;
          close(result?: any): void;
          dismiss(reason?: any): void;
        }
      }
    }
    
    interface IModule {
      // Custom service registration
      service<T>(name: string, serviceConstructor: new (...args: any[]) => T): IModule;
      component(name: string, options: angular.IComponentOptions): IModule;
    }
  }
}

// Todo item interface
export interface ITodo {
  id: string;
  text: string;
  done: boolean;
  createdAt: Date;
}

// Todo events
export interface ITodoEvents {
  TODO_ADD: 'TODO_ADD';
  TODO_TOGGLE: 'TODO_TOGGLE';
  TODO_REMOVE: 'TODO_REMOVE';
  TODO_ARCHIVE: 'TODO_ARCHIVE';
  RESET: 'RESET';
  STATE_CHANGED: 'STATE_CHANGED';
}

// State machine configuration
export interface IStateConfig {
  initial: string;
  states: {
    [key: string]: {
      on?: {
        [event: string]: {
          target: string;
          guard?: (data?: any) => boolean;
          action?: (data?: any) => void;
        };
      };
      onEnter?: () => void;
      onExit?: () => void;
    };
  };
}

// Core bus service interface
export interface ICoreBus {
  on(event: string, handler: (data?: any) => void): () => void;
  emit(event: string, data?: any): void;
  off(event: string, handler?: (data?: any) => void): void;
}

// Todo store interface
export interface ITodoStore {
  todos: ITodo[];
  completionPercent: number;
  add(text: string): void;
  toggle(id: string): void;
  remove(id: string): void;
  archive(): void;
  remaining(): number;
  getTodos(): ITodo[];
  getErrorMessage(): string;
  getState(): string;
  getHistory(): string[];
}

// Controller interfaces
export interface ITodoControllerScope extends angular.IScope {
  $on(event: string, handler: (event: angular.IAngularEvent, ...args: any[]) => void): () => void;
  $destroy: () => void;
}
