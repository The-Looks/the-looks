/**
 * Shared kernel: hạ tầng dùng chung (security, kiểu dữ liệu chung). Mọi module được phép dùng.
 * Không đặt logic nghiệp vụ của module nào ở đây.
 */
@ApplicationModule(type = ApplicationModule.Type.OPEN)
package vn.thelooks.shared;

import org.springframework.modulith.ApplicationModule;
