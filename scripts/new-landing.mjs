import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const EXCLUDES = new Set(["node_modules", ".next", "out"]);

async function copyTemplate(srcDir, destDir) {
  // Node >=16.7 has fs.cp
  await fs.cp(srcDir, destDir, {
    recursive: true,
    filter: (src) => {
      const name = path.basename(src);
      if (EXCLUDES.has(name)) return false;
      return true;
    }
  });
}

async function replaceInFile(filePath, replacements) {
  try {
    let content = await fs.readFile(filePath, "utf8");
    for (const [needle, replacement] of replacements) {
      content = content.replace(needle, replacement);
    }
    await fs.writeFile(filePath, content, "utf8");
  } catch (e) {
    // Ignore binary files or missing files
  }
}

async function main() {
  const nameArg = process.argv[2];
  if (!nameArg) {
    console.error("Uso: pnpm new <nombre-de-landing>");
    process.exit(1);
  }

  const appName = nameArg.replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase();
  const appTitle = process.env.APP_TITLE ?? "Nueva Landing";

  const src = path.join(__dirname, "..", "apps", "_template");
  const dest = path.join(__dirname, "..", "apps", appName);

  // Guardas
  try {
    const stat = await fs.stat(dest);
    if (stat.isDirectory()) {
      console.error(`La carpeta apps/${appName} ya existe. Borra o usa otro nombre.`);
      process.exit(1);
    }
  } catch {}

  await copyTemplate(src, dest);

  // Ajustar package.json
  const pkgPath = path.join(dest, "package.json");
  try {
    const raw = await fs.readFile(pkgPath, "utf8");
    const pkg = JSON.parse(raw);
    pkg.name = appName;
    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2), "utf8");
  } catch (e) {
    console.warn("No se pudo actualizar package.json:", e?.message);
  }

  // Ajustar título en layout.tsx (metadata.title)
  const layoutPath = path.join(dest, "src", "app", "layout.tsx");
  await replaceInFile(layoutPath, [
    [/title:\s*"(?:Template Landing|Nueva Landing)"/g, `title: "${appTitle}"`]
  ]);

  console.log(`✅ Creado apps/${appName}`);
  console.log(`   Título: ${appTitle}`);
  console.log("Ejecuta:");
  console.log(`  pnpm dev --filter ${appName}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});