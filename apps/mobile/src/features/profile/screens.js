import React, { useState } from 'react';
import { View } from 'react-native';
import { Screen, T, H, Btn, Chip, Card, Tile, Badge, Row, SectionTitle, Toggle, Field } from '../../shared/ui';
import { colors, fonts } from '../../shared/theme';
import { user, notifications, styles, palette } from '../../shared/mock';

// 14 Hồ sơ phong cách
export function Profile({ navigation: nav }) {
  return (
    <Screen nav={nav} title="Cá nhân" back={false}>
      <Card style={{ alignItems: 'center' }}>
        <View style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: colors.lavSoft, alignItems: 'center', justifyContent: 'center' }}><T style={{ fontSize: 34 }}>👩</T></View>
        <H size={19} style={{ marginTop: 10 }}>{user.name}</H>
        <T style={{ color: colors.muted }}>{user.city}</T>
        <Btn small kind="ghost" label="Chỉnh sửa hồ sơ" style={{ marginTop: 12 }} onPress={() => nav.navigate('EditProfile')} />
      </Card>
      <SectionTitle>Hồ sơ phong cách</SectionTitle>
      <Card>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{['Nữ tính', 'Tối giản'].map((x) => <Chip key={x} label={x} active />)}</View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>{palette.slice(0, 5).map((c) => <View key={c} style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c, borderWidth: 1, borderColor: colors.line }} />)}</View>
        <T style={{ color: colors.muted, marginTop: 12 }}>Dáng {user.shape} · {user.height} cm / {user.weight} kg · {user.palette}</T>
      </Card>
      <Card style={{ backgroundColor: colors.purple, borderColor: colors.purple }} onPress={() => nav.navigate('Premium')}>
        <T style={{ color: '#fff', fontFamily: fonts.bodySemi }}>⭐ Nâng cấp Premium</T>
        <T style={{ color: '#E4D5F7', marginTop: 4 }}>Thử đồ 3D không giới hạn, thống kê nâng cao.</T>
      </Card>
      <Row icon="🔔" title="Thông báo" onPress={() => nav.navigate('Notifications')} />
      <Row icon="🤖" title="Tuỳ chỉnh gợi ý AI" onPress={() => nav.navigate('AISettings')} />
      <Row icon="⚙️" title="Cài đặt" onPress={() => nav.navigate('Settings')} />
      <Row icon="ℹ️" title="Giới thiệu" onPress={() => nav.navigate('About')} />
    </Screen>
  );
}

// 15 Thông báo
export function Notifications({ navigation: nav }) {
  return (
    <Screen nav={nav} title="Thông báo">
      {notifications.map((n) => <Row key={n.id} icon={n.icon} title={n.title} sub={n.time} />)}
    </Screen>
  );
}

// 16 Premium
export function Premium({ navigation: nav }) {
  const [plan, setPlan] = useState('year');
  const perks = ['Thử đồ 3D không giới hạn', 'Thống kê tủ đồ nâng cao', 'Trợ lý mua sắm thông minh', 'Không quảng cáo'];
  return (
    <Screen nav={nav} title="Premium" footer={<Btn label="Dùng thử Premium" onPress={() => nav.goBack()} />}>
      <H size={24} style={{ textAlign: 'center' }}>Mở khoá LOOKSY ⭐</H>
      <View style={{ marginVertical: 16 }}>{perks.map((p) => <T key={p} style={{ marginBottom: 8 }}>✅  {p}</T>)}</View>
      {[['month', 'Theo tháng', '49.000đ / tháng'], ['year', 'Theo năm', '499.000đ / năm']].map(([k, l, p]) => (
        <Card key={k} onPress={() => setPlan(k)} style={{ borderColor: plan === k ? colors.purple : colors.line, borderWidth: plan === k ? 2 : 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View><T style={{ fontFamily: fonts.bodySemi }}>{l}</T><T style={{ color: colors.muted }}>{p}</T></View>
            {k === 'year' ? <Badge tone="pink" label="Tiết kiệm 15%" /> : null}
          </View>
        </Card>
      ))}
      <T style={{ fontSize: 11, color: colors.muted, textAlign: 'center' }}>Giá minh hoạ, chưa chốt.</T>
    </Screen>
  );
}

// 17 Cài đặt
export function Settings({ navigation: nav }) {
  const [n, setN] = useState(true);
  const [w, setW] = useState(true);
  return (
    <Screen nav={nav} title="Cài đặt">
      <Row icon="🔔" title="Thông báo đẩy" right={<Toggle value={n} onValueChange={setN} />} />
      <Row icon="☀️" title="Gợi ý theo thời tiết" right={<Toggle value={w} onValueChange={setW} />} />
      <Row icon="🌐" title="Ngôn ngữ" sub="Tiếng Việt" onPress={() => {}} />
      <Row icon="🔒" title="Quyền riêng tư & dữ liệu" onPress={() => {}} />
      <Row icon="❓" title="Hỗ trợ" sub="Trong ứng dụng · Fanpage · Zalo" onPress={() => {}} />
      <Row icon="ℹ️" title="Giới thiệu" onPress={() => nav.navigate('About')} />
      <View style={{ height: 20 }} />
      <Btn kind="outline" label="Đăng xuất" onPress={() => nav.reset({ index: 0, routes: [{ name: 'Onboarding' }] })} />
    </Screen>
  );
}

// 18 Giới thiệu
export function About({ navigation: nav }) {
  return (
    <Screen nav={nav} title="Giới thiệu">
      <Card style={{ alignItems: 'center' }}>
        <View style={{ width: 64, height: 64, borderRadius: 18, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center' }}><T style={{ color: '#fff', fontFamily: fonts.head, fontSize: 22 }}>TL</T></View>
        <H size={20} style={{ marginTop: 10 }}>THE LOOKS</H>
        <T style={{ color: colors.purple, fontFamily: fonts.bodySemi }}>Wear More. Buy Smarter.</T>
        <T style={{ color: colors.muted, textAlign: 'center', marginTop: 10 }}>Tủ đồ số kết hợp trợ lý AI LOOKSY: phối đồ, thử đồ 3D và hỏi ý kiến bạn bè.</T>
      </Card>
      <Row icon="📄" title="Điều khoản sử dụng" onPress={() => {}} />
      <Row icon="🔒" title="Chính sách dữ liệu cá nhân" onPress={() => {}} />
      <T style={{ textAlign: 'center', color: colors.muted, marginTop: 16, fontSize: 12 }}>Phiên bản 0.1.0 · Team 14 · EXE101</T>
    </Screen>
  );
}

// 34 Chỉnh sửa hồ sơ
export function EditProfile({ navigation: nav }) {
  return (
    <Screen nav={nav} title="Chỉnh sửa hồ sơ" footer={<Btn label="Lưu" onPress={() => nav.goBack()} />}>
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: colors.lavSoft, alignItems: 'center', justifyContent: 'center' }}><T style={{ fontSize: 38 }}>👩</T></View>
        <T style={{ color: colors.purple, marginTop: 8, fontFamily: fonts.bodySemi }}>Đổi ảnh đại diện</T>
      </View>
      <Field label="Họ và tên" defaultValue={user.name} />
      <Field label="Thành phố" defaultValue={user.city} />
      <Field label="Chiều cao (cm)" defaultValue={String(user.height)} keyboardType="numeric" />
      <Field label="Cân nặng (kg)" defaultValue={String(user.weight)} keyboardType="numeric" />
      <SectionTitle>Phong cách</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{styles.map((x, i) => <Chip key={x} label={x} active={i < 2} />)}</View>
    </Screen>
  );
}
