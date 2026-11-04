// Sinh kiểu TypeScript từ OpenAPI của từng service: npm run gen:api
// Chạy lại mỗi khi file trong be/packages/contracts thay đổi, rồi commit kết quả.
import { execSync } from 'node:child_process';

const contracts = '../../be/packages/contracts/src/main/resources/openapi';
const destinations = {
  auth: 'guest/auth', wardrobe: 'user/wardrobe', outfit: 'user/outfit',
  voting: 'shared/voting', billing: 'user/billing',
};
for (const service of ['auth', 'wardrobe', 'outfit', 'voting', 'billing']) {
  execSync(`npx openapi-typescript "${contracts}/${service}-api.yaml" -o "src/interface/dto/${destinations[service]}/${service}.d.ts"`, {
    stdio: 'inherit',
  });
}
