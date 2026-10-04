// Structural hooks for responsive.css. Studio's generated class names (sd-N) differ
// between pages, so case-page sections are identified by content instead.
(() => {
  const body = document.body;

  // Home: give each project thumbnail its real aspect ratio (encoded as s-<w>x<h> in the URL)
  if (body.classList.contains("kc-home")) {
    for (const img of document.querySelectorAll(".list-1__item__sd-1")) {
      const m = (img.getAttribute("style") || "").match(/s-(\d+)x(\d+)/);
      if (m) img.style.setProperty("--kc-ratio", `${m[1]} / ${m[2]}`);
    }
    return;
  }

  if (!body.classList.contains("kc-case")) return;
  const main = document.querySelector("main");
  if (!main) return;

  const sections = [...main.children];
  sections[0]?.classList.add("kc-case-intro");
  sections.at(-1)?.classList.add("kc-case-footer");

  const metas = [];
  for (const sec of sections.slice(1, -1)) {
    const bg = getComputedStyle(sec).backgroundColor;
    if (bg === "rgb(246, 246, 246)") metas.push(sec);
    else if (sec.querySelector("figure, h2, h3")) sec.classList.add("kc-case-body");
  }

  // Leading emoji / symbol used as a bullet, e.g. "☕️ Redesign…", "🍄 Balancing…"
  const MARK = /^\s*((?:\p{Extended_Pictographic}|\p{So})[️‍\p{Extended_Pictographic}\p{EMod}]*)\s+/u;

  for (const meta of metas) {
    const paragraphs = [...meta.querySelectorAll("p")];
    if (paragraphs.every((p) => !p.textContent.trim())) {
      meta.classList.add("kc-empty");
      continue;
    }
    meta.classList.add("kc-case-meta");

    for (const p of paragraphs) {
      const lines = p.innerHTML.split(/<br\s*\/?>/i).map((s) => s.trim()).filter(Boolean);
      const isLabel = lines.length === 1 && p.nextElementSibling?.tagName === "P";
      if (isLabel) {
        p.classList.add("kc-meta-label");
        p.parentElement.classList.add("kc-meta-group");
        continue;
      }
      p.classList.add("kc-meta-list");
      p.innerHTML = lines
        .map((html) => {
          const tmp = document.createElement("span");
          tmp.innerHTML = html;
          const m = tmp.textContent.match(MARK);
          if (!m) return `<span class="kc-li">${html}</span>`;
          const rest = html.slice(html.indexOf(m[1]) + m[1].length).replace(/^(\s|&nbsp;)+/, "");
          return `<span class="kc-li kc-li--marked"><span class="kc-li-mark">${m[1]}</span><span>${rest}</span></span>`;
        })
        .join("");
    }
  }
  metas.filter((m) => m.classList.contains("kc-case-meta")).at(-1)?.classList.add("kc-case-meta--last");
})();
