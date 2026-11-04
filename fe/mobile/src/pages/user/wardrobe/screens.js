import React, { useState } from 'react';
import { View, Pressable, TextInput } from 'react-native';
import { Screen, T, H, Btn, Chip, Card, Tile, Badge, Row, SectionTitle, Bar, Brand, Field } from '../../../components/shared/ui';
import { colors, fonts, radius } from '../../../services/shared/theme';
import { user, items, outfits, cats, vnd } from '../../../services/shared/mock';

const ItemGrid = ({ list, nav }) => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
    {list.map((it) => (
      <Pressable key={it.id} style={{ width: '47.5%' }} onPress={() => nav.navigate('ItemDetail', { id: it.id })}>
        <Tile emoji={it.emoji} tint={it.tint} h={130} />
        <T style={{ fontFamily: fonts.bodySemi, marginTop: 6 }} numberOfLines={1}>{it.name}</T>
        <T style={{ fontSize: 12, color: colors.muted }}>{it.cat} · mặc {it.worn} lần</T>
      </Pressable>
    ))}
  </View>
);

// 02 Trang chủ
export function Home({ navigation: nav }) {
  return (
    <Screen scroll>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <Brand />
        <Pressable onPress={() => nav.navigate('Notifications')}><T style={{ fontSize: 20 }}>🔔</T></Pressable>
      </View>
      <H size={22} style={{ marginTop: 18 }}>Chào {user.name.split(' ')[1]} 👋</H>
      <T style={{ color: colors.muted, marginTop: 2 }}>{user.city} · {user.temp} · Nắng nhẹ</T>

      <Card style={{ backgroundColor: colors.purple, marginTop: 16, borderColor: colors.purple }}>
        <T style={{ color: '#E4D5F7', fontSize: 12 }}>LOOKSY gợi ý hôm nay</T>
        <H size={18} style={{ color: '#fff', marginVertical: 6 }}>Pastel Cafe Layering</H>
        <T style={{ color: '#EBDDFB', marginBottom: 12 }}>Thoáng mát cho {user.temp}, hợp đi cafe · 96% phù hợp.</T>
        <Btn kind="ghost" small label="Xem outfit" onPress={() => nav.navigate('AIOutfit')} style={{ alignSelf: 'flex-start' }} />
      </Card>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        {[['Món đồ', user.items], ['Ít mặc', user.rarely], ['Chưa mặc', user.never]].map(([l, v]) => (
          <Card key={l} style={{ flex: 1, alignItems: 'center', marginBottom: 0 }} onPress={() => nav.navigate('WardrobeStats')}>
            <H size={20} style={{ color: colors.purple }}>{v}</H><T style={{ fontSize: 12, color: colors.muted }}>{l}</T>
          </Card>
        ))}
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
        <Btn style={{ flex: 1 }} small label="＋ Thêm món" onPress={() => nav.navigate('AddItem')} />
        <Btn style={{ flex: 1 }} small kind="ghost" label="👗 Thử đồ 3D" onPress={() => nav.navigate('Tryon3D')} />
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
        <Btn style={{ flex: 1 }} small kind="ghost" label="📅 Lịch mặc" onPress={() => nav.navigate('Calendar')} />
        <Btn style={{ flex: 1 }} small kind="ghost" label="🛍️ Trợ lý mua sắm" onPress={() => nav.navigate('Shopping')} />
      </View>

      <SectionTitle action="Xem tất cả" onAction={() => nav.navigate('Wardrobe')}>Mới thêm gần đây</SectionTitle>
      <ItemGrid list={items.slice(0, 4)} nav={nav} />

      <SectionTitle action="Outfit đã lưu" onAction={() => nav.navigate('SavedOutfits')}>Outfit nổi bật</SectionTitle>
      {outfits.slice(0, 2).map((o) => (
        <Card key={o.id} onPress={() => nav.navigate('OutfitDetail', { id: o.id })} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Tile emoji={o.emojis[0]} tint={o.tint} h={64} w={64} />
          <View style={{ flex: 1 }}>
            <T style={{ fontFamily: fonts.bodySemi }}>{o.name}</T>
            <T style={{ fontSize: 12, color: colors.muted }}>{o.occasion} · {o.count} món</T>
          </View>
          <Badge tone="green" label={`${o.match}%`} />
        </Card>
      ))}
    </Screen>
  );
}

// 03 Tủ đồ
export function Wardrobe({ navigation: nav }) {
  const [cat, setCat] = useState('Tất cả');
  const list = cat === 'Tất cả' ? items : items.filter((i) => i.cat === cat);
  return (
    <Screen nav={nav} title="Tủ đồ" back={false}
      right={<Pressable onPress={() => nav.navigate('Search')}><T style={{ fontSize: 18 }}>🔍</T></Pressable>}>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
        <Btn small label="＋ Thêm món" onPress={() => nav.navigate('AddItem')} />
        <Btn small kind="ghost" label="Bộ lọc" onPress={() => nav.navigate('Filter')} />
        <Btn small kind="ghost" label="Thống kê" onPress={() => nav.navigate('WardrobeStats')} />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cats.map((c) => <Chip key={c} label={c} active={cat === c} onPress={() => setCat(c)} />)}
      </View>
      <ItemGrid list={list} nav={nav} />
    </Screen>
  );
}

// 04 Thêm món đồ
export function AddItem({ navigation: nav }) {
  return (
    <Screen nav={nav} title="Thêm món đồ" footer={<Btn label="Lưu vào tủ đồ" onPress={() => nav.goBack()} />}>
      <Tile emoji="📷" h={200} label="Chụp hoặc chọn ảnh" style={{ borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.lavender }} />
      <Pressable onPress={() => nav.navigate('PhotoGuide')}><T style={{ color: colors.purple, textAlign: 'center', marginVertical: 10, fontFamily: fonts.bodySemi }}>Xem hướng dẫn chụp ảnh</T></Pressable>
      <Card style={{ backgroundColor: colors.lavSoft, borderColor: colors.lavSoft }}>
        <T style={{ color: colors.purple, fontFamily: fonts.bodySemi }}>✨ AI nhận diện</T>
        <T style={{ color: colors.muted, marginTop: 4 }}>Tự gợi ý loại, màu và chất liệu sau khi bạn tải ảnh lên.</T>
      </Card>
      <Field label="Tên món đồ" placeholder="VD: Áo cardigan tím pastel" />
      <Field label="Danh mục" placeholder="Áo khoác" />
      <Field label="Màu sắc" placeholder="Tím pastel" />
      <Field label="Giá mua (đ)" placeholder="350000" keyboardType="numeric" />
      <Field label="Nguồn" placeholder="Shopee / TikTok Shop / Khác" />
    </Screen>
  );
}

// 05 Chi tiết món đồ
export function ItemDetail({ navigation: nav, route }) {
  const it = items.find((i) => i.id === route.params?.id) || items[4];
  const cpw = it.worn ? vnd(Math.round(it.price / it.worn)) : '—';
  return (
    <Screen nav={nav} title="Chi tiết món đồ" footer={<View style={{ flexDirection: 'row', gap: 10 }}>
      <Btn style={{ flex: 1 }} kind="ghost" label="Phối với món này" onPress={() => nav.navigate('CreateOutfit')} />
      <Btn style={{ flex: 1 }} label="Thử 3D" onPress={() => nav.navigate('Tryon3D')} />
    </View>}>
      <Tile emoji={it.emoji} tint={it.tint} h={240} />
      <H size={20} style={{ marginTop: 14 }}>{it.name}</H>
      <T style={{ color: colors.muted, marginTop: 2 }}>{it.cat} · {it.color}</T>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
        <Card style={{ flex: 1, marginBottom: 0 }}><T style={{ fontSize: 12, color: colors.muted }}>Giá mua</T><H size={16}>{vnd(it.price)}</H></Card>
        <Card style={{ flex: 1, marginBottom: 0 }}><T style={{ fontSize: 12, color: colors.muted }}>Đã mặc</T><H size={16}>{it.worn} lần</H></Card>
      </View>
      <Card style={{ marginTop: 12 }}>
        <T style={{ fontSize: 12, color: colors.muted }}>Chi phí / lần mặc</T>
        <H size={18} style={{ color: colors.purple }}>{cpw}</H>
        <T style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>Nguồn: {it.src}</T>
      </Card>
      {it.worn === 0 && <Badge tone="amber" label="Chưa mặc lần nào — thử phối lại?" />}
    </Screen>
  );
}

