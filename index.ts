if (typeof global.DOMException === 'undefined') {
  // @ts-ignore
  global.DOMException = class DOMException extends Error {
    code: number;
    constructor(message?: string, name?: string) {
      super(message);
      this.name = name || 'Error';
      this.code = 0;
    }
  };
}

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
