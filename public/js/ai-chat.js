(function(){
  const ENDPOINT="https://printlab-order-notifier.printlab3d.workers.dev";
  const KEY="printlab_consultant_chat_v2";
  const POPUP_KEY="printlab_consultant_popup_v1";
  let state=JSON.parse(localStorage.getItem(KEY)||"null")||{sessionId:(crypto.randomUUID?crypto.randomUUID():Date.now()+"-"+Math.random()),messages:[],order:{},started:false,consent:false};
  function save(){localStorage.setItem(KEY,JSON.stringify(state))}
  function esc(s){return String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
  function render(){
    let root=document.getElementById("printlab-ai-chat"); if(!root){root=document.createElement("div");root.id="printlab-ai-chat";document.body.appendChild(root)}
    root.innerHTML='<div class="printlab-chat-promo">Поможем выбрать подарок</div>'+
      '<button class="printlab-chat-fab" aria-label="Открыть чат с консультантом"><span class="printlab-chat-icon">💬</span></button>'+
      '<section class="printlab-chat-panel" aria-label="Консультант PRINTLAB" hidden>'+
      '<header><div class="printlab-chat-head"><div class="printlab-avatar">P</div><div><strong>Консультант</strong><small><i></i> На связи 24/7</small></div></div><button class="printlab-chat-close" aria-label="Закрыть">×</button></header>'+
      '<div class="printlab-chat-messages"></div><div class="printlab-chat-typing" hidden>Консультант печатает…</div><div class="printlab-chat-quick"></div><div class="printlab-chat-consent" hidden><div>Перед продолжением подтвердите согласие на обработку данных. <a href="/privacy" target="_blank" rel="noopener">Подробнее</a>.</div><button type="button">Согласен(на)</button></div>'+
      '<form class="printlab-chat-form"><input maxlength="1000" autocomplete="off" placeholder="Напишите вопрос…" disabled><button aria-label="Отправить" disabled>➤</button></form></section>';
    const panel=root.querySelector(".printlab-chat-panel"),msgs=root.querySelector(".printlab-chat-messages"),input=root.querySelector("input"),send=root.querySelector(".printlab-chat-form button"),quick=root.querySelector(".printlab-chat-quick"),consentBox=root.querySelector(".printlab-chat-consent");
    const draw=()=>{msgs.innerHTML=state.messages.map(m=>'<div class="printlab-msg '+m.role+'">'+esc(m.content).replace(/\n/g,"<br>")+'</div>').join("");msgs.scrollTop=msgs.scrollHeight};
    const setReady=()=>{input.disabled=false;send.disabled=false;consentBox.hidden=!state.started||state.consent;quick.hidden=false};
    const addWelcome=()=>{if(state.messages.length)return;state.messages.push({role:"assistant",content:"Здравствуйте! Я консультант PRINTLAB. Помогу подобрать подарок, выбрать готовую вещь или обсудить индивидуальную 3D-печать."});state.messages.push({role:"assistant",content:"С чего начнём? Можно выбрать вариант ниже или написать свой вопрос."});save()};
    const quickHtml='<button type="button" data-q="🎁 Хочу выбрать подарок">🎁 Хочу выбрать подарок</button><button type="button" data-q="💰 Покажите варианты до 1000 ₽">💰 До 1000 ₽</button><button type="button" data-q="🖨 Хочу заказать печать">🖨 На заказ</button><button type="button" data-q="📦 Как работает доставка?">📦 Доставка</button>';
    async function sendText(text){
      if(state.started&&!state.consent){consentBox.hidden=false;input.disabled=true;send.disabled=true;return;}
      state.messages.push({role:"user",content:text});draw();root.querySelector(".printlab-chat-typing").hidden=false;
      try{
        const page=location.pathname+(location.search||"");
        const product=document.querySelector("[data-product-title]")?.textContent?.trim()||"";
        const history=state.messages.slice(-18);
        const r=await fetch(ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind:"chat",sessionId:state.sessionId,userMessage:text,history,page,product,customer:state.order,isNew:!state.started,consent:true})});
        const d=await r.json();
        if(!r.ok||!d.ok)throw new Error(d.error||"Ошибка соединения");
        state.started=true;state.messages.push({role:"assistant",content:d.reply||"Готов помочь с выбором."});
        if(d.order)state.order=d.order;save();draw();
      }catch(err){
        state.messages.push({role:"assistant",content:"Не удалось отправить сообщение. Попробуйте ещё раз через минуту."});save();draw();
      }finally{root.querySelector(".printlab-chat-typing").hidden=true}
    }
    const open=()=>{
      panel.hidden=false;root.querySelector(".printlab-chat-fab").style.display="none";root.querySelector(".printlab-chat-promo").style.display="none";
      addWelcome();
      if(state.started&&!state.consent){consentBox.hidden=false;quick.hidden=true;input.disabled=true;send.disabled=true}
      else{consentBox.hidden=true;quick.innerHTML=quickHtml;quick.hidden=false;input.disabled=false;send.disabled=false;input.focus()}
      quick.querySelectorAll("button").forEach(b=>b.onclick=()=>sendText(b.dataset.q));
      draw();localStorage.setItem(POPUP_KEY,"opened");
    };
    root.querySelector(".printlab-chat-fab").onclick=open;
    root.querySelector(".printlab-chat-close").onclick=()=>{panel.hidden=true;root.querySelector(".printlab-chat-fab").style.display="";root.querySelector(".printlab-chat-promo").style.display=""};
    consentBox.querySelector("button").onclick=()=>{
      state.consent=true;save();consentBox.hidden=true;quick.innerHTML=quickHtml;quick.hidden=false;input.disabled=false;send.disabled=false;
      quick.querySelectorAll("button").forEach(b=>b.onclick=()=>sendText(b.dataset.q));
      input.focus();
    };
    root.querySelector(".printlab-chat-form").onsubmit=e=>{e.preventDefault();const text=input.value.trim();if(text){input.value="";sendText(text)}};
    quick.innerHTML=quickHtml;quick.querySelectorAll("button").forEach(b=>b.onclick=()=>sendText(b.dataset.q));
    if(!state.started){input.disabled=false;send.disabled=false;consentBox.hidden=true;quick.hidden=false}else setReady();draw();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",render);else render();
  setTimeout(()=>{if(!localStorage.getItem(POPUP_KEY)){const fab=document.querySelector(".printlab-chat-fab");if(fab)fab.click()}},15000);
})();