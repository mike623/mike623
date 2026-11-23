#!/usr/bin/env node
/**
 * PS1 Biohazard / Resident Evil CRT SVG Generator for GitHub Profile README
 * Zero external dependencies — renders embedded pixel-bitmap SVG paths + PS1 CRT Soft filter.
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const USERNAME = process.env.GITHUB_USERNAME || "mike623";
const OUT_DIR = path.resolve("assets");

// ============================================================================
// Customizable Profile Config
// ============================================================================
const CONFIG = {
  portraitName: "MIKE",
  equip: {
    badge: "TS",
    color: "#2563eb",
    name: "TypeScript",
    sub: "Full-Stack",
    ammo: "INF",
  },
  dialogLine1: "\"Full-stack developer crafting fast UIs & reliable systems.",
  dialogLine2: " Always equipped with TypeScript, Go, and a fresh Green Herb.\"",
  // First 6 inventory slots (curated core loadout). Slots 7 & 8 are Ink Ribbon (live commits) & Green Herb.
  inventorySlots: [
    { name: "TypeScript", tag: "Primary", qty: "MAIN", badge: "TS", color: "#2563eb", selected: true },
    { name: "React/Vue", tag: "Frontend", qty: "UI", badge: "UI", color: "#0891b2" },
    { name: "Go / Node", tag: "Backend", qty: "API", badge: "GO", color: "#0284c7" },
    { name: "Docker/K8s", tag: "Cloud Ops", qty: "OPS", badge: "K8", color: "#4f46e5" },
    { name: "Flutter", tag: "Mobile", qty: "APP", badge: "FL", color: "#7c3aed" },
    { name: "QA/Figma", tag: "Craft", qty: "x99", badge: "QA", color: "#db2777" },
  ],
  radioLinks: [
    { id: "linkedin", label: "LINKEDIN", freq: "102.4" },
    { id: "codepen", label: "CODEPEN", freq: "98.7" },
    { id: "leetcode", label: "LEETCODE", freq: "88.1" },
    { id: "web", label: "NAMIKE.ME", freq: "77.0" },
  ],
};

// ============================================================================
// Crisp 5x7 Bitmap Pixel Font (Zero external fonts — 100% consistent on GitHub)
// ============================================================================
const FONT_5X7 = {
  " ": ["00000","00000","00000","00000","00000","00000","00000"],
  "A": ["01110","10001","10001","11111","10001","10001","10001"],
  "B": ["11110","10001","10001","11110","10001","10001","11110"],
  "C": ["01110","10001","10000","10000","10000","10001","01110"],
  "D": ["11110","10001","10001","10001","10001","10001","11110"],
  "E": ["11111","10000","10000","11110","10000","10000","11111"],
  "F": ["11111","10000","10000","11110","10000","10000","10000"],
  "G": ["01110","10001","10000","10111","10001","10001","01111"],
  "H": ["10001","10001","10001","11111","10001","10001","10001"],
  "I": ["01110","00100","00100","00100","00100","00100","01110"],
  "J": ["00111","00010","00010","00010","10010","10010","01100"],
  "K": ["10001","10010","10100","11000","10100","10010","10001"],
  "L": ["10000","10000","10000","10000","10000","10000","11111"],
  "M": ["10001","11011","10101","10101","10001","10001","10001"],
  "N": ["10001","11001","10101","10011","10001","10001","10001"],
  "O": ["01110","10001","10001","10001","10001","10001","01110"],
  "P": ["11110","10001","10001","11110","10000","10000","10000"],
  "Q": ["01110","10001","10001","10001","10101","10010","01101"],
  "R": ["11110","10001","10001","11110","10100","10010","10001"],
  "S": ["01111","10000","10000","01110","00001","00001","11110"],
  "T": ["11111","00100","00100","00100","00100","00100","00100"],
  "U": ["10001","10001","10001","10001","10001","10001","01110"],
  "V": ["10001","10001","10001","10001","10001","01010","00100"],
  "W": ["10001","10001","10001","10101","10101","11011","10001"],
  "X": ["10001","10001","01010","00100","01010","10001","10001"],
  "Y": ["10001","10001","01010","00100","00100","00100","00100"],
  "Z": ["11111","00001","00010","00100","01000","10000","11111"],
  "a": ["00000","00000","01110","00001","01111","10001","01111"],
  "b": ["10000","10000","11110","10001","10001","10001","11110"],
  "c": ["00000","00000","01110","10001","10000","10001","01110"],
  "d": ["00001","00001","01111","10001","10001","10001","01111"],
  "e": ["00000","00000","01110","10001","11111","10000","01110"],
  "f": ["00110","01001","01000","11100","01000","01000","01000"],
  "g": ["00000","01111","10001","10001","01111","00001","01110"],
  "h": ["10000","10000","11110","10001","10001","10001","10001"],
  "i": ["00100","00000","01100","00100","00100","00100","01110"],
  "j": ["00010","00000","00110","00010","00010","10010","01100"],
  "k": ["10000","10000","10010","10100","11000","10100","10010"],
  "l": ["01100","00100","00100","00100","00100","00100","01110"],
  "m": ["00000","00000","11010","10101","10101","10001","10001"],
  "n": ["00000","00000","11110","10001","10001","10001","10001"],
  "o": ["00000","00000","01110","10001","10001","10001","01110"],
  "p": ["00000","11110","10001","10001","11110","10000","10000"],
  "q": ["00000","01111","10001","10001","01111","00001","00001"],
  "r": ["00000","00000","10110","11001","10000","10000","10000"],
  "s": ["00000","00000","01111","10000","01110","00001","11110"],
  "t": ["01000","01000","11100","01000","01000","01001","00110"],
  "u": ["00000","00000","10001","10001","10001","10011","01101"],
  "v": ["00000","00000","10001","10001","10001","01010","00100"],
  "w": ["00000","00000","10001","10001","10101","10101","01010"],
  "x": ["00000","00000","10001","01010","00100","01010","10001"],
  "y": ["00000","10001","10001","10001","01111","00001","01110"],
  "z": ["00000","00000","11111","00010","00100","01000","11111"],
  "0": ["01110","10001","10011","10101","11001","10001","01110"],
  "1": ["00100","01100","00100","00100","00100","00100","01110"],
  "2": ["01110","10001","00001","00110","01000","10000","11111"],
  "3": ["11110","00001","00001","01110","00001","00001","11110"],
  "4": ["00010","00110","01010","10010","11111","00010","00010"],
  "5": ["11111","10000","11110","00001","00001","10001","01110"],
  "6": ["01110","10000","10000","11110","10001","10001","01110"],
  "7": ["11111","00001","00010","00100","01000","01000","01000"],
  "8": ["01110","10001","10001","01110","10001","10001","01110"],
  "9": ["01110","10001","10001","01111","00001","00001","01110"],
  ".": ["00000","00000","00000","00000","00000","01100","01100"],
  ",": ["00000","00000","00000","00000","00100","00100","01000"],
  ":": ["00000","00100","00100","00000","00100","00100","00000"],
  ";": ["00000","00100","00100","00000","00100","00100","01000"],
  "!": ["00100","00100","00100","00100","00100","00000","00100"],
  "?": ["01110","10001","00001","00110","00100","00000","00100"],
  "-": ["00000","00000","00000","11111","00000","00000","00000"],
  "_": ["00000","00000","00000","00000","00000","00000","11111"],
  "+": ["00000","00100","00100","11111","00100","00100","00000"],
  "/": ["00001","00010","00010","00100","01000","01000","10000"],
  "&": ["01100","10010","10100","01000","10101","10010","01101"],
  "%": ["11001","11010","00010","00100","01000","01011","10011"],
  "#": ["01010","01010","11111","01010","11111","01010","01010"],
  "\"": ["01010","01010","00000","00000","00000","00000","00000"],
  "'": ["00100","00100","00000","00000","00000","00000","00000"],
  "(": ["00010","00100","01000","01000","01000","00100","00010"],
  ")": ["01000","00100","00010","00010","00010","00100","01000"],
  "·": ["00000","00000","00000","00110","00110","00000","00000"],
  "∞": ["00000","01010","10101","10101","01010","00000","00000"],
  "▼": ["00000","11111","11111","01110","01110","00100","00000"],
  "↗": ["00111","00011","00101","01001","10000","00000","00000"],
};

function measurePixelText(text, sx = 2, gap = 1) {
  const chars = [...text];
  if (!chars.length) return 0;
  return chars.length * (5 + gap) * sx - gap * sx;
}

let pathSeq = 0;

/**
 * Renders crisp merged pixel bitmap rectangles as a single reusable SVG <path>.
 * Uses <use href="#..."/> for shadow & PS1 RGB chroma so SVGs stay compact.
 */
