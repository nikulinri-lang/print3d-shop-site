/* PRINTLAB backend: каталог, заказы и AI-чат.
 * Секреты задаются только через Wrangler:
 *   BOT_TOKEN, OWNER_CHAT_ID, OPENAI_API_KEY
 * Не хранить секреты в Git.
 */
const ALLOWED_ORIGIN = "https://3-d-shop.ru";
const CATALOG_URL = "https://3-d-shop.ru/products-autumn.json";
const DEFAULT_MODEL = "gpt-5.6-luna";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
  };
}
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=utf-8",...corsHeaders()}});}
function esc(v){return String(v==null?"":v).slice(0,2000);}
function normalizeProduct(p){
  return {id:String(p.id||p.slug||""),slug:String(p.slug||p.id||""),title:String(p.title||"Без названия"),
    category:String(p.category||"Другое"),price:Number(p.price||0),
    variants:Array.isArray(p.variants)?p.variants.map(v=>({name:String(v.name||""),extra:Number(v.extra||0)})):[],
    description:String(p.description||""),shortDesc:String(p.shortDesc||""),stock:Number(p.stock||0)};
}
async function getProducts(){
  const r=await fetch(CATALOG_URL,{headers:{"Accept":"application/json","User-Agent":"PRINTLAB-Worker"},cf:{cacheTtl:60,cacheEverything:true}});
  if(!r.ok) throw new Error("catalog fetch failed: "+r.status);
  const d=await r.json(); if(!Array.isArray(d)) throw new Error("catalog must be an array"); return d.map(normalizeProduct);
}
function formatOrderMessage(d){
  const lines=["🛒 Новый заказ","","👤 ФИО: "+esc(d.name),`📞 Телефон: ${esc(d.phone||d.contact)}`,`📍 Город: ${esc(d.city)}`,"📦 Товары:",
    ...(Array.isArray(d.items)?d.items:[]).map(i=>`  — ${esc(i.title||i.slug)}${i.variant?` (${esc(i.variant)})`:""} × ${esc(i.qty||1)}`)];
  if(d.comment) lines.push("💬 Комментарий: "+esc(d.comment));
  lines.push("🕐 "+new Date().toISOString()); return lines.join("\n");
}
function formatCustomMessage(d){
  return ["🛠 Новая заявка на кастомный заказ","",`👤 Имя: ${esc(d.name)}`,`📞 Контакт: ${esc(d.contact)}`,
    `📝 Описание: ${esc(d.description)}`,`🔢 Количество: ${esc(d.qty)}`,d.size?`📏 Размер: ${esc(d.size)}`:"",d.color?`🎨 Цвет: ${esc(d.color)}`:"",d.fileName?`📎 Файл: ${esc(d.fileName)}`:"",`🕐 ${new Date().toISOString()}`].filter(Boolean).join("\n");
}
async function sendTelegramMessage(env,text){
  const r=await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:env.OWNER_CHAT_ID,text})});
  if(!r.ok) throw new Error("Telegram API "+r.status+": "+await r.text());
}
function chatLogMessage(d,role,text){
  const prefix=role==="user"?"👤 Клиент":"🧑‍💼 Консультант PRINTLAB";
  return [d.isNew&&role==="user"?"💬 Новый диалог с консультантом PRINTLAB":"",`🌐 ${d.page||"сайт"}`,d.product?`📦 ${esc(d.product)}`:"",prefix+": "+esc(text),`🆔 ${esc(d.sessionId)}`].filter(Boolean).join("\n");
}
async function askOpenAI(env,{history,catalog,page,customer}){
  const catalogText=catalog.map(p=>{const variants=p.variants.length?p.variants.map(v=>`${v.name}${v.extra?\` (+${v.extra} ₽)\`:""}`).join(", "):"нет отдельных вариантов";return [`ID: ${p.id}`,`Название: ${p.title}`,`Категория: ${p.category}`,`Цена от: ${p.price} ₽`,`Варианты: ${variants}`,`Наличие: ${p.stock>0?"есть":"нет"}`,`Кратко: ${p.shortDesc}`,`Описание: ${p.description}`].join(" | ")}).join("\\n");
  const system=`Ты — консультант магазина PRINTLAB (3-d-shop.ru), работаешь как внимательный сотрудник поддержки и продаж.\nТвоя главная задача — помочь человеку быстро найти подходящий товар и ненавязчиво довести заинтересованного клиента до заказа.\n\nКАТАЛОГ — твой основной источник истины. Ниже передан ПОЛНЫЙ актуальный каталог. Используй его для конкретных ответов: названия, категории, цены, варианты, наличие, описания и характеристики. Если спрашивают "что есть", сам предложи 2–4 конкретных товара. Если спрашивают про подарок — уточни кому, повод и бюджет, затем предложи 2–4 подходящих варианта с реальными ценами. Если спрашивают конкретный товар — отвечай по его данным.\nОтвечай на любые разумные вопросы по 3D-печати, PLA/PETG, материалам, уходу, вариантам изделий, доставке, кастомной печати и заказу. Если данных нет — не выдумывай.\nНе придумывай скидки, сроки, наличие, характеристики или условия.\n\nСТИЛЬ:\n- естественно и дружелюбно;\n- называй себя "консультант PRINTLAB"; не используй слова "AI", "искусственный интеллект", "бот" или "нейросеть";\n- не дави и не повторяй призыв купить после каждого сообщения;\n- используй наводящие вопросы и варианты выбора, когда это помогает клиенту определиться;\n- за один ответ задавай максимум один главный вопрос;\n- если клиент готов заказать, постепенно собери ФИО, город доставки и телефон;\n- персональные данные проси только после согласия клиента, которое сайт получает отдельно.\n\nКогда все ФИО + город + телефон получены, order_ready=true и заполни order. Товар/товары бери из диалога или каталога. Для индивидуальной печати опиши запрос в comment.\nВерни СТРОГО JSON без markdown:\n{"reply":"текст клиенту","order_ready":false,"order":{"name":"","city":"","phone":"","items":[],"comment":""}}\nЕсли заказ ещё не готов, order_ready=false. Если клиент исправляет данные, используй исправленные данные.\n\nПолный каталог:\n${catalogText}\nСтраница: ${page||"сайт"}${customer?"\nДанные клиента, уже названные в диалоге: "+JSON.stringify(customer):""}`
  const input=[{role:"system",content:system},...history.slice(-14).map(m=>({role:m.role==="assistant"?"assistant":"user",content:String(m.content).slice(0,4000)}))];
  const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${env.OPENAI_API_KEY}`},body:JSON.stringify({model:env.OPENAI_MODEL||DEFAULT_MODEL,input,max_output_tokens:700})});
  if(!r.ok) throw new Error("OpenAI API "+r.status+": "+await r.text());
  const data=await r.json();
  const text=data.output_text||data.output?.flatMap(x=>x.content||[]).map(x=>x.text||"").join("")||"";
  try{return JSON.parse(text)}catch{return {reply:text||"Подскажите, что вас интересует — я помогу.",order_ready:false,order:{}}}
}
export default {
 async fetch(request,env){
  if(request.method==="OPTIONS") return new Response(null,{headers:corsHeaders()});
  const url=new URL(request.url);
  if(request.method==="GET"&&url.pathname==="/products"){
    try{return json({ok:true,products:await getProducts(),source:CATALOG_URL})}catch(e){return json({ok:false,error:String(e)},502)}
  }
  if(request.method!=="POST") return json({ok:false,error:"method not allowed"},405);
  let d; try{d=await request.json()}catch{return json({ok:false,error:"invalid json"},400)}
  if(!d) return json({ok:false,error:"empty body"},400);
  try{
    if(d.kind==="chat"){
      if(!env.OPENAI_API_KEY||!env.BOT_TOKEN||!env.OWNER_CHAT_ID) return json({ok:false,error:"chat backend is not configured"},503);
      const catalog=await getProducts();
      if(d.userMessage) await sendTelegramMessage(env,chatLogMessage(d,"user",d.userMessage));
      const result=await askOpenAI(env,{history:Array.isArray(d.history)?d.history:[],catalog,page:d.page,customer:d.customer});
      if(result.reply) await sendTelegramMessage(env,chatLogMessage(d,"assistant",result.reply));
      if(result.order_ready&&result.order?.name&&result.order?.city&&result.order?.phone){
        await sendTelegramMessage(env,formatOrderMessage({...result.order,items:result.order.items||[]}));
      }
      return json({ok:true,reply:result.reply||"Подскажите, что хотите напечатать?",order_ready:Boolean(result.order_ready),order:result.order||{}});
    }
    if(!d.name||!d.contact) return json({ok:false,error:"missing name/contact"},400);
    const text=d.kind==="custom"?formatCustomMessage(d):formatOrderMessage(d);
    await sendTelegramMessage(env,text); return json({ok:true});
  }catch(e){return json({ok:false,error:String(e)},502)}
 }
};