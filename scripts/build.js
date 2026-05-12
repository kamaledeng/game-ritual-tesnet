const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const files = ["index.html", "styles.css", "app.js"];
const assetSource = path.join(root, "assets");
const assetTarget = path.join(dist, "assets");

if (!dist.startsWith(root)) {
  throw new Error("Refusing to write outside project root.");
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

for (const file of files) {
  fs.copyFileSync(path.join(root, file), path.join(dist, file));
}

if (fs.existsSync(assetSource)) {
  fs.cpSync(assetSource, assetTarget, { recursive: true });
}

console.log(`Built ${files.length} static files into dist`);
