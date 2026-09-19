(function(){
  const ENDPOINT="https://printlab-order-notifier.printlab3d.workers.dev";
  const KEY="printlab_ai_chat_v1";
  let state=JSON.parse(localStorage.getItem(KEY)||"null")||{sessionId:(crypto.randomUUID?crypto.randomUUID():Date.now()+"-"+Math.random()),messages:[],order:{},started:false};
  function save(){localStorage.setItem(KEY,JSON.stringify(state))}
  function esc(s){return String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
  function render(){
    let root=document.getElementById("printlab-ai-chat"); if(!root){root=document.createElement("div");root.id="printlab-ai-chat";document.body.appendChild(root)}
    root.innerHTML='<button class="printlab-chat-fab" aria-label="Открыть AI-чат"><span>✦</span><b>AI</b></button>'+
      '<section class="printlab-chat-panel" aria-label="AI-консультант" hidden>'+
      '<header><div><strong>PRINTLAB AI</strong><small>Помогу выбрать и оформить заказ</small></div><button class="printlab-chat-close" aria-label="Закрыть">×</button></header>'+
      '<div class="printlab-chat-messages"></div><div class="printlab-chat-typing" hidden>AI печатает…</div>'+
      '<form class="printlab-chat-form"><input maxlength="1000" autocomplete="off" placeholder="Напишите вопрос…"><button aria-label="Отправить">➤</button></form></section>';
    const panel=root.querySelector(".printlab-chat-panel"), msgs=root.querySelector(".printlab-chat-messages");
    const draw=()=>{msgs.innerHTML=state.messages.map(m=>'<div class="printlab-msg '+m.role+'">'+esc(m.content).replace(/\n/g,"<br>")+'</div>').join("");msgs.scrollTop=msgs.scrollHeight};
    const open=()=>{panel.hidden=false;root.querySelector(".printlab-chat-fab").style.display="none";if(!state.messages.length){state.messages.push({role:"assistant",content:"Здравствуйте! Я AI-консультант PRINTLAB. Помогу подобрать готовую вещь или оформить печать под ваш запрос. Что ищете?"});save()}draw();root.querySelector("input").focus()};
    root.querySelector(".printlab-chat-fab").onclick=open;root.querySelector(".printlab-chat-close").onclick=()=>{panel.hidden=true;root.querySelector(".printlab-chat-fab").style.display=""};
    root.querySelector(".printlab-chat-form").onsubmit=async e=>{
      e.preventDefault();const input=e.currentTarget.querySelector("input"), text=input.value.trim();if(!text)return;
      input.value="";state.messages.push({role:"user",content:text});draw();root.querySelector(".printlab-chat-typing").hidden=false;
      try{
        const page=location.pathname+(location.search||"");
        const product=document.querySelector("[data-product-title]")?.textContent?.trim()||"";
        const history=state.messages.slice(-15);
        const r=await fetch(ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind:"chat",sessionId:state.sessionId,userMessage:text,history,page,product,customer:state.order,isNew:!state.started})});
        const d=await r.json(); if(!r.ok||!d.ok) throw new Error(d.error||"Ошибка соединения");
        state.started=true;state.messages.push({role:"assistant",content:d.reply||"Готов помочь с заказом."});
        if(d.order) state.order=d.order;save();draw();
      }catch(err){state.messages.push({role:"assistant",content:"Сейчас не получилось подключиться к AI. Напишите нам в Telegram — поможем там."});save();draw()}
      finally{root.querySelector(".printlab-chat-typing").hidden=true}
    };
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",render);else render();
})();