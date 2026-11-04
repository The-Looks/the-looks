import React from 'react';
import { View, Pressable, Share } from 'react-native';
import { Screen, T, H, Btn, Chip, Card, Tile, Badge, Row, SectionTitle, Bar, Field, Toggle } from '../../../components/shared/ui';
import { colors, fonts } from '../../../services/shared/theme';
import { polls, outfits, comments } from '../../../services/shared/mock';
import { useCreateVoteDraft } from '../../../hooks/user/voting/useCreateVoteDraft';

const Result = ({ a, b }) => (
  <View style={{ gap: 10 }}>
    {[['Set A', a, colors.purple], ['Set B', b, colors.lavender]].map(([l, v, c]) => (
      <View key={l}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <T style={{ fontFamily: fonts.bodySemi }}>{l}</T><T style={{ fontFamily: fonts.bodySemi }}>{v}%</T>
        </View>
        <Bar pct={v} color={c} h={10} />
      </View>
    ))}
  </View>
);

// 10 Bình chọn
export function Vote({ navigation: nav }) {
  return (
    <Screen nav={nav} title="Bình chọn" back={false} footer={<Btn label="＋ Tạo bình chọn" onPress={() => nav.navigate('CreateVote')} />}>
      {polls.map((p) => (
        <Card key={p.id} onPress={() => nav.navigate('VoteDetail', { id: p.id })}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Badge tone={p.status === 'Đang mở' ? 'green' : 'purple'} label={p.status} />
            <T style={{ fontSize: 12, color: colors.muted }}>{p.left === 'Đã kết thúc' ? p.left : `Còn ${p.left}`}</T>
          </View>
          <H size={16} style={{ marginBottom: 10 }}>{p.title}</H>
          <Result a={p.a} b={p.b} />
          <T style={{ fontSize: 12, color: colors.muted, marginTop: 10 }}>{p.votes} lượt bình chọn</T>
        </Card>
      ))}
    </Screen>
  );
}

// 11 Tạo bình chọn
export function CreateVote({ navigation: nav }) {
  const { duration: dur, setDuration: setDur, anonymous: anon, setAnonymous: setAnon } = useCreateVoteDraft();
  return (
    <Screen nav={nav} title="Tạo bình chọn" footer={<Btn label="Tạo & lấy link" onPress={() => nav.navigate('ShareResult')} />}>
      <Field label="Câu hỏi" placeholder="Set nào hợp buổi hẹn?" />
      <T style={{ fontFamily: fonts.bodySemi, marginBottom: 10 }}>Chọn 2 outfit để bạn bè so sánh</T>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {outfits.slice(0, 2).map((o, i) => (
          <View key={o.id} style={{ flex: 1 }}>
            <Tile emoji={o.emojis[0]} tint={o.tint} h={140} />
            <T style={{ fontFamily: fonts.bodySemi, marginTop: 6 }}>Set {i ? 'B' : 'A'}</T>
            <T style={{ fontSize: 12, color: colors.muted }} numberOfLines={1}>{o.name}</T>
          </View>
        ))}
      </View>
      <SectionTitle>Thời hạn</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{['8 giờ', '24 giờ', '3 ngày'].map((d) => <Chip key={d} label={d} active={dur === d} onPress={() => setDur(d)} />)}</View>
      <Row icon="🕶️" title="Bình chọn ẩn danh" sub="Bạn bè không cần đăng nhập" right={<Toggle value={anon} onValueChange={setAnon} />} />
    </Screen>
  );
}

