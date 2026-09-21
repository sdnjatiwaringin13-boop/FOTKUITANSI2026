import { cpSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(".");
const source = resolve(root, "public");
const out = resolve(root, "dist");

if (!existsSync(source)) throw new Error("Folder public tidak ditemukan.");
mkdirSync(out, { recursive: true });
cpSync(source, out, { recursive: true, force: true });
console.log("Build berhasil. File static disalin ke dist/");