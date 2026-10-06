// Usage: node patch.js index.html
// Makes index.html.bak first, then applies the remaining Trio Constructions edits.
const fs = require("fs");
const file = process.argv[2] || "index.html";
let h = fs.readFileSync(file, "utf8");
fs.writeFileSync(file + ".bak", h);
const log = [];
const rep = (name, from, to) => {
  const hit = typeof from === "string" ? h.includes(from) : from.test(h);
  if (!hit) return log.push("MISSED  " + name);
  h = h.replace(from, () => to);
  log.push("ok      " + name);
};

// 1. move the user-chip CSS to the end of <style> so it wins over the old header rule
const css = h.match(/header \{ backdrop-filter[\s\S]*?\.usr-btn\{padding:4px\} \}/);
if (css) {
  h = h.replace(css[0], () => "");
  h = h.replace("</style>", () => "\n" + css[0] + "\n    </style>");
  log.push("ok      moved user CSS");
} else log.push("MISSED  user CSS block");

// 2. remove conflicting sidebar leftovers
rep("header left:88px", /\/\* Header adjusted for sidebar \*\/\s*header\s*\{\s*left:\s*88px;\s*\}/, "");
rep("header left:0", /header\s*\{\s*left:\s*0;\s*\}/, "");
rep(
  "old nav block",
  /nav button \{\s*flex: 1;\s*display: flex;[\s\S]*?nav button\[aria-current="page"\] \.ic \{\s*background: var\(--tonal\);\s*color: var\(--on-tonal\);\s*\}/,
  ""
);
rep("color-scheme meta", '<meta name="color-scheme" content="light" />', '<meta name="color-scheme" content="light dark" />');

// 3. end of module script: showUser wired in, login button state
rep(
  "module script end",
  /const L = document\.getElementById\("login"\);[\s\S]*?signOut\(auth\)\);/,
  `const L = byId("login");
      onAuthStateChanged(auth, (u) => {
        unsubs.forEach((f) => f());
        unsubs = [];
        partnersReady = false;
        ME = (u && u.displayName) || "";
        COLS.forEach((c) => { S[c] = []; remote[c] = {}; });
        if (u) { L.style.display = "none"; listen(); }
        else { L.style.display = "flex"; }
        showUser(u);
        render();
      });

      byId("lf").addEventListener("submit", async (e) => {
        const f = e.target, btn = f.querySelector("button[type=submit]");
        byId("le").textContent = "";
        btn.disabled = true; btn.textContent = "Signing in…";
        try {
          await signInWithEmailAndPassword(auth, f.em.value.trim(), f.pw.value);
        } catch (err) {
          byId("le").textContent = "Wrong email or password.";
        } finally {
          btn.disabled = false; btn.textContent = "Sign in";
        }
      });

      window.setName = async (n) => {
        try {
          await updateProfile(auth.currentUser, { displayName: n });
          ME = n;
          showUser(auth.currentUser);
          render();
        } catch (e) { toast("Could not save your name"); }
      };

      byId("so").addEventListener("click", () => signOut(auth));`
);

// 4. delete confirmations
rep("confirm expense", "else if (d.delex) {", 'else if (d.delex) {\n          if (!confirm("Delete this expense?")) return;');
rep("confirm meeting", "else if (d.delm) {", 'else if (d.delm) {\n          if (!confirm("Delete this meeting?")) return;');
rep("confirm generic", "else if (d.del) {", 'else if (d.del) {\n          if (!confirm("Delete this entry?")) return;');

// 5. "Saved" toast on every form
rep("toast: log form", /photos: ph\.filter\(Boolean\),\s*\}\);\s*go\(\);/, 'photos: ph.filter(Boolean),\n              });\n              toast("Saved ✓");\n              go();');
rep("toast: other forms", /go\(\);\s*\}\);\s*const fired = new Set\(\);/, 'toast("Saved ✓");\n        go();\n      });\n\n      const fired = new Set();');

fs.writeFileSync(file, h);
console.log(log.join("\n"));
console.log("\nBackup saved as " + file + ".bak");