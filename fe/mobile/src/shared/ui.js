import React from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Switch as RNSwitch, StyleSheet } from 'react-native';
import { colors, fonts, radius } from './theme';

export const T = ({ style, children, ...p }) => (
  <Text {...p} style={[{ fontFamily: fonts.body, color: colors.ink, fontSize: 14 }, style]}>{children}</Text>
);
export const H = ({ style, children, size = 22 }) => (
  <Text style={[{ fontFamily: fonts.head, color: colors.ink, fontSize: size }, style]}>{children}</Text>
);

/* Screen with optional header + scroll */
export function Screen({ nav, title, back = true, right, children, scroll = true, footer, pad = true }) {
  const Body = scroll ? ScrollView : View;
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {title !== undefined && (
        <View style={s.header}>
          <Pressable onPress={() => nav?.canGoBack() && nav.goBack()} style={{ width: 40 }}>
            {back && nav?.canGoBack() ? <T style={{ fontSize: 22 }}>‹</T> : null}
          </Pressable>
          <H size={17} style={{ flex: 1, textAlign: 'center' }}>{title}</H>
          <View style={{ width: 40, alignItems: 'flex-end' }}>{right}</View>
        </View>
      )}
      <Body style={{ flex: 1 }} contentContainerStyle={scroll ? { padding: pad ? 16 : 0, paddingBottom: 24 } : undefined}
        {...(!scroll ? { } : { showsVerticalScrollIndicator: false })}>
        {children}
      </Body>
      {footer ? <View style={s.footer}>{footer}</View> : null}
    </View>
  );
}

export const Btn = ({ label, onPress, kind = 'primary', style, small }) => (
  <Pressable onPress={onPress} style={[
    s.btn, small && { paddingVertical: 8, paddingHorizontal: 14 },
    kind === 'primary' && { backgroundColor: colors.purple },
    kind === 'ghost' && { backgroundColor: colors.lavSoft },
    kind === 'outline' && { borderWidth: 1.5, borderColor: colors.purple, backgroundColor: 'transparent' },
    kind === 'pink' && { backgroundColor: colors.pink },
    style]}>
    <T style={{ fontFamily: fonts.bodySemi, color: kind === 'primary' || kind === 'pink' ? '#fff' : colors.purple, fontSize: small ? 13 : 15 }}>{label}</T>
  </Pressable>
);

export const Chip = ({ label, active, onPress, style }) => (
  <Pressable onPress={onPress} style={[s.chip, active && { backgroundColor: colors.purple, borderColor: colors.purple }, style]}>
    <T style={{ fontSize: 13, fontFamily: fonts.bodySemi, color: active ? '#fff' : colors.ink }}>{label}</T>
  </Pressable>
);

export const Card = ({ children, style, onPress }) => {
  const C = onPress ? Pressable : View;
  return <C onPress={onPress} style={[s.card, style]}>{children}</C>;
};

export const Badge = ({ label, tone = 'purple' }) => {
  const m = { purple: [colors.lavSoft, colors.purple], green: ['#E3F3EC', colors.green], amber: ['#FBEFD9', colors.amber], pink: ['#FBE4EA', colors.pink] }[tone];
  return <View style={{ backgroundColor: m[0], paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, alignSelf: 'flex-start' }}>
    <T style={{ color: m[1], fontSize: 11, fontFamily: fonts.bodySemi }}>{label}</T></View>;
};

/* Placeholder for photos (Figma images could not be downloaded) */
export const Tile = ({ emoji = '👚', tint = colors.lavSoft, h = 110, w, style, label }) => (
  <View style={[{ backgroundColor: tint, height: h, width: w, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' }, style]}>
    <Text style={{ fontSize: h > 90 ? 38 : 24 }}>{emoji}</Text>
    {label ? <T style={{ fontSize: 11, color: colors.muted, marginTop: 4 }}>{label}</T> : null}
  </View>
);

export const Field = ({ label, ...p }) => (
  <View style={{ marginBottom: 12 }}>
    {label ? <T style={{ fontSize: 12, color: colors.muted, marginBottom: 6, fontFamily: fonts.bodySemi }}>{label}</T> : null}
    <TextInput placeholderTextColor="#A99FB3" {...p} style={s.input} />
  </View>
);

export const Row = ({ icon, title, sub, right, onPress, danger }) => (
  <Pressable onPress={onPress} style={s.row}>
    {icon ? <View style={s.rowIcon}><Text style={{ fontSize: 16 }}>{icon}</Text></View> : null}
    <View style={{ flex: 1 }}>
      <T style={{ fontFamily: fonts.bodySemi, color: danger ? colors.pink : colors.ink }}>{title}</T>
      {sub ? <T style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>{sub}</T> : null}
    </View>
    {right ?? (onPress ? <T style={{ color: colors.muted, fontSize: 18 }}>›</T> : null)}
  </Pressable>
);

export const Toggle = ({ value, onValueChange }) => (
  <RNSwitch value={value} onValueChange={onValueChange} trackColor={{ true: colors.purple, false: '#D9D0E2' }} thumbColor="#fff" />
);

export const SectionTitle = ({ children, action, onAction }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, marginBottom: 10 }}>
    <H size={16}>{children}</H>
    {action ? <Pressable onPress={onAction}><T style={{ color: colors.purple, fontFamily: fonts.bodySemi, fontSize: 13 }}>{action}</T></Pressable> : null}
  </View>
);

export const Bar = ({ pct, color = colors.purple, h = 8 }) => (
  <View style={{ height: h, backgroundColor: colors.lavSoft, borderRadius: 99, overflow: 'hidden' }}>
    <View style={{ width: `${pct}%`, height: h, backgroundColor: color, borderRadius: 99 }} />
  </View>
);

export const Steps = ({ n, total }) => (
  <View style={{ flexDirection: 'row', gap: 6, marginBottom: 16 }}>
    {Array.from({ length: total }).map((_, i) => (
      <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < n ? colors.purple : colors.line }} />
    ))}
  </View>
);

export const Brand = () => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
    <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center' }}>
      <T style={{ color: '#fff', fontFamily: fonts.head, fontSize: 12 }}>TL</T>
    </View>
    <H size={15}>THE LOOKS</H>
  </View>
);

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 14, paddingBottom: 10, backgroundColor: colors.bg },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.bg },
  btn: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  chip: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.line, backgroundColor: '#fff', marginRight: 8, marginBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: radius.lg, padding: 14, borderWidth: 1, borderColor: colors.line, marginBottom: 12 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12, fontFamily: fonts.body, fontSize: 14, color: colors.ink },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 13, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: colors.line },
  rowIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.lavSoft, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
});
