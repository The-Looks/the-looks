import type { BillingPeriod, Plan } from '../../../interface/dto/types';

export const FEATURE_LABEL: Record<string, string> = {
  WARDROBE_STATS: 'Thống kê tủ đồ',
  COST_PER_WEAR: 'Chi phí mỗi lần mặc',
  WEAR_CALENDAR: 'Lịch mặc',
  TRY_ON_3D: 'Thử đồ 3D',
};

export const PLAN_TAGLINE: Record<Plan, string> = {
  FREE: 'Bắt đầu với vài món, có outfit đầu tiên ngay.',
  PLUS: 'Đủ chỗ cho cả tủ đồ, gợi ý AI mỗi ngày.',
  PRO: 'Không giới hạn, kèm công cụ để mặc nhiều hơn, mua ít hơn.',
};

export const PERIOD_LABEL: Record<BillingPeriod, string> = { MONTHLY: 'tháng', YEARLY: 'năm' };

export const vnd = (n: number) => `${n.toLocaleString('vi-VN')}đ`;

export const formatDate = (iso: string) => new Date(iso).toLocaleDateString('vi-VN');
