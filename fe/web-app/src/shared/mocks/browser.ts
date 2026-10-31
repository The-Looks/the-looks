import { setupWorker } from 'msw/browser';
import { handlersByService } from './handlers';

/** Bật giả lập cho các service trong danh sách; request còn lại đi tới backend thật qua proxy. */
export async function startMocks(services: string[]) {
  const handlers = services.flatMap((s) => handlersByService[s] ?? []);
  await setupWorker(...handlers).start({ onUnhandledRequest: 'bypass', quiet: true });
  console.info(`[MSW] Đang giả lập: ${services.join(', ')}`);
}
