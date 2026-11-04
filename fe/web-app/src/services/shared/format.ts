const dateFmt = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
const dateTimeFmt = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });

export const formatDate = (iso: string) => dateFmt.format(new Date(iso));
export const formatDateTime = (iso: string) => dateTimeFmt.format(new Date(iso));
export const formatVnd = (n: number) => n.toLocaleString('vi-VN') + 'đ';
/** score 0..1 của gợi ý → "86%" */
export const formatPercent = (score: number) => `${Math.round(Math.max(0, Math.min(1, score)) * 100)}%`;
