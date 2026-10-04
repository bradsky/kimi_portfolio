// Home hero greeting: the 👋 waves in place while "Hi / This is KIMI" is typed out,
// erased in reverse, retyped in Japanese, erased again, and so on.
(() => {
  const LANGS = [
    { ja: false, hi: "Hi", prefix: "This is ", name: "KIMI", suffix: "", speed: 85 },
    { ja: true, hi: "こんにちは", prefix: "", name: "KIMI", suffix: "です", speed: 150 },
  ];
  const ERASE_SPEED = 40;
  const LINE_PAUSE = 250;
  const HOLD = 3500;
  const GAP = 500;
  const START_DELAY = 800;

  const block = document.querySelector(".sd-8 .sd-10");
  const hiLine = block?.querySelector(".sd-11");
  const h1 = block?.querySelector(".sd-13");
  const link = block?.querySelector(".sd-14");
  if (!hiLine || !h1 || !link) return;

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const seg = (cls, tag = "span") => {
    const el = document.createElement(tag);
    el.className = `kc-seg ${cls}`;
    el.setAttribute("aria-hidden", "true");
    return el;
  };

  // 👋🏻 → its own element so it can wave
  const wave = document.createElement("span");
  wave.className = "kc-wave";
  wave.setAttribute("aria-hidden", "true");
  wave.textContent = "👋🏻";

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    hiLine.replaceChildren(wave, "Hi");
    return;
  }

  const hi = seg("kc-hi");
  const prefix = seg("kc-prefix");
  const name = seg("kc-name");
  const suffix = seg(`${h1.className} kc-suffix`);
  const sr = document.createElement("span");
  sr.className = "kc-sr";
  sr.textContent = "Hi, this is KIMI";

  hiLine.replaceChildren(wave, hi);
  h1.replaceChildren(sr, prefix);
  link.replaceChildren(name);
  link.setAttribute("aria-label", "KIMI");
  // keep "KIMI" + "です" on one line even where the row stacks vertically (mobile)
  const nameRow = document.createElement("span");
  nameRow.className = "kc-name-row";
  link.before(nameRow);
  nameRow.append(link, suffix);

  const caret = document.createElement("span");
  caret.className = "kc-caret";
  caret.setAttribute("aria-hidden", "true");
  hi.after(caret);

  // Reserve the height of the tallest language so the intro paragraph below never jumps.
  const segs = { hi, prefix, name, suffix };
  const reserveHeight = () => {
    block.style.minHeight = "";
    let max = 0;
    for (const lang of LANGS) {
      const clone = block.cloneNode(true);
      clone.classList.add("kc-measure");
      clone.classList.toggle("kc-ja", lang.ja);
      clone.style.width = `${block.offsetWidth}px`;
      for (const key of Object.keys(segs)) {
        clone.querySelector(`.kc-${key}`).textContent = lang[key];
      }
      block.parentElement.appendChild(clone);
      max = Math.max(max, clone.offsetHeight);
      clone.remove();
    }
    block.style.minHeight = `${max}px`;
  };
  let resizeTimer;
  addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(reserveHeight, 150);
  });

  // the caret is a sibling of the segment, so copy the segment's size (the suffix sits in a 16px flex row)
  const moveCaret = (el) => {
    caret.style.fontSize = getComputedStyle(el).fontSize;
    el.after(caret);
  };
  const type = async (el, text, speed) => {
    moveCaret(el);
    for (const ch of Array.from(text)) {
      el.textContent += ch;
      await sleep(speed);
    }
  };
  const erase = async (el) => {
    moveCaret(el);
    const chars = Array.from(el.textContent);
    while (chars.length) {
      chars.pop();
      el.textContent = chars.join("");
      await sleep(ERASE_SPEED);
    }
  };

  const run = async () => {
    const jaText = LANGS.filter((l) => l.ja).map((l) => l.hi + l.suffix).join("");
    await Promise.all(
      ["300", "400", "700"].map((w) => document.fonts.load(`${w} 1em "Noto Sans JP"`, jaText).catch(() => {}))
    );
    await document.fonts.ready;
    reserveHeight();
    await sleep(START_DELAY);
    for (let i = 0; ; i++) {
      const lang = LANGS[i % LANGS.length];
      block.classList.toggle("kc-ja", lang.ja);

      block.classList.add("kc-typing");
      await type(hi, lang.hi, lang.speed);
      await sleep(LINE_PAUSE);
      await type(prefix, lang.prefix, lang.speed);
      await type(name, lang.name, lang.speed);
      await type(suffix, lang.suffix, lang.speed);
      block.classList.remove("kc-typing");
      await sleep(HOLD);

      block.classList.add("kc-typing");
      await erase(suffix);
      await erase(name);
      await erase(prefix);
      await sleep(LINE_PAUSE);
      await erase(hi);
      block.classList.remove("kc-typing");
      await sleep(GAP);
    }
  };

  if (document.readyState === "complete") run();
  else addEventListener("load", run, { once: true });
})();