// 12 Chia sẻ kết quả / link
export function ShareResult({ navigation: nav }) {
  const link = 'thelooks.vn/v/abc123';
  return (
    <Screen nav={nav} title="Chia sẻ" footer={<View style={{ gap: 10 }}>
      <Btn label="Chia sẻ link" onPress={() => Share.share({ message: `Chọn giúp mình outfit nhé 💜 https://${link}` }).catch(() => {})} />
      <Btn kind="ghost" label="Xem kết quả" onPress={() => nav.navigate('VoteDetail', { id: 1 })} /></View>}>
      <Card style={{ alignItems: 'center' }}>
        <T style={{ fontSize: 40 }}>🎉</T>
        <H size={18} style={{ marginTop: 6 }}>Bình chọn đã sẵn sàng</H>
        <T style={{ color: colors.muted, textAlign: 'center', marginTop: 4 }}>Gửi link cho bạn bè qua Zalo, Messenger…</T>
        <View style={{ backgroundColor: colors.lavSoft, padding: 12, borderRadius: 12, marginTop: 14, alignSelf: 'stretch' }}>
          <T style={{ color: colors.purple, textAlign: 'center', fontFamily: fonts.bodySemi }}>{link}</T>
        </View>
      </Card>
      <SectionTitle>Xem trước trang bình chọn</SectionTitle>
      <Card>
        <T style={{ fontSize: 12, color: colors.muted }}>THE LOOKS</T>
        <H size={16}>Thảo Nguyên mời bạn chọn outfit</H>
        <T style={{ color: colors.muted, marginTop: 4 }}>Set nào hợp buổi hẹn? · Còn 8 giờ</T>
      </Card>
    </Screen>
  );
}

// 13 Người bình chọn
export function Voters({ navigation: nav }) {
  const rows = [['Lan Anh', 'Set A'], ['Minh Châu', 'Set B'], ['Hà My', 'Set A'], ['Ẩn danh', 'Set A'], ['Ẩn danh', 'Set B']];
  return (
    <Screen nav={nav} title="Người bình chọn">
      <T style={{ color: colors.muted, marginBottom: 10 }}>18 lượt bình chọn</T>
      {rows.map(([n, c], i) => <Row key={i} icon="👤" title={n} right={<Badge tone={c === 'Set A' ? 'purple' : 'pink'} label={c} />} />)}
    </Screen>
  );
}

// 32 Chi tiết bình chọn
export function VoteDetail({ navigation: nav, route }) {
  const p = polls.find((x) => x.id === route.params?.id) || polls[0];
  return (
    <Screen nav={nav} title="Chi tiết bình chọn" footer={<View style={{ flexDirection: 'row', gap: 10 }}>
      <Btn style={{ flex: 1 }} kind="ghost" label="Bình luận" onPress={() => nav.navigate('Comments')} />
      <Btn style={{ flex: 1 }} label="Chia sẻ" onPress={() => nav.navigate('ShareResult')} /></View>}>
      <H size={20}>{p.title}</H>
      <T style={{ color: colors.muted, marginVertical: 6 }}>{p.votes} lượt · {p.left === 'Đã kết thúc' ? p.left : `Còn ${p.left}`}</T>
      <View style={{ flexDirection: 'row', gap: 12, marginVertical: 12 }}>
        {outfits.slice(0, 2).map((o, i) => <View key={o.id} style={{ flex: 1 }}><Tile emoji={o.emojis[0]} tint={o.tint} h={150} /><T style={{ textAlign: 'center', marginTop: 6, fontFamily: fonts.bodySemi }}>Set {i ? 'B' : 'A'}</T></View>)}
      </View>
      <Card><Result a={p.a} b={p.b} /></Card>
      <Row icon="👥" title="Người bình chọn" sub={`${p.votes} người`} onPress={() => nav.navigate('Voters')} />
      <Row icon="💬" title="Bình luận" sub={`${comments.length} bình luận`} onPress={() => nav.navigate('Comments')} />
    </Screen>
  );
}

// 33 Bình luận
export function Comments({ navigation: nav }) {
  return (
    <Screen nav={nav} title="Bình luận">
      {comments.map((c) => (
        <Card key={c.id}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <T style={{ fontFamily: fonts.bodySemi }}>{c.who}</T><T style={{ fontSize: 12, color: colors.muted }}>{c.time}</T>
          </View>
          <T style={{ marginTop: 6 }}>{c.text}</T>
        </Card>
      ))}
      <Field placeholder="Viết phản hồi…" />
    </Screen>
  );
}
