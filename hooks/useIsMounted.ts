import * as React from 'react';

const subscribe = () => () => {};

export const useIsMounted = () => {
  return React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
};
