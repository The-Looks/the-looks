import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { Screen, T, H, Btn, Chip, Card, Tile, Badge, Row, SectionTitle, Toggle, Field } from '../../../components/shared/ui';
import { colors, fonts } from '../../../services/shared/theme';
import { user, items, outfits } from '../../../services/shared/mock';

const OutfitStrip = ({ o }) => (
  <View style={{ flexDirection: 'row', gap: 8 }}>
    {o.emojis.map((e, i) => <Tile key={i} emoji={e} tint={o.tint} h={78} style={{ flex: 1 }} />)}
  </View>
);

// 06 AI Phối đồ
export function AIOutfit({ navigation: nav }) {
  const [occ, setOcc] = useState('Cafe');
  return (
    <Screen nav={nav} title="AI Phối đồ" right={<Pressable onPress={() => nav.navigate('AISettings')}><T style={{ fontSize: 18 }}>⚙️</T></Pressable>}
      footer={<View style={{ flexDirection: 'row', gap: 10 }}>
        <Btn style={{ flex: 1 }} kind="ghost" label="Lưu outfit" onPress={() => nav.navigate('SavedOutfits')} />
        <Btn style={{ flex: 1 }} label="Hỏi bạn bè" onPress={() => nav.navigate('CreateVote')} /></View>}>
      <T style={{ color: colors.muted }}>{user.city} · {user.temp}</T>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
        {['Cafe', 'Đi học', 'Đi làm', 'Hẹn hò', 'Dã ngoại'].map((x) => <Chip key={x} label={x} active={occ === x} onPress={() => setOcc(x)} />)}
      </View>
      <Card style={{ marginTop: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <H size={16}>{outfits[0].name}</H><Badge tone="green" label="96% phù hợp" />
        </View>
        <OutfitStrip o={outfits[0]} />
        <T style={{ color: colors.muted, marginTop: 10 }}>Vì sao hợp: màu pastel cùng tông Warm Autumn, chất liệu thoáng cho {user.temp}.</T>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <Btn small kind="ghost" label="Thử 3D" onPress={() => nav.navigate('Tryon3D')} />
          <Btn small kind="ghost" label="Đổi món" onPress={() => nav.navigate('SwapItem')} />
          <Btn small kind="ghost" label="Chi tiết" onPress={() => nav.navigate('OutfitDetail', { id: 1 })} />
        </View>
      </Card>
      <SectionTitle>Gợi ý khác</SectionTitle>
      {outfits.slice(1).map((o) => (
        <Card key={o.id} onPress={() => nav.navigate('OutfitDetail', { id: o.id })}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <T style={{ fontFamily: fonts.bodySemi }}>{o.name}</T><Badge label={`${o.match}%`} tone="green" />
          </View>
          <OutfitStrip o={o} />
        </Card>
      ))}
    </Screen>
  );
}

// 07 Thử đồ 3D
export function Tryon3D({ navigation: nav }) {
  return (
    <Screen nav={nav} title="Thử đồ 3D" footer={<View style={{ flexDirection: 'row', gap: 10 }}>
      <Btn style={{ flex: 1 }} kind="ghost" label="Chỉnh số đo" onPress={() => nav.navigate('AdjustSize')} />
      <Btn style={{ flex: 1 }} label="Lưu outfit" onPress={() => nav.navigate('SavedOutfits')} /></View>}>
      <Tile emoji="🧍‍♀️" h={380} tint={colors.lavSoft} label="Mô hình 3D theo số đo của bạn" />
      <Card style={{ marginTop: 14 }}>
        <T style={{ fontSize: 12, color: colors.muted }}>Đang mặc</T>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          {items.slice(0, 4).map((i) => <Tile key={i.id} emoji={i.emoji} tint={i.tint} h={58} style={{ flex: 1 }} />)}
        </View>
      </Card>
      <T style={{ fontSize: 12, color: colors.muted, textAlign: 'center' }}>Kết quả mang tính tham khảo về dáng và màu.</T>
    </Screen>
  );
}

// 08 Chỉnh số đo
export function AdjustSize({ navigation: nav }) {
  const [v, setV] = useState({ h: '158', w: '48', b: '82', wa: '62', hi: '93' });
  const set = (k) => (t) => setV({ ...v, [k]: t });
  return (
    <Screen nav={nav} title="Chỉnh số đo" footer={<Btn label="Cập nhật mô hình" onPress={() => nav.goBack()} />}>
      <Field label="Chiều cao (cm)" value={v.h} onChangeText={set('h')} keyboardType="numeric" />
      <Field label="Cân nặng (kg)" value={v.w} onChangeText={set('w')} keyboardType="numeric" />
      <Field label="Ngực (cm)" value={v.b} onChangeText={set('b')} keyboardType="numeric" />
      <Field label="Eo (cm)" value={v.wa} onChangeText={set('wa')} keyboardType="numeric" />
      <Field label="Hông (cm)" value={v.hi} onChangeText={set('hi')} keyboardType="numeric" />
      <Card style={{ backgroundColor: colors.lavSoft, borderColor: colors.lavSoft }}>
        <T style={{ color: colors.purple, fontFamily: fonts.bodySemi }}>Dáng người: {user.shape}</T>
        <T style={{ color: colors.muted, marginTop: 4 }}>Tông màu: {user.palette}</T>
      </Card>
    </Screen>
  );
}

// 09 Outfit đã lưu
export function SavedOutfits({ navigation: nav }) {
  return (
    <Screen nav={nav} title="Outfit đã lưu" right={<Pressable onPress={() => nav.navigate('CreateOutfit')}><T style={{ fontSize: 22, color: colors.purple }}>＋</T></Pressable>}>
      {outfits.map((o) => (
        <Card key={o.id} onPress={() => nav.navigate('OutfitDetail', { id: o.id })}>
          <OutfitStrip o={o} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            <View><T style={{ fontFamily: fonts.bodySemi }}>{o.name}</T><T style={{ fontSize: 12, color: colors.muted }}>{o.occasion} · {o.count} món</T></View>
            <Badge tone="green" label={`${o.match}%`} />
          </View>
        </Card>
      ))}
    </Screen>
  );
}

// 28 Tạo outfit
export function CreateOutfit({ navigation: nav }) {
  const [sel, setSel] = useState([1, 2]);
  const tog = (id) => setSel((p) => (p.includes(id) ? p.filter((i) => i !== id) : [...p, id]));
  return (
    <Screen nav={nav} title="Tạo outfit" footer={<Btn label={`Lưu outfit (${sel.length} món)`} onPress={() => nav.navigate('SavedOutfits')} />}>
      <Field label="Tên outfit" placeholder="VD: Soft Campus Day" />
      <T style={{ fontFamily: fonts.bodySemi, marginBottom: 10 }}>Chọn món từ tủ đồ</T>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {items.map((i) => (
          <Pressable key={i.id} onPress={() => tog(i.id)} style={{ width: '30.5%', opacity: sel.includes(i.id) ? 1 : 0.6 }}>
            <Tile emoji={i.emoji} tint={i.tint} h={90} style={sel.includes(i.id) ? { borderWidth: 2.5, borderColor: colors.purple } : null} />
            <T style={{ fontSize: 11, marginTop: 4 }} numberOfLines={1}>{i.name}</T>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

// 29 Đổi món đồ
export function SwapItem({ navigation: nav }) {
  const [sel, setSel] = useState(2);
  return (
    <Screen nav={nav} title="Đổi món đồ" footer={<Btn label="Thay món này" onPress={() => nav.goBack()} />}>
      <T style={{ color: colors.muted, marginBottom: 12 }}>Đang thay: <T style={{ fontFamily: fonts.bodySemi }}>Blazer pastel</T></T>
      {items.filter((i) => ['Áo khoác', 'Áo'].includes(i.cat)).map((i) => (
        <Card key={i.id} onPress={() => setSel(i.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: sel === i.id ? colors.purple : colors.line, borderWidth: sel === i.id ? 2 : 1 }}>
          <Tile emoji={i.emoji} tint={i.tint} h={56} w={56} />
          <View style={{ flex: 1 }}><T style={{ fontFamily: fonts.bodySemi }}>{i.name}</T><T style={{ fontSize: 12, color: colors.muted }}>{i.color}</T></View>
          <Badge tone="green" label="Hợp" />
        </Card>
      ))}
    </Screen>
  );
}

// 30 Chi tiết outfit
export function OutfitDetail({ navigation: nav, route }) {
  const o = outfits.find((x) => x.id === route.params?.id) || outfits[0];
  return (
    <Screen nav={nav} title="Chi tiết outfit" footer={<View style={{ flexDirection: 'row', gap: 10 }}>
      <Btn style={{ flex: 1 }} kind="ghost" label="Đưa vào lịch" onPress={() => nav.navigate('Calendar')} />
      <Btn style={{ flex: 1 }} label="Hỏi bạn bè" onPress={() => nav.navigate('CreateVote')} /></View>}>
      <Tile emoji={o.emojis[0]} tint={o.tint} h={240} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }}>
        <H size={20}>{o.name}</H><Badge tone="green" label={`${o.match}%`} />
      </View>
      <T style={{ color: colors.muted, marginTop: 2 }}>{o.occasion} · {o.count} món</T>
      <SectionTitle>Các món trong outfit</SectionTitle>
      {items.slice(0, o.count).map((i) => <Row key={i.id} icon={i.emoji} title={i.name} sub={i.color} onPress={() => nav.navigate('ItemDetail', { id: i.id })} />)}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
        <Btn small kind="ghost" label="Thử 3D" onPress={() => nav.navigate('Tryon3D')} />
        <Btn small kind="ghost" label="Đổi món" onPress={() => nav.navigate('SwapItem')} />
      </View>
    </Screen>
  );
}

// 26 Lịch mặc (Tháng 10/2026, hôm nay 14)
export function Calendar({ navigation: nav }) {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const offset = 3; // 1/10/2026 = Thứ Năm
  const worn = [2, 5, 9, 12, 14, 16, 20, 23];
  return (
    <Screen nav={nav} title="Lịch mặc">
      <H size={18} style={{ textAlign: 'center', marginBottom: 12 }}>Tháng 10, 2026</H>
      <View style={{ flexDirection: 'row' }}>{['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => <T key={d} style={{ flex: 1, textAlign: 'center', color: colors.muted, fontSize: 12 }}>{d}</T>)}</View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
        {Array.from({ length: offset }).map((_, i) => <View key={'o' + i} style={{ width: '14.28%', height: 48 }} />)}
        {days.map((d) => (
          <Pressable key={d} onPress={() => nav.navigate('CalendarDetail', { day: d })} style={{ width: '14.28%', height: 48, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: d === 14 ? colors.purple : 'transparent' }}>
              <T style={{ color: d === 14 ? '#fff' : colors.ink, fontFamily: fonts.bodySemi }}>{d}</T>
            </View>
            {worn.includes(d) && d !== 14 ? <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: colors.pink, marginTop: -2 }} /> : null}
          </Pressable>
        ))}
      </View>
      <Card style={{ marginTop: 14 }} onPress={() => nav.navigate('CalendarDetail', { day: 14 })}>
        <T style={{ color: colors.muted, fontSize: 12 }}>Hôm nay · 14/10</T>
        <T style={{ fontFamily: fonts.bodySemi, marginTop: 4 }}>Pastel Cafe Layering</T>
      </Card>
    </Screen>
  );
}

// 27 Chi tiết lịch
export function CalendarDetail({ navigation: nav, route }) {
  const d = route.params?.day || 14;
  return (
    <Screen nav={nav} title={`Ngày ${d}/10`} footer={<Btn label="Đổi outfit cho ngày này" onPress={() => nav.navigate('SavedOutfits')} />}>
      <Card>
        <OutfitStrip o={outfits[0]} />
        <H size={17} style={{ marginTop: 12 }}>{outfits[0].name}</H>
        <T style={{ color: colors.muted }}>{outfits[0].occasion} · {user.temp}</T>
      </Card>
      <Row icon="📝" title="Ghi chú" sub="Hẹn cafe với Lan Anh lúc 15:00" />
      <Row icon="⭐" title="Đánh giá sau khi mặc" sub="Chạm để chấm sao" onPress={() => {}} />
    </Screen>
  );
}

// 37 Trợ lý mua sắm
export function Shopping({ navigation: nav }) {
  return (
    <Screen nav={nav} title="Trợ lý mua sắm">
      <Card style={{ backgroundColor: colors.lavSoft, borderColor: colors.lavSoft }}>
        <T style={{ color: colors.purple, fontFamily: fonts.bodySemi }}>Mua thông minh hơn</T>
        <T style={{ marginTop: 4, color: colors.muted }}>Dán link sản phẩm, LOOKSY kiểm tra xem có hợp tủ đồ và dáng người của bạn không.</T>
      </Card>
      <Field label="Link sản phẩm" placeholder="https://shopee.vn/..." autoCapitalize="none" />
      <Btn label="Phân tích" onPress={() => {}} />
      <SectionTitle>Kết quả mẫu</SectionTitle>
      <Card>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Tile emoji="👜" tint={colors.peach} h={70} w={70} />
          <View style={{ flex: 1 }}>
            <T style={{ fontFamily: fonts.bodySemi }}>Túi xách mini tím</T>
            <Badge tone="green" label="Phối được 7 outfit" />
            <T style={{ fontSize: 12, color: colors.muted, marginTop: 6 }}>Bạn đã có 2 món tương tự — cân nhắc trước khi mua.</T>
          </View>
        </View>
      </Card>
    </Screen>
  );
}

// 36 Tuỳ chỉnh gợi ý AI
export function AISettings({ navigation: nav }) {
  const [on, setOn] = useState({ weather: true, palette: true, shape: true, rare: false });
  const t = (k) => (v) => setOn({ ...on, [k]: v });
  return (
    <Screen nav={nav} title="Tuỳ chỉnh gợi ý AI">
      <Row icon="☀️" title="Theo thời tiết" sub="Dùng nhiệt độ nơi bạn ở" right={<Toggle value={on.weather} onValueChange={t('weather')} />} />
      <Row icon="🎨" title="Theo tông màu cá nhân" sub={user.palette} right={<Toggle value={on.palette} onValueChange={t('palette')} />} />
      <Row icon="🧍‍♀️" title="Theo dáng người" sub={user.shape} right={<Toggle value={on.shape} onValueChange={t('shape')} />} />
      <Row icon="♻️" title="Ưu tiên món ít mặc" sub="Giúp dùng hết tủ đồ" right={<Toggle value={on.rare} onValueChange={t('rare')} />} />
    </Screen>
  );
}

// 35 Hướng dẫn chụp ảnh
export function PhotoGuide({ navigation: nav }) {
  const tips = [['☀️', 'Chụp nơi đủ sáng', 'Tránh ngược sáng và bóng đổ.'], ['⬜', 'Nền đơn giản', 'Trải đồ trên nền trơn, sáng màu.'], ['📐', 'Chụp thẳng, đủ món', 'Lấy trọn món đồ trong khung hình.'], ['👗', 'Là phẳng nếp nhăn', 'AI nhận diện form dáng chính xác hơn.']];
  return (
    <Screen nav={nav} title="Hướng dẫn chụp ảnh" footer={<Btn label="Đã hiểu" onPress={() => nav.goBack()} />}>
      {tips.map(([e, t, s]) => <Row key={t} icon={e} title={t} sub={s} />)}
    </Screen>
  );
}
