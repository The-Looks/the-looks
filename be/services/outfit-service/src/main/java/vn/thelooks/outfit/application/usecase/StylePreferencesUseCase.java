package vn.thelooks.outfit.application.usecase;

import java.util.UUID;
import vn.thelooks.outfit.domain.model.StylePreferences;

/** Hồ sơ phong cách: giới tính, phong cách yêu thích, ngân sách (đều không bắt buộc). */
public interface StylePreferencesUseCase {

    StylePreferences preferences(UUID ownerId);

    StylePreferences save(UUID ownerId, StylePreferences preferences);
}
