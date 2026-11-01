import { setupWorker } from 'msw/browser';
import { handlersByService } from './handlers';

/** Bật giả lập cho các service trong danh sách; request còn lại đi tới backend thật qua proxy. */
export async function startMocks(services: string[]) {
  const handlers = services.flatMap((s) => handlersByService[s] ?? []);
  await setupWorker(...handlers).start({ onUnhandledRequest: 'bypass', quiet: true });
  console.info(`[MSW] Đang giả lập: ${services.join(', ')}`);
  if (!import.meta.env.DEV) showDemoBanner();
}

function showDemoBanner() {
  const banner = document.createElement('div');
  banner.className = 'demo-banner';
  banner.setAttribute('role', 'status');
  banner.textContent = 'Bản demo · dữ liệu mẫu, chưa lưu thật';
  document.body.prepend(banner);
}