function pxText(text, x, y, opts = {}) {
  const {
    sx = 2,
    sy = 2,
    gap = 1,
    fill = "#f8fafc",
    align = "left",
    shadow = true,
    chroma = false,
  } = opts;

  const w = measurePixelText(text, sx, gap);
  const startX = align === "center" ? x - w / 2 : align === "right" ? x - w : x;
  const stepX = (5 + gap) * sx;
  const parts = [];

  [...text].forEach((ch, ci) => {
    const glyph = FONT_5X7[ch] || FONT_5X7[ch.toUpperCase()] || FONT_5X7[" "];
    const gx = startX + ci * stepX;
    for (let r = 0; r < 7; r++) {
      const row = glyph[r];
      let c = 0;
      while (c < 5) {
        if (row[c] === "1") {
          let run = 1;
          while (c + run < 5 && row[c + run] === "1") run++;
          const rx = +(gx + c * sx).toFixed(2);
          const ry = +(y + r * sy).toFixed(2);
          const rw = +(run * sx).toFixed(2);
          const rh = +sy.toFixed(2);
          parts.push(`M${rx} ${ry}h${rw}v${rh}h-${rw}z`);
          c += run;
        } else {
          c++;
        }
      }
    }
  });

  if (!parts.length) return "";
  const d = parts.join("");
  if (!shadow && !chroma) {
    return `<path d="${d}" fill="${fill}"/>`;
  }
  const id = `pt${++pathSeq}`;
  let out = `<defs><path id="${id}" d="${d}"/></defs>`;
  if (shadow) {
    const dx = Math.max(1, +(sx * 0.65).toFixed(2));
    const dy = Math.max(1, +(sy * 0.55).toFixed(2));
    out += `<use href="#${id}" fill="#000000" fill-opacity="0.85" x="${dx}" y="${dy}"/>`;
  }
  if (chroma) {
    // Pure-vector PS1 CRT RGB phosphor fringe (stays razor-sharp on iOS Retina; avoids WebKit 1x filter blur bug)
    out += `<use href="#${id}" fill="#ff3b5c" fill-opacity="0.24" x="-0.55"/>`;
    out += `<use href="#${id}" fill="#38bdf8" fill-opacity="0.24" x="0.55"/>`;
  }
  out += `<use href="#${id}" fill="${fill}"/>`;
  return out;
}

