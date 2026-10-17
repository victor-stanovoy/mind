/* mind. sound: optional soft jazz notes while you write */
(function () {
  let ctx = null;
  let last = 0;
  let step = 4;
  const BLUES = [130.81, 155.56, 174.61, 185.0, 196.0, 233.08]; // C minor blues, from C3
  const NOTES = [];
  [2, 4].forEach((m) => BLUES.forEach((f) => NOTES.push(f * m)));
  const CHORDS = [
    [146.83, 174.61, 220.0, 261.63, 329.63], // Dm9
    [130.81, 164.81, 196.0, 246.94, 293.66], // Cmaj9
    [116.54, 146.83, 174.61, 220.0], // Bbmaj7
  ];

  function ensure() {
    if (!ctx) {
      const A = window.AudioContext || window.webkitAudioContext;
      if (!A) return null;
      ctx = new A();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(f, t0, dur, vol) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    o.type = 'triangle';
    o.frequency.value = f;
    lp.type = 'lowpass';
    lp.frequency.value = 2000;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(vol, 0.0002), t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(lp);
    lp.connect(g);
    g.connect(ctx.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }

  Mind.sound = {
    key() {
      if (!Mind.settings.get('notes')) return;
      const now = performance.now();
      if (now - last < 60) return;
      last = now;
      if (!ensure()) return;
      const move = [-2, -1, -1, 0, 1, 1, 2][Math.floor(Math.random() * 7)];
      step = Math.max(0, Math.min(NOTES.length - 1, step + move));
      tone(NOTES[step], ctx.currentTime, 0.9, (Mind.settings.get('volume') / 100) * 0.14);
    },
    knot() {
      if (!Mind.settings.get('notes')) return;
      if (!ensure()) return;
      const chord = CHORDS[Math.floor(Math.random() * CHORDS.length)];
      const v = (Mind.settings.get('volume') / 100) * 0.09;
      chord.forEach((f, i) => tone(f, ctx.currentTime + i * 0.045, 1.8, v));
    },
  };
})();