// 24 Tìm kiếm
export function Search({ navigation: nav }) {
  const [q, setQ] = useState('');
  const list = items.filter((i) => i.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <Screen nav={nav} title="Tìm kiếm">
      <TextInput value={q} onChangeText={setQ} placeholder="Tìm món đồ, màu, danh mục…" placeholderTextColor="#A99FB3"
        style={{ backgroundColor: '#fff', borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 18, paddingVertical: 12, fontFamily: fonts.body, marginBottom: 14 }} />
      <T style={{ color: colors.muted, marginBottom: 10 }}>{list.length} kết quả</T>
      <ItemGrid list={list} nav={nav} />
    </Screen>
  );
}

// 25 Bộ lọc tủ đồ
export function Filter({ navigation: nav }) {
  const [a, setA] = useState(['Áo']);
  const tog = (x) => setA((p) => (p.includes(x) ? p.filter((i) => i !== x) : [...p, x]));
  return (
    <Screen nav={nav} title="Bộ lọc" footer={<View style={{ flexDirection: 'row', gap: 10 }}>
      <Btn style={{ flex: 1 }} kind="ghost" label="Xoá lọc" onPress={() => setA([])} />
      <Btn style={{ flex: 2 }} label="Áp dụng" onPress={() => nav.goBack()} /></View>}>
      {[['Danh mục', cats.slice(1)], ['Màu sắc', ['Trắng', 'Hồng', 'Tím', 'Xanh', 'Đen']], ['Mức độ mặc', ['Chưa mặc', 'Ít mặc', 'Hay mặc']], ['Nguồn', ['Shopee', 'TikTok Shop', 'Khác']]].map(([t, opts]) => (
        <View key={t}>
          <H size={15} style={{ marginTop: 10, marginBottom: 10 }}>{t}</H>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{opts.map((o) => <Chip key={o} label={o} active={a.includes(o)} onPress={() => tog(o)} />)}</View>
        </View>
      ))}
    </Screen>
  );
}

// 31 Thống kê tủ đồ
export function WardrobeStats({ navigation: nav }) {
  return (
    <Screen nav={nav} title="Thống kê tủ đồ">
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {[['Tổng', user.items, colors.purple], ['Ít mặc', user.rarely, colors.amber], ['Chưa mặc', user.never, colors.pink]].map(([l, v, c]) => (
          <Card key={l} style={{ flex: 1, alignItems: 'center' }}><H size={22} style={{ color: c }}>{v}</H><T style={{ fontSize: 12, color: colors.muted }}>{l}</T></Card>
        ))}
      </View>
      <SectionTitle>Theo danh mục</SectionTitle>
      <Card>{[['Áo', 24], ['Quần', 14], ['Váy', 12], ['Áo khoác', 10], ['Giày', 8]].map(([l, v]) => (
        <View key={l} style={{ marginBottom: 10 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}><T>{l}</T><T style={{ color: colors.muted }}>{v}</T></View><Bar pct={(v / 24) * 100} /></View>
      ))}</Card>
      <SectionTitle>Nguồn mua</SectionTitle>
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><T>Shopee</T><T style={{ fontFamily: fonts.bodySemi }}>42</T></View>
        <View style={{ height: 8 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><T>TikTok Shop</T><T style={{ fontFamily: fonts.bodySemi }}>26</T></View>
      </Card>
      <Card style={{ backgroundColor: colors.lavSoft, borderColor: colors.lavSoft }}>
        <T style={{ color: colors.purple, fontFamily: fonts.bodySemi }}>💡 Gợi ý</T>
        <T style={{ marginTop: 4 }}>Bạn có {user.never} món chưa mặc. LOOKSY có thể phối chúng thành outfit mới.</T>
        <Btn small label="Phối ngay" style={{ alignSelf: 'flex-start', marginTop: 10 }} onPress={() => nav.navigate('AIOutfit')} />
      </Card>
    </Screen>
  );
}
