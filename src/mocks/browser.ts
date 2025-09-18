import { setupWorker } from 'msw';
import getHandlers from './handlers';

const handlers = getHandlers();
export const worker = typeof window !== 'undefined' ? setupWorker(...handlers) : null;

export default worker;
