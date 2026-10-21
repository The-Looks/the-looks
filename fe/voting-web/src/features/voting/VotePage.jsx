import { useState } from 'react';

const SETS = [
  { id: 'A', name: 'Set A', desc: 'Sơ mi croptop + chân váy xếp ly', emojis: ['👚', '👗', '👟'], tint: '#F7D9DD' },
  { id: 'B', name: 'Set B', desc: 'Blazer pastel + quần jean rộng', emojis: ['🧥', '👖', '👟'], tint: '#E4D5F7' },
];
const RESULT = { A: 67, B: 33 };
const STEPS = ['Xem 2 set đồ', 'Chọn set bạn thích', 'Gửi bình chọn'];

export default function App() {
  const [pick, setPick] = useState(null);
  const [sent, setSent] = useState(false);

  return (
    <div className="page">
      <header className="top">
        <div className="brand"><span className="logo">TL</span><b>THE LOOKS</b></div>
        <span className="tag">Bình chọn cùng bạn bè</span>
      </header>

      <main className="wrap">
        <section className="hero">
          <p className="eyebrow">Thảo Nguyên mời bạn chọn outfit</p>
          <h1>Set nào hợp buổi hẹn?</h1>
          <p className="sub">Bạn bè chọn giúp. Bạn tự tin diện đẹp.</p>
          <div className="meta"><span className="pill">🕶️ Bình chọn ẩn danh</span><span className="pill warn">⏳ Còn 8 giờ để chọn</span></div>
        </section>

        <ol className="steps">
          {STEPS.map((s, i) => (
            <li key={s} className={(sent ? 3 : pick ? 2 : 1) > i ? 'on' : ''}><span>{i + 1}</span>{s}</li>
          ))}
        </ol>

        <div className="sets">
          {SETS.map((s) => {
            const active = pick === s.id;
            return (
              <button key={s.id} className={'set' + (active ? ' active' : '')} disabled={sent} onClick={() => setPick(s.id)}>
                <div className="photo" style={{ background: s.tint }}>
                  {s.emojis.map((e, i) => <span key={i}>{e}</span>)}
                </div>
                <div className="info">
                  <h3>{s.name}</h3>
                  <p>{s.desc}</p>
                  {sent ? (
                    <div className="res">
                      <div className="bar"><i style={{ width: RESULT[s.id] + '%' }} /></div>
                      <b>{RESULT[s.id]}%</b>
                    </div>
                  ) : (
                    <span className={'radio' + (active ? ' on' : '')}>{active ? '✓ Đã chọn' : 'Chọn set này'}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="cta">
          {!sent ? (
            <>
              <button className="send" disabled={!pick} onClick={() => setSent(true)}>Gửi bình chọn</button>
              <p className="hint">Kết quả hiện sau khi bạn gửi phiếu.</p>
            </>
          ) : (
            <div className="done">
              <h2>Đã ghi nhận lựa chọn của bạn 💜</h2>
              <p>Bạn chọn <b>Set {pick}</b> · Set A {RESULT.A}% / Set B {RESULT.B}%</p>
              <a className="send alt" href="#" onClick={(e) => e.preventDefault()}>Tạo tủ đồ của riêng bạn</a>
            </div>
          )}
        </div>
      </main>
      <footer className="foot">Wear More. Buy Smarter. · THE LOOKS</footer>
    </div>
  );
}