function formatCompact(n) {
  if (n >= 10000) return `${(n / 1000).toFixed(0)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function formatComma(n) {
  return n.toLocaleString("en-US");
}

function truncate(str, max) {
  if (!str) return "";
  return str.length > max ? `${str.slice(0, max - 2)}..` : str;
}

// ============================================================================
// GitHub Public GraphQL Fetcher
// ============================================================================
function resolveToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN.trim();
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN.trim();
  try {
    return execSync("gh auth token", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

async function fetchGitHubData() {
  const token = resolveToken();
  if (!token) {
    console.warn("No GITHUB_TOKEN found; using fallback sample data.");
    return getFallbackData();
  }

  const query = `
    query($login: String!) {
      user(login: $login) {
        pinnedItems(first: 3, types: REPOSITORY) {
          nodes {
            ... on Repository {
              name
              isPrivate
              primaryLanguage { name }
            }
          }
        }
        repositories(first: 15, ownerAffiliations: OWNER, privacy: PUBLIC, isFork: false, orderBy: {field: PUSHED_AT, direction: DESC}) {
          totalCount
          nodes {
            name
            primaryLanguage { name }
          }
        }
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                contributionLevel
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "mike623-readme-generator",
    },
    body: JSON.stringify({ query, variables: { login: USERNAME } }),
  });

  if (!res.ok) {
    throw new Error(`GitHub GraphQL failed: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  if (json.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  }

  const user = json.data.user;
  const cal = user.contributionsCollection.contributionCalendar;
  const allDays = cal.weeks.flatMap((w) => w.contributionDays);

  // Compute current streak & days since last commit
  let daysSinceLast = 999;
  for (let i = allDays.length - 1; i >= 0; i--) {
    if (allDays[i].contributionCount > 0) {
      daysSinceLast = allDays.length - 1 - i;
      break;
    }
  }

  let currentStreak = 0;
  let startIdx = allDays.length - 1;
  if (allDays[startIdx]?.contributionCount === 0 && allDays[startIdx - 1]?.contributionCount > 0) {
    startIdx -= 1;
  }
  for (let i = startIdx; i >= 0; i--) {
    if (allDays[i].contributionCount > 0) currentStreak++;
    else break;
  }

  let longestStreak = 0;
  let run = 0;
  for (const d of allDays) {
    if (d.contributionCount > 0) {
      run++;
      if (run > longestStreak) longestStreak = run;
    } else {
      run = 0;
    }
  }

  // Condition mapping based on recent commit activity
  let condition = "Fine";
  if (daysSinceLast > 10) condition = "Danger";
  else if (daysSinceLast > 3) condition = "Caution";

  // Pick 3 public pinned repos, or fall back to 3 most recently pushed public repos (excluding profile repo)
  const pinnedPublic = (user.pinnedItems?.nodes || []).filter((r) => r && !r.isPrivate && r.name !== USERNAME);
  const recentPublic = (user.repositories?.nodes || []).filter((r) => r && r.name !== USERNAME);
  const seen = new Set();
  const featuredRepos = [];
  for (const r of [...pinnedPublic, ...recentPublic]) {
    if (seen.has(r.name)) continue;
    seen.add(r.name);
    featuredRepos.push({
      name: r.name,
      lang: r.primaryLanguage?.name || "Code",
    });
    if (featuredRepos.length >= 3) break;
  }

  // Last 26 weeks for MAP heatmap
  const mapWeeks = cal.weeks.slice(-26).map((w) =>
    w.contributionDays.map((d) => {
      switch (d.contributionLevel) {
        case "FIRST_QUARTILE": return 1;
        case "SECOND_QUARTILE": return 2;
        case "THIRD_QUARTILE": return 3;
        case "FOURTH_QUARTILE": return 4;
        default: return 0;
      }
    })
  );

  return {
    totalContributions: cal.totalContributions,
    currentStreak,
    longestStreak,
    daysSinceLast,
    condition,
    publicRepos: user.repositories.totalCount,
    featuredRepos,
    mapWeeks,
  };
}

function getFallbackData() {
  const mapWeeks = Array.from({ length: 26 }, (_, c) =>
    Array.from({ length: 7 }, (_, r) => {
      const h = (c * 19 + r * 29 + c * r) % 11;
      return h < 3 ? 0 : h < 6 ? 1 : h < 8 ? 2 : h < 10 ? 3 : 4;
    })
  );
  return {
    totalContributions: 1248,
    currentStreak: 42,
    longestStreak: 42,
    daysSinceLast: 0,
    condition: "Fine",
    publicRepos: 68,
    featuredRepos: [
      { name: "dclt-badminton-ics", lang: "Python" },
      { name: "scottish-tartan-finder", lang: "HTML" },
      { name: "kanagawa-orca-theme", lang: "Python" },
    ],
    mapWeeks,
  };
}

// ============================================================================
// Shared PS1 CRT Defs (Retina-safe: pure-vector scanlines + vignette, no 1x filter rasterization)
// ============================================================================
function sharedCrtDefs(idSuffix) {
  return `
  <defs>
    <linearGradient id="bg-${idSuffix}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#192057"/>
      <stop offset="55%" stop-color="#10153a"/>
      <stop offset="100%" stop-color="#090c24"/>
    </linearGradient>
    <linearGradient id="hdr-${idSuffix}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#68749e"/>
      <stop offset="100%" stop-color="#37405e"/>
    </linearGradient>
    <radialGradient id="vig-${idSuffix}" cx="50%" cy="50%" r="68%">
      <stop offset="66%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.38"/>
    </radialGradient>
    <pattern id="scan-${idSuffix}" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="2" fill="rgba(0,0,0,0)"/>
      <rect y="2" width="4" height="2" fill="rgba(0,0,0,0.17)"/>
    </pattern>
  </defs>`;
}

// ============================================================================
// 1. TOP STATUS + ANIMATED ECG + EQUIP SVG (820 x 168)
// ============================================================================
function buildStatusSvg(data) {
  const ecgTheme = {
    Fine: { color: "#22ff55", grid: "rgba(34,255,85,0.14)", speed: "2.2s" },
    Caution: { color: "#facc15", grid: "rgba(250,204,21,0.14)", speed: "1.45s" },
    Danger: { color: "#ff3b30", grid: "rgba(255,59,48,0.16)", speed: "0.95s" },
  }[data.condition];

  const streakLabel =
    data.currentStreak > 0
      ? `${data.currentStreak}d STREAK · ${formatCompact(data.totalContributions)} SAVES`
      : `BEST ${data.longestStreak}d · ${formatCompact(data.totalContributions)} SAVES`;

  // Repeat 6 heartbeat cycles so CSS translation loops seamlessly (-110px)
  const cycles = [];
  for (let k = 0; k < 6; k++) {
    const o = 152 + k * 110;
    cycles.push(
      `${o},112 ${o + 22},112 ${o + 29},103 ${o + 36},112 ${o + 47},112 ${o + 52},125 ${o + 59},70 ${o + 66},132 ${o + 72},112 ${o + 85},112 ${o + 93},98 ${o + 101},112 ${o + 110},112`
    );
  }
  const polyPoints = cycles.join(" ");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 168" width="820" height="168" role="img" aria-label="MIKE623 PS1 Biohazard Status ECG ${data.condition}">
  ${sharedCrtDefs("s1")}
  <defs>
    <pattern id="ecgGrid" width="12" height="12" patternUnits="userSpaceOnUse">
      <path d="M 12 0 L 0 0 0 12" fill="none" stroke="${ecgTheme.grid}" stroke-width="1"/>
    </pattern>
    <clipPath id="ecgClip"><rect x="163" y="16" width="417" height="136"/></clipPath>
  </defs>
  <style>
    @keyframes ecgScroll {
      0% { transform: translateX(0px); }
      100% { transform: translateX(-110px); }
    }
    .ecg-wave { animation: ecgScroll ${ecgTheme.speed} linear infinite; }
  </style>

  <g>
    <!-- Outer PS1 metallic frame -->
    <rect x="2" y="2" width="816" height="164" fill="url(#bg-s1)" stroke="#5b658a" stroke-width="3"/>
    <rect x="5" y="5" width="810" height="158" fill="none" stroke="#9aa6cc" stroke-width="1.5"/>

    <!-- Portrait Panel -->
    <rect x="14" y="14" width="112" height="140" fill="#080b20" stroke="#7d89b0" stroke-width="2"/>
    <rect x="15" y="15" width="110" height="27" fill="url(#hdr-s1)"/>
    ${pxText(CONFIG.portraitName, 70, 21, { sx: 2.1, sy: 2.1, fill: "#f8fafc", align: "center" })}
    <g transform="translate(30, 50) scale(5)" shape-rendering="crispEdges">
      <rect x="4" y="1" width="8" height="3" fill="#1e293b"/>
      <rect x="3" y="3" width="10" height="2" fill="#0f172a"/>
      <rect x="4" y="4" width="8" height="6" fill="#e5b895"/>
      <rect x="5" y="6" width="2" height="1" fill="#0f172a"/>
      <rect x="9" y="6" width="2" height="1" fill="#0f172a"/>
      <rect x="6" y="8" width="4" height="1" fill="#b47b60"/>
      <rect x="2" y="10" width="12" height="6" fill="#1d4ed8"/>
      <rect x="5" y="10" width="6" height="6" fill="#334155"/>
      <rect x="7" y="11" width="2" height="4" fill="#94a3b8"/>
    </g>

    <!-- ECG Heartbeat Panel -->
    <rect x="136" y="14" width="446" height="140" fill="#030b06" stroke="#7d89b0" stroke-width="2"/>
    <rect x="137" y="15" width="26" height="138" fill="url(#hdr-s1)"/>
    <g transform="rotate(-90 150 84)">
      ${pxText("ECG", 150, 77, { sx: 1.9, sy: 1.8, fill: "#dbeafe", align: "center" })}
    </g>
    <rect x="163" y="16" width="417" height="136" fill="url(#ecgGrid)"/>
    ${pxText(data.condition, 176, 25, { sx: 3.5, sy: 4.1, fill: ecgTheme.color, chroma: true })}
    ${pxText(streakLabel, 570, 31, { sx: 1.7, sy: 2.3, fill: "#93c5fd", align: "right", chroma: true })}

    <g clip-path="url(#ecgClip)">
      <!-- Pure-vector soft phosphor halo + crisp core heartbeat -->
      <g class="ecg-wave" fill="none" stroke-linejoin="round" stroke-linecap="round">
        <polyline points="${polyPoints}" stroke="${ecgTheme.color}" stroke-width="7.5" stroke-opacity="0.22"/>
        <polyline points="${polyPoints}" stroke="${ecgTheme.color}" stroke-width="3.2"/>
      </g>
    </g>

    <!-- EQUIP Panel -->
    <rect x="592" y="14" width="214" height="140" fill="#0c1133" stroke="#7d89b0" stroke-width="2"/>
    <rect x="593" y="15" width="212" height="27" fill="url(#hdr-s1)"/>
    ${pxText("EQUIP", 699, 21, { sx: 2.1, sy: 2.1, fill: "#f8fafc", align: "center" })}
    <rect x="606" y="56" width="58" height="46" fill="${CONFIG.equip.color}" stroke="#bfdbfe" stroke-width="2"/>
    ${pxText(CONFIG.equip.badge, 635, 70, { sx: 2.8, sy: 2.7, fill: "#ffffff", align: "center" })}
    ${pxText(CONFIG.equip.name, 674, 58, { sx: 2.0, sy: 2.6, fill: "#ffffff", chroma: true })}
    ${pxText(CONFIG.equip.sub, 674, 84, { sx: 1.65, sy: 2.1, fill: "#93c5fd" })}
    ${pxText("∞", 796, 121, { sx: 3.6, sy: 3.2, fill: "#4ade80", align: "right" })}
  </g>

  <!-- Scanlines + CRT vignette -->
  <rect x="2" y="2" width="816" height="164" fill="url(#scan-s1)"/>
  <rect x="2" y="2" width="816" height="164" fill="url(#vig-s1)"/>
</svg>`;
}

// ============================================================================
// 2. INVENTORY 2x4 CARD SVG (406 x 276)
// ============================================================================
function buildInventorySvg(data) {
  const slots = [
    ...CONFIG.inventorySlots,
    {
      name: "Ink Ribbon",
      tag: "Git Saves",
      qty: formatCompact(data.totalContributions),
      badge: "IT",
      color: "#475569",
    },
    {
      name: "Green Herb",
      tag: "Focus",
      qty: "x3",
      badge: "++",
      color: "#16a34a",
    },
  ];

  const slotSvg = slots
    .map((slot, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = 12 + col * 194;
      const y = 44 + row * 56;
      const fill = slot.selected ? "#1f296b" : "#151c4f";
      const stroke = slot.selected ? "#fde047" : "#3f4a87";
      const sw = slot.selected ? 2.4 : 2;
      return `
      <rect x="${x}" y="${y}" width="188" height="50" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>
      <rect x="${x + 7}" y="${y + 9}" width="32" height="32" fill="${slot.color}" stroke="#e2e8f0" stroke-width="1.5"/>
      ${pxText(slot.badge, x + 23, y + 19, { sx: 1.7, sy: 1.7, fill: "#ffffff", align: "center" })}
      ${pxText(slot.name, x + 46, y + 10, { sx: 1.45, sy: 2.0, fill: "#f8fafc", chroma: true })}
      ${pxText(slot.tag, x + 46, y + 30, { sx: 1.15, sy: 1.55, fill: "#93c5fd" })}
      ${pxText(slot.qty, x + 181, y + 34, { sx: 1.35, sy: 1.5, fill: "#4ade80", align: "right" })}`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 406 276" width="406" height="276" role="img" aria-label="MIKE623 PS1 Inventory 8/8">
  ${sharedCrtDefs("s2")}
  <g>
    <rect x="2" y="2" width="402" height="272" fill="url(#bg-s2)" stroke="#5b658a" stroke-width="3"/>
    <rect x="5" y="5" width="396" height="266" fill="none" stroke="#9aa6cc" stroke-width="1.3"/>
    <rect x="12" y="12" width="382" height="25" fill="url(#hdr-s2)"/>
    ${pxText("ITEM // INVENTORY", 21, 18, { sx: 1.75, sy: 1.75, fill: "#f8fafc" })}
    ${pxText("8/8", 385, 18, { sx: 1.75, sy: 1.75, fill: "#fde047", align: "right" })}
    ${slotSvg}
  </g>
  <rect x="2" y="2" width="402" height="272" fill="url(#scan-s2)"/>
  <rect x="2" y="2" width="402" height="272" fill="url(#vig-s2)"/>
</svg>`;
}

// ============================================================================
// 3. FILE (RECENT PUBLIC REPOS) + MAP (CONTRIBUTION RADAR) SVG (406 x 276)
// ============================================================================
function buildFileMapSvg(data) {
  const fileRows = data.featuredRepos
    .slice(0, 3)
    .map((repo, idx) => {
      const y = 43 + idx * 33;
      const num = `0${idx + 1}.`;
      const nameStr = truncate(repo.name, 22);
      const langStr = truncate(repo.lang, 8).toUpperCase();
      return `
      <rect x="12" y="${y}" width="382" height="28" fill="#141a47" stroke="#3f4a87" stroke-width="1.5"/>
      ${pxText(num, 20, y + 7, { sx: 1.4, sy: 1.9, fill: "#fde047" })}
      ${pxText(nameStr, 50, y + 7, { sx: 1.45, sy: 1.95, fill: "#f8fafc", chroma: true })}
      ${pxText(langStr, 386, y + 9, { sx: 1.25, sy: 1.5, fill: "#4ade80", align: "right" })}`;
    })
    .join("");

  const palette = ["#11173d", "#164e63", "#15803d", "#22c55e", "#4ade80"];
  const cells = [];
  const weeks = data.mapWeeks.slice(-26);
  weeks.forEach((week, c) => {
    for (let r = 0; r < 7; r++) {
      const lvl = week[r] ?? 0;
      const cx = 20 + c * 14;
      const cy = 184 + r * 11;
      cells.push(`<rect x="${cx}" y="${cy}" width="11" height="8.5" fill="${palette[lvl]}"/>`);
    }
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 406 276" width="406" height="276" role="img" aria-label="MIKE623 PS1 Files and Sector Commit Map">
  ${sharedCrtDefs("s3")}
  <g>
    <rect x="2" y="2" width="402" height="272" fill="url(#bg-s3)" stroke="#5b658a" stroke-width="3"/>
    <rect x="5" y="5" width="396" height="266" fill="none" stroke="#9aa6cc" stroke-width="1.3"/>

    <!-- FILE Section -->
    <rect x="12" y="12" width="382" height="25" fill="url(#hdr-s3)"/>
    ${pxText("FILE // PUBLIC REPOS", 21, 18, { sx: 1.7, sy: 1.75, fill: "#f8fafc" })}
    ${pxText(String(data.publicRepos), 385, 18, { sx: 1.7, sy: 1.75, fill: "#4ade80", align: "right" })}
    ${fileRows}

    <!-- MAP Section -->
    <rect x="12" y="146" width="382" height="25" fill="url(#hdr-s3)"/>
    ${pxText("MAP // SECTOR COMMITS", 21, 152, { sx: 1.7, sy: 1.75, fill: "#f8fafc" })}
    ${pxText(formatComma(data.totalContributions), 385, 152, { sx: 1.65, sy: 1.75, fill: "#4ade80", align: "right" })}

    <rect x="12" y="177" width="382" height="87" fill="#070a1e" stroke="#3f4a87" stroke-width="1.5"/>
    ${cells.join("")}
  </g>
  <rect x="2" y="2" width="402" height="272" fill="url(#scan-s3)"/>
  <rect x="2" y="2" width="402" height="272" fill="url(#vig-s3)"/>
</svg>`;
}

// ============================================================================
// 4. BOTTOM TYPEWRITER DIALOG BOX SVG (820 x 84)
// ============================================================================
function buildDialogSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 84" width="820" height="84" role="img" aria-label="MIKE623 Bio Dialog">
  ${sharedCrtDefs("s4")}
  <style>
    @keyframes blinkCur { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
    .cur { animation: blinkCur 1s steps(1, end) infinite; }
  </style>
  <g>
    <rect x="2" y="2" width="816" height="80" fill="#080b1f" stroke="#5b658a" stroke-width="3"/>
    <rect x="5" y="5" width="810" height="74" fill="none" stroke="#9aa6cc" stroke-width="1.5"/>
    ${pxText(CONFIG.dialogLine1, 22, 18, { sx: 2.0, sy: 2.7, fill: "#f8fafc", chroma: true })}
    ${pxText(CONFIG.dialogLine2, 22, 48, { sx: 2.0, sy: 2.7, fill: "#cbd5e1", chroma: true })}
    <g class="cur">
      ${pxText("▼", 796, 51, { sx: 2.6, sy: 2.6, fill: "#fde047", align: "right" })}
    </g>
  </g>
  <rect x="2" y="2" width="816" height="80" fill="url(#scan-s4)"/>
  <rect x="2" y="2" width="816" height="80" fill="url(#vig-s4)"/>
</svg>`;
}

// ============================================================================
// 5. CLICKABLE PS1 RADIO BADGE SVGS (192 x 34 each — wrap naturally on mobile)
// ============================================================================
function buildRadioBadgeSvg(item) {
  const id = `r-${item.id}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 34" width="192" height="34" role="img" aria-label="Radio ${item.label}">
  ${sharedCrtDefs(id)}
  <g>
    <rect x="1.5" y="1.5" width="189" height="31" fill="url(#hdr-${id})" stroke="#8a97c2" stroke-width="2"/>
    <rect x="3" y="3" width="186" height="28" fill="none" stroke="#1b213b" stroke-width="1.2"/>
    <rect x="9" y="12" width="8" height="10" fill="#4ade80"/>
    ${pxText(item.label, 25, 11, { sx: 1.65, sy: 1.7, fill: "#f8fafc" })}
    ${pxText(item.freq, 182, 12, { sx: 1.25, sy: 1.5, fill: "#fde047", align: "right" })}
  </g>
  <rect x="1.5" y="1.5" width="189" height="31" fill="url(#scan-${id})"/>
</svg>`;
}

// ============================================================================
// Main
// ============================================================================
async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const data = await fetchGitHubData();

  fs.writeFileSync(path.join(OUT_DIR, "status-ecg.svg"), buildStatusSvg(data), "utf8");
  fs.writeFileSync(path.join(OUT_DIR, "inventory.svg"), buildInventorySvg(data), "utf8");
  fs.writeFileSync(path.join(OUT_DIR, "file-map.svg"), buildFileMapSvg(data), "utf8");
  fs.writeFileSync(path.join(OUT_DIR, "dialog.svg"), buildDialogSvg(), "utf8");

  for (const r of CONFIG.radioLinks) {
    fs.writeFileSync(path.join(OUT_DIR, `radio-${r.id}.svg`), buildRadioBadgeSvg(r), "utf8");
  }

  console.log(
    `Generated PS1 Biohazard SVGs for ${USERNAME}: condition=${data.condition}, saves=${data.totalContributions}, streak=${data.currentStreak}d, publicRepos=${data.publicRepos}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
