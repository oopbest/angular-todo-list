// Todo States
export const TODO_STATES = {
  IDLE: 'IDLE',
  ADDING: 'ADDING',
  REMOVING: 'REMOVING',
  TOGGLING: 'TOGGLING',
  ARCHIVING: 'ARCHIVING',
  ERROR: 'ERROR'
} as const;

// Todo Events
export const TODO_EVENTS = {
  // User actions
  TODO_ADD: 'TODO_ADD',
  TODO_TOGGLE: 'TODO_TOGGLE',
  TODO_REMOVE: 'TODO_REMOVE',
  TODO_ARCHIVE: 'TODO_ARCHIVE',
  
  // State machine transitions
  ADD_SUCCESS: 'ADD_SUCCESS',
  ADD_FAIL: 'ADD_FAIL',
  REMOVE_SUCCESS: 'REMOVE_SUCCESS',
  TOGGLE_SUCCESS: 'TOGGLE_SUCCESS',
  ARCHIVE_DONE: 'ARCHIVE_DONE',
  
  // System events
  RESET: 'RESET',
  STATE_CHANGED: 'STATE_CHANGED'
} as const;

// Type exports
export type TodoStateType = typeof TODO_STATES[keyof typeof TODO_STATES];
export type TodoEventType = typeof TODO_EVENTS[keyof typeof TODO_EVENTS];
