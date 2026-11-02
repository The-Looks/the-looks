// Sinh kiểu TypeScript từ OpenAPI của từng service: npm run gen:api
// Chạy lại mỗi khi file trong be/packages/contracts thay đổi, rồi commit kết quả.
import { execSync } from 'node:child_process';

const contracts = '../../be/packages/contracts/src/main/resources/openapi';
for (const service of ['auth', 'wardrobe', 'outfit', 'voting']) {
  execSync(`npx openapi-typescript "${contracts}/${service}-api.yaml" -o "src/shared/api/schema/${service}.d.ts"`, {
    stdio: 'inherit',
  });
}
