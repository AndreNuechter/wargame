// @ts-ignore
// eslint-disable-next-line import/no-unresolved, import/extensions
import serviceWorkerUrl from './service-worker?worker&url';

export default (() => window.navigator.serviceWorker
    .register(serviceWorkerUrl)
    .catch(console.error))();