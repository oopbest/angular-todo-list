/**
 * Todo States & Events — Constants
 *
 * Defines all possible states and event names for the Todo state machine.
 */

export const TODO_STATES = {
    IDLE: 'IDLE',
    ADDING: 'ADDING',
    REMOVING: 'REMOVING',
    TOGGLING: 'TOGGLING',
    ARCHIVING: 'ARCHIVING',
    ERROR: 'ERROR'
};

export const TODO_EVENTS = {
    // User actions (dispatched by controller → bus)
    TODO_ADD: 'TODO_ADD',
    TODO_REMOVE: 'TODO_REMOVE',
    TODO_TOGGLE: 'TODO_TOGGLE',
    TODO_ARCHIVE: 'TODO_ARCHIVE',

    // Store results (dispatched by store → bus)
    ADD_SUCCESS: 'ADD_SUCCESS',
    ADD_FAIL: 'ADD_FAIL',
    REMOVE_SUCCESS: 'REMOVE_SUCCESS',
    TOGGLE_SUCCESS: 'TOGGLE_SUCCESS',
    ARCHIVE_DONE: 'ARCHIVE_DONE',
    RESET: 'RESET',

    // State notification (dispatched by store → bus)
    STATE_CHANGED: 'STATE_CHANGED'
};
