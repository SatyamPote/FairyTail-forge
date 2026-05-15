#!/usr/bin/env node
import { readFileSync, statSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

const ROOT = process.cwd();

const FORBIDDEN_PACKAGES = [
  "openai",
  "@anthropic-ai/sdk",
  "anthropic",
  "@google/genai",
  "@google/generative-ai",
  "@google-ai/generativelanguage",
  "replicate",
  "stability-client",
  "@stability/sdk",
  "@huggingface/inference",
  "stripe",
  "@stripe/stripe-js",
  "react-native-purchases",
  "@revenuecat/purchases-js",
  "@clerk/clerk-sdk-node",
  "@clerk/clerk-react",
  "@clerk/nextjs",
  "@clerk/clerk-expo",
  "firebase",
  "firebase-admin",
  "@firebase/auth",
  "@supabase/supabase-js",
  "@supabase/auth-helpers-react",
  "@supabase/ssr",
];

const FORBIDDEN_DOMAINS = [
  "api.openai.com",
  "api.anthropic.com",
  "generativelanguage.googleapis.com",
  "api.replicate.com",
  "api.stability.ai",
  "api-inference.huggingface.co",
  "api.stripe.com",
  "api.revenuecat.com",
  "clerk.com",
  "clerk.dev",
  "firebaseio.com",
  "supabase.co",
];

const SECRET_PATTERNS = [
  { name: "OpenAI key", re: /sk-[A-Za-z0-9]{20,}/ },
  { name: "Anthropic key", re: /sk-ant-[A-Za-z0-9_\-]{20,}/ },
  { name: "Stripe live key", re: /sk_live_[A-Za-z0-9]{20,}/ },
  { name: "Hardcoded Bearer token", re: /Bearer\s+[A-Za-z0-9._\-]{20,}/ },
];

const SCAN_GLOBS = [
  "artifacts",
  "lib",
  "scripts",
  "package.json",
  "pnpm-workspace.yaml",
];

function listFiles() {
  const cmd = `git ls-files -- ${SCAN_GLOBS.join(" ")}`;
  const out = execSync(cmd, { cwd: ROOT, encoding: "utf8" });
  return out
    .split("\n")
    .filter(Boolean)
    .filter((f) => !f.includes("node_modules"))
    .filter((f) => !f.endsWith(".lock") && !f.endsWith("pnpm-lock.yaml"))
    .filter((f) => {
      try {
        const s = statSync(path.join(ROOT, f));
        return s.isFile() && s.size < 1_000_000;
      } catch {
        return false;
      }
    });
}

const violations = [];
const warnings = [];

function check(file) {
  const abs = path.join(ROOT, file);
  let text;
  try {
    text = readFileSync(abs, "utf8");
  } catch {
    return;
  }

  if (file.endsWith("package.json")) {
    let pkg;
    try {
      pkg = JSON.parse(text);
    } catch {
      return;
    }
    const deps = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {}),
      ...(pkg.peerDependencies || {}),
      ...(pkg.optionalDependencies || {}),
    };
    for (const name of Object.keys(deps)) {
      if (FORBIDDEN_PACKAGES.includes(name)) {
        violations.push(`${file}: forbidden dependency "${name}"`);
      }
    }
    return;
  }

  for (const pkg of FORBIDDEN_PACKAGES) {
    const re = new RegExp(
      `(?:from|require\\()\\s*['"\`]${pkg.replace(/[/\-]/g, "\\$&")}(?:/[^'"\`]*)?['"\`]`
    );
    if (re.test(text)) {
      violations.push(`${file}: imports forbidden package "${pkg}"`);
    }
  }

  for (const domain of FORBIDDEN_DOMAINS) {
    if (text.includes(domain)) {
      violations.push(`${file}: references forbidden domain "${domain}"`);
    }
  }

  for (const { name, re } of SECRET_PATTERNS) {
    if (re.test(text)) {
      violations.push(`${file}: contains hardcoded ${name}`);
    }
  }

  if (/process\.env\.[A-Z_]*API_KEY/.test(text)) {
    warnings.push(
      `${file}: references *_API_KEY env var — confirm it's optional/local-only`
    );
  }
}

const files = listFiles();
for (const f of files) check(f);

if (warnings.length) {
  console.warn("\nWARNINGS (review manually):");
  for (const w of warnings) console.warn("  - " + w);
}

if (violations.length) {
  console.error("\nOFFLINE-FIRST POLICY VIOLATIONS:");
  for (const v of violations) console.error("  - " + v);
  console.error(
    `\nFAILED: ${violations.length} violation(s). FairyTail Forge must remain fully local — no cloud AI, payments, or auth SDKs.`
  );
  process.exit(1);
}

console.log(
  `\nOK — scanned ${files.length} files. No forbidden cloud SDKs, domains, or secrets found.`
);
