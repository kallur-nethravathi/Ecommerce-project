import { AsyncLocalStorage } from 'async_hooks';

class RequestContext {
  constructor() {
    this.asyncLocalStorage = new AsyncLocalStorage();
  }

  /**
   * Initializes context for a given request or job
   */
  run(context, callback) {
    this.asyncLocalStorage.run(context, callback);
  }

  /**
   * Gets the current request context
   */
  get() {
    return this.asyncLocalStorage.getStore() || {};
  }

  /**
   * Sets/updates a key in the current context
   */
  set(key, value) {
    const store = this.asyncLocalStorage.getStore();
    if (store) {
      store[key] = value;
    }
  }

  /**
   * Clears the context (can be called explicitly if needed)
   */
  exit(callback) {
    this.asyncLocalStorage.exit(callback);
  }
}

const requestContext = new RequestContext();
export default requestContext;
