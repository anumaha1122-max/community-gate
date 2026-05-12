// useStore.js — backward-compat shim
// Any file that imports from 'useStore' gets appStore instead.
export { default } from './appStore';
export { default as useStore } from './appStore';
