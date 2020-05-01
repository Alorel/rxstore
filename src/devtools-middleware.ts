import {Store} from './types/Store';

export interface DevtoolsConfig {
  autoPause?: boolean;

  features?: {
    dispatch?: boolean;
    jump?: boolean;
    skip?: boolean;
    test?: boolean;
    [k: string]: any;
  };

  latency?: number;

  name?: string;

  [k: string]: any;
}

export function rxStoreDevtoolsMiddleware(
  store: Store,
  config?: DevtoolsConfig
): void {
  if (store.isClosed) {
    throw new Error('Store is closed');
  } else if (typeof window === 'undefined') {
    return;
  }

  const ext: any = (window as any).__REDUX_DEVTOOLS_EXTENSION__;
  if (!ext) {
    return;
  }

  const devTools: any = ext.connect(config);
  devTools.init(store.getState());

  store.addCleanup(
    store.actions()
      .subscribe(action => {
        devTools.send(action, store.getState());
      })
  );
}
