import * as angular from 'angular';
import LpCoreBus from './lp-core-bus.service';
import StateMachine from './state-machine.service';

export default (angular as any).module('core', [])
  .service('lpCoreBus', LpCoreBus)
  .factory('StateMachine', function() {
    // Return the class so consumers can instantiate with `new`
    return StateMachine;
  })
  .name;
