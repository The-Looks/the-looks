import React, { useState } from 'react';
import { View } from 'react-native';
import { Screen, T, H, Btn, Chip, Field, Steps, Tile, Brand, Card, Row } from '../../shared/ui';
import { colors, fonts } from '../../shared/theme';
import { styles, palette, items } from '../../shared/mock';

// 01 Mở đầu
export function Onboarding({ navigation: nav }) {
  return (
    <Screen scroll={false} footer={<View style={{ gap: 10 }}>
      <Btn label="Bắt đầu" onPress={() => nav.navigate('Register')} />
      <Btn kind="ghost" label="Tôi đã có tài khoản" onPress={() => nav.navigate('Login')} />
    </View>}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Brand />
        <Tile emoji="👗" h={220} w={260} tint={colors.lavSoft} style={{ marginVertical: 28 }} />
        <H size={26} style={{ textAlign: 'center' }}>Wear More.{'\n'}Buy Smarter.</H>
        <T style={{ textAlign: 'center', color: colors.muted, marginTop: 10 }}>
          Tủ đồ số thông minh cùng LOOKSY — AI phối đồ, thử đồ 3D và bạn bè chọn giúp.
        </T>
      </View>
    </Screen>
  );
}

// 19 Đăng nhập
export function Login({ navigation: nav }) {
  return (
    <Screen nav={nav} title="Đăng nhập"
      footer={<Btn label="Đăng nhập" onPress={() => nav.reset({ index: 0, routes: [{ name: 'Tabs' }] })} />}>
      <H size={24} style={{ marginBottom: 6 }}>Chào mừng trở lại 👋</H>
      <T style={{ color: colors.muted, marginBottom: 20 }}>Đăng nhập để mở tủ đồ của bạn.</T>
      <Field label="Email" placeholder="ban@email.com" keyboardType="email-address" autoCapitalize="none" />
      <Field label="Mật khẩu" placeholder="••••••••" secureTextEntry />
      <T style={{ color: colors.purple, textAlign: 'right', marginBottom: 18, fontFamily: fonts.bodySemi }}>Quên mật khẩu?</T>
      <Btn kind="outline" label="Tiếp tục với Google" onPress={() => nav.reset({ index: 0, routes: [{ name: 'Tabs' }] })} />
      <T style={{ textAlign: 'center', marginTop: 20, color: colors.muted }}>
        Chưa có tài khoản? <T style={{ color: colors.purple, fontFamily: fonts.bodySemi }} onPress={() => nav.navigate('Register')}>Đăng ký</T>
      </T>
    </Screen>
  );
}

// 20 Đăng ký
export function Register({ navigation: nav }) {
  return (
    <Screen nav={nav} title="Tạo tài khoản" footer={<Btn label="Tiếp tục" onPress={() => nav.navigate('ChooseStyle')} />}>
      <H size={24} style={{ marginBottom: 6 }}>Tạo tài khoản mới</H>
      <T style={{ color: colors.muted, marginBottom: 20 }}>Chỉ mất 1 phút để bắt đầu tủ đồ số.</T>
      <Field label="Họ và tên" placeholder="Thảo Nguyên" />
      <Field label="Email" placeholder="ban@email.com" autoCapitalize="none" />
      <Field label="Mật khẩu" placeholder="Tối thiểu 8 ký tự" secureTextEntry />
      <T style={{ color: colors.muted, fontSize: 12 }}>Bằng việc đăng ký, bạn đồng ý với Điều khoản và Chính sách dữ liệu cá nhân.</T>
    </Screen>
  );
}

// 21 Chọn phong cách (1/3)
export function ChooseStyle({ navigation: nav }) {
  const [sel, setSel] = useState(['Nữ tính']);
  const tog = (x) => setSel((p) => (p.includes(x) ? p.filter((i) => i !== x) : [...p, x]));
  return (
    <Screen nav={nav} title="Phong cách" footer={<Btn label="Tiếp tục" onPress={() => nav.navigate('ChooseColor')} />}>
      <Steps n={1} total={3} />
      <H size={22} style={{ marginBottom: 6 }}>Phong cách của bạn?</H>
      <T style={{ color: colors.muted, marginBottom: 16 }}>Chọn các phong cách bạn thích.</T>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {styles.map((x) => <Chip key={x} label={x} active={sel.includes(x)} onPress={() => tog(x)} />)}
      </View>
    </Screen>
  );
}

// 22 Chọn màu sắc (2/3, tối đa 5)
export function ChooseColor({ navigation: nav }) {
  const [sel, setSel] = useState([palette[0], palette[1]]);
  const tog = (c) => setSel((p) => (p.includes(c) ? p.filter((i) => i !== c) : p.length < 5 ? [...p, c] : p));
  return (
    <Screen nav={nav} title="Màu sắc" footer={<Btn label="Tiếp tục" onPress={() => nav.navigate('StartWardrobe')} />}>
      <Steps n={2} total={3} />
      <H size={22} style={{ marginBottom: 6 }}>Màu bạn hay mặc?</H>
      <T style={{ color: colors.muted, marginBottom: 16 }}>Chọn tối đa 5 màu ({sel.length}/5).</T>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
        {palette.map((c) => (
          <View key={c} onTouchEnd={() => tog(c)} style={{
            width: 64, height: 64, borderRadius: 32, backgroundColor: c,
            borderWidth: sel.includes(c) ? 4 : 1, borderColor: sel.includes(c) ? colors.purple : colors.line,
          }} />
        ))}
      </View>
    </Screen>
  );
}

// 23 Bắt đầu tủ đồ (3/3)
export function StartWardrobe({ navigation: nav }) {
  return (
    <Screen nav={nav} title="Tủ đồ đầu tiên"
      footer={<View style={{ gap: 10 }}>
        <Btn label="Vào ứng dụng" onPress={() => nav.reset({ index: 0, routes: [{ name: 'Tabs' }] })} />
        <Btn kind="ghost" label="Để sau" onPress={() => nav.reset({ index: 0, routes: [{ name: 'Tabs' }] })} />
      </View>}>
      <Steps n={3} total={3} />
      <H size={22} style={{ marginBottom: 6 }}>Thêm 3 món đầu tiên</H>
      <T style={{ color: colors.muted, marginBottom: 16 }}>0/3 món · Chụp ảnh hoặc chọn từ thư viện.</T>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {[0, 1, 2].map((i) => <Tile key={i} emoji="＋" h={110} style={{ flex: 1, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.lavender }} />)}
      </View>
      <Card style={{ marginTop: 18 }}>
        <Row icon="📷" title="Chụp ảnh món đồ" sub="Xem hướng dẫn chụp để AI nhận diện tốt hơn" onPress={() => nav.navigate('PhotoGuide')} />
        <Row icon="🛍️" title="Đồng bộ từ Shopee / TikTok Shop" sub="Nhập lịch sử đơn hàng" onPress={() => {}} />
      </Card>
    </Screen>
  );
}
