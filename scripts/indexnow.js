#!/usr/bin/env node

const fs = require("fs");

const SITE = "https://3dvesh.ru";
const ENDPOINT = "https://yandex.com/indexnow";
const KEY = process.env.INDEXNOW_KEY;

if (!KEY) {
  console.error("INDEXNOW_KEY is not set");
  process.exit(1);
}

const changedFiles = process.argv.slice(2);
const urls = new Set();

function add(url) {
  if (url.startsWith(SITE + "/")) urls.add(url);
}

function addAllSitemapUrls() {
  const sitemap = fs.readFileSync("dist/sitemap.xml", "utf8");
  for (const match of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) add(match[1]);
}

for (const file of changedFiles) {
  if (/^content\/blog\/[^/]+\.md$/.test(file)) {
    const slug = file.replace(/^content\/blog\//, "").replace(/\.md$/, "");
    add(`${SITE}/blog/${slug}/`);
  } else if (/^content\/products(?:-autumn)?\.json$/.test(file)) {
    const sitemap = fs.readFileSync("dist/sitemap.xml", "utf8");
    for (const match of sitemap.matchAll(/<loc>(https:\/\/3dvesh\.ru\/catalog\/[^<]+)<\/loc>/g)) {
      add(match[1]);
    }
  } else if (
    /^build\/(render-(blog|products|home|static-pages|layout|sitemap)|build)\.js$/.test(file)
  ) {
    addAllSitemapUrls();
  }
}

if (!urls.size) {
  console.log("IndexNow: no content URLs to submit for this change.");
  process.exit(0);
}

const urlList = [...urls];

async function main() {
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: "3dvesh.ru",
      key: KEY,
      keyLocation: `${SITE}/${KEY}.txt`,
      urlList
    })
  });

  const body = await response.text();
  console.log(`IndexNow: ${response.status} ${response.statusText}; submitted ${urlList.length} URL(s)`);
  if (body) console.log(body);

  if (!response.ok && response.status !== 202) process.exit(1);
}

main().catch((error) => {
  console.error("IndexNow request failed:", error);
  process.exit(1);
});
