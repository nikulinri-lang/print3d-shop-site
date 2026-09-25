const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const { marked } = require("marked");
const { renderLayout, TELEGRAM_BOT_URL } = require("./layout");
const ROOT = path.resolve(__dirname, "..");
const BLOG_DIR = path.join(ROOT, "content", "blog");
const WORDS_PER_MINUTE = 200;
const BLOG_COVERS = {
  "mnogocvetnaya-pechat": "/images/blog/mnogocvetnaya-pechat.svg",
  "zakaz-po-foto": "/images/blog/zakaz-po-foto.svg",
  "top-10-podarkov": "/images/blog-top10-gifts.png",
  "kak-my-pechataem": "/images/blog/kak-my-pechataem.svg",
  "pla-vs-petg": "/images/blog/pla-vs-petg.jpg",
  "plastik-dlya-pechati": "/images/blog/plastik-dlya-pechati.svg",
  "skolko-stoit-pechat": "/images/blog/skolko-stoit-pechat.svg",
  "top-5-dlya-doma": "/images/blog/top-5-dlya-doma.svg",
  "podarok-na-zakaz-3d-pechat": "/images/blog-podarok-na-zakaz.png",
  "3d-printer-bryansk-kupit": "/images/blog-3d-printer-bryansk.png",
  "3d-modeli-besplatno-gde-skachat": "/images/blog-3d-modeli-besplatno.png",
};
function slugFromFilename(filename){return filename.replace(/\.md$/,"");}
function fmtDate(d){return new Date(d).toLocaleDateString("ru-RU",{day:"2-digit",month:"2-digit",year:"numeric"});}
function readingTime(content){return Math.max(1,Math.round(content.trim().split(/\s+/).filter(Boolean).length/WORDS_PER_MINUTE));}
function wrapCallouts(html){return html.replace(/<p><strong>([^<]*:)<\/strong>([\s\S]*?)<\/p>/g,(_m,lead,rest)=>`<div class="callout"><p><strong>${lead}</strong>${rest}</p></div>`);}
function wrapTables(html){return html.replace(/<table>([\s\S]*?)<\/table>/g,(_m,inner)=>`<div class="table-scroll"><table>${inner}</table></div>`);}
function slugifyHeading(text,used){const base=text.replace(/[^\p{L}\p{N}\s-]/gu,"").trim().toLowerCase().replace(/\s+/g,"-")||"section";const n=used.get(base)||0;used.set(base,n+1);return n?`${base}-${n}`:base;}
function injectHeadingIdsAndToc(html){const used=new Map(),toc=[];const withIds=html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g,(_m,level,inner)=>{const text=inner.replace(/<[^>]+>/g,""),id=slugifyHeading(text,used);toc.push({level:Number(level),text,id});return `<h${level} id="${id}">${inner}</h${level}>`;});return{html:withIds,toc};}
function normalizeFrontmatter(raw){
  return raw.replace(/^(title|category|excerpt):[ \t]*(.*)$/gm,(_m,key,value)=>`${key}: ${JSON.stringify(value)}`);
}
function loadPosts(){if(!fs.existsSync(BLOG_DIR))return[];return fs.readdirSync(BLOG_DIR).filter(f=>f.endsWith(".md")).map(f=>{const raw=fs.readFileSync(path.join(BLOG_DIR,f),"utf8"),{data,content}=matter(normalizeFrontmatter(raw)),rawHtml=marked.parse(content),{html,toc}=injectHeadingIdsAndToc(rawHtml),slug=slugFromFilename(f);return{slug,title:data.title,date:data.date,category:data.category||"Блог",excerpt:data.excerpt,cover:data.cover||BLOG_COVERS[slug]||null,readMinutes:readingTime(content),toc,html:wrapTables(wrapCallouts(html))};}).sort((a,b)=>new Date(b.date)-new Date(a.date));}
const BLOG_PLACEHOLDER_ICON='<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/>';
function blogCardMedia(p){
  if(!p.cover) return `<div class="blog-card-media"><div class="blog-card-photo"></div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="blog-card-placeholder-icon">${BLOG_PLACEHOLDER_ICON}</svg></div>`;
  // SVG-заглушки маленькие — показываем с contain; реальные фото — cover
  const isSvg = p.cover.endsWith(".svg");
  const fit = isSvg ? "contain" : "cover";
  return `<div class="blog-card-media blog-card-media--photo" style="aspect-ratio:16/9;overflow:hidden;display:flex;align-items:center;justify-content:center"><img src="${p.cover}" alt="${p.title}" loading="lazy" style="width:100%;height:100%;object-fit:${fit};display:block"></div>`;
}
function blogCardHTML(p){return`<a href="/blog/${p.slug}" class="blog-card">${blogCardMedia(p)}<span class="blog-card-tag">${p.category}</span><div class="blog-card-meta"><span class="blog-card-date mono">${fmtDate(p.date)}</span><span class="blog-card-read-time mono">${p.readMinutes} мин чтения</span></div><h3>${p.title}</h3><p>${p.excerpt}</p></a>`;}
function blogIndexPage(posts){const cards=posts.map(blogCardHTML).join("\n      ");const body=`<section class="page-hero premium-page-hero premium-page-hero--blog"><div class="container"><div class="premium-page-hero-grid"><div class="premium-page-hero-copy"><span class="kicker">Блог / PRINTLAB</span><h1>Читаем перед <span>печатью.</span></h1><p class="lede">Материалы, технологии, идеи и практические разборы — чтобы понимать, что именно мы печатаем и почему.</p><div class="premium-page-hero-actions"><a href="#blog-grid" class="btn btn-primary">Читать статьи →</a><a href="/printer" class="btn btn-ghost">О технологии печати</a></div></div><div class="premium-hero-panel premium-hero-panel--editorial"><div class="premium-hero-panel-top"><span>EDITORIAL / 3D</span><span>UPDATED</span></div><div class="editorial-big"><strong>${posts.length}</strong><span>материалов<br>в блоге</span></div><div class="editorial-tags"><span>MATERIALS</span><span>PROCESS</span><span>IDEAS</span><span>GUIDES</span></div><div class="premium-hero-note">Новые статьи появляются по мере развития мастерской.</div></div></div></div></section><section class="section"><div class="container"><div class="blog-grid" id="blog-grid">${cards}</div></div></section>`;return renderLayout({title:"Блог — 3Д Вещь",description:"Статьи о материалах для 3D-печати, процессе изготовления и практических примерах применения.",canonical:"/blog/",activeNav:"/blog/",bodyContent:body});}
function tocHTML(toc){if(toc.length<2)return"";const links=toc.map(i=>`<a href="#${i.id}" class="article-toc-link${i.level===3?" article-toc-link--sub":""}">${i.text}</a>`).join("\n            ");return`<aside class="article-toc"><div class="article-toc-inner"><span class="article-toc-label">На этой странице</span><nav class="article-toc-nav">${links}</nav></div></aside>`;}
function articleCta(){return`<div class="article-cta"><h2>Готовы заказать изделие?</h2><div class="article-cta-actions"><a href="/catalog" class="btn btn-primary">Смотреть каталог</a><a href="${TELEGRAM_BOT_URL}" class="btn btn-ghost" target="_blank" rel="noopener">Написать в Telegram</a></div></div>`;}
function blogPostPage(post){const body=`<div class="reading-progress" id="readingProgress"></div><section class="page-hero page-hero--article"><div class="container"><span class="kicker">Блог</span><div class="blog-card-date mono">${fmtDate(post.date)} · ${post.readMinutes} мин чтения</div><h1>${post.title}</h1></div></section><section class="section"><div class="container container--article-wide"><div class="article-layout"><article class="article-content">${post.html}${articleCta()}</article>${tocHTML(post.toc)}</div><a href="/blog/" class="btn btn-ghost article-back">← Ко всем статьям</a></div></section>`;const script=`<script>(function(){var bar=document.getElementById('readingProgress');if(!bar)return;function update(){var h=document.documentElement,scrolled=h.scrollTop,height=h.scrollHeight-h.clientHeight,pct=height>0?(scrolled/height)*100:0;bar.style.width=pct+'%';}document.addEventListener('scroll',update,{passive:true});update();})();</script>${post.toc.length>=2?'\n<script defer src="/js/article-toc.js?v=1"></script>':""}`;return renderLayout({title:`${post.title} — Блог 3Д Вещь`,description:post.excerpt,canonical:`/blog/${post.slug}`,activeNav:"/blog",bodyContent:body,extraScripts:script});}
function render(distDir){const posts=loadPosts(),blogDir=path.join(distDir,"blog"); // Индекс блога всегда собирается из всех Markdown-статей из content/blog.
fs.mkdirSync(blogDir,{recursive:true});fs.writeFileSync(path.join(blogDir,"index.html"),blogIndexPage(posts));for(const post of posts)fs.writeFileSync(path.join(blogDir,`${post.slug}.html`),blogPostPage(post));console.log(`  ✓ blog/index.html + ${posts.length} статей`);return posts;}
module.exports={render,loadPosts,fmtDate,blogCardHTML};
