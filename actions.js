// === ACCIONES GLOBALES (Corrección del Scope Bug) ===

function updateCardOwner(id, newOwner){
    for(var i=0; i<S.ccData.cards.length; i++){
        if(S.ccData.cards[i].id === id){
            S.ccData.cards[i].p = newOwner;
            break;
        }
    }
    saveCC();
    render();
}

function syncNewCard(){
  var nb = document.getElementById("nc-b"); 
  var nbr = document.getElementById("nc-br");
  if(nb) S.nCard.b = nb.value; 
  if(nbr) S.nCard.br = nbr.value;
}

function syncNewCCTx(){
  var cid = document.getElementById("nx-cid"); if(cid) S.nCCTx.cId = parseInt(cid.value);
  var nd = document.getElementById("nx-d"); if(nd) S.nCCTx.d = nd.value;
  var nm = document.getElementById("nx-m"); if(nm) S.nCCTx.m = parseFloat(nm.value)||0;
  var nq = document.getElementById("nx-q"); if(nq) S.nCCTx.q = parseInt(nq.value)||1;
  var nc = document.getElementById("nx-c"); if(nc) S.nCCTx.c = nc.value;
  var nmusd = document.getElementById("nx-musd"); if(nmusd) S.nCCTx.mUsd = parseFloat(nmusd.value)||0;
}

function syncCfgInputs(){
  for(var i=0; i<S.cfgD.mbs.length; i++){
      var inN = document.getElementById("c-mn-"+i);
      var inI = document.getElementById("c-mi-"+i);
      var inA = document.getElementById("c-ma-"+i);
      if(inN) S.cfgD.mbs[i].n = inN.value;
      if(inI) S.cfgD.mbs[i].i = parseFloat(inI.value)||0;
      if(inA) S.cfgD.mbs[i].a = parseFloat(inA.value)||0;
  }
}

// ==================================================

function SS(p){
    for(var k in p) S[k]=p[k];
    
    // Auto asignar el primer integrante al abrir el modal de nueva tarjeta (si corresponde)
    if(p.showNewCard && S.data.mbs && (S.data.mbs||[]).length > 0 && !S.nCard.p) S.nCard.p = (S.data.mbs||[])[0].n;
    
    if(p.showNewShared && (S.data.mbs||[]).length > 0 && !S.nS.p) S.nS.p = (S.data.mbs||[])[0].n;
    if(p.showNewCCTx && S.ccData.cards.length > 0 && !S.nCCTx.cId) S.nCCTx.cId = S.ccData.cards[0].id;
    render();
}
function setV(v){S.view=v;render()}

// Month Navigation
function navM(dir){var m=S.month+dir;var y=S.year;if(m<0){m=11;y--}if(m>11){m=0;y++}S.month=m;S.year=y;loadD();render()}
function openMP(){S.mpY=S.year; SS({showMP:true});}
function changeMPY(dir){S.mpY+=dir; render();}
function selM(m){S.month=m; S.year=S.mpY; S.showMP=false; loadD(); render();}

// Config Actions
function openCfg(){
    S.cfgD={
        mbs: (S.data.mbs && Array.isArray(S.data.mbs)) ? JSON.parse(JSON.stringify(S.data.mbs)) : [],
        pG:S.data.pG||0,
        pA:S.data.pA||0
    };
    S.showConfig=true;
    render();
}
function addMb(){ syncCfgInputs(); S.cfgD.mbs.push({n:"", i:0, a:0}); render(); }
function rmMb(idx){ syncCfgInputs(); S.cfgD.mbs.splice(idx,1); render(); }
function saveCfg(){
   var nmbs=[];
   var hasManual = false;
   var totalM = 0;
   
   for(var i=0;i<S.cfgD.mbs.length;i++){
       var inN = document.getElementById("c-mn-"+i);
       var inI = document.getElementById("c-mi-"+i);
       var inA = document.getElementById("c-ma-"+i);
       var name = inN.value.trim() || ("Persona "+(i+1));
       var aporte = parseFloat(inA ? inA.value : 0) || 0;
       
       if(aporte > 0) hasManual = true;
       totalM += aporte;
       
       nmbs.push({ n: name, i: parseFloat(inI.value)||0, a: aporte });
   }
   S.data.mbs = nmbs;
   
   if(hasManual && totalM > 0) {
       S.data.pG = totalM; 
   } else {
       S.data.pG=parseFloat(document.getElementById("c-pG").value)||0;
   }
   S.data.pA=parseFloat(document.getElementById("c-pA").value)||0;
   
   saveD(); S.showConfig=false; render();
}

// Tarjetas Actions
function addCard(){
    var b = document.getElementById("nc-b").value;
    var br = document.getElementById("nc-br").value;
    var dCierre = document.getElementById("nc-cierre") ? document.getElementById("nc-cierre").value : "";
    var dVenc = document.getElementById("nc-venc") ? document.getElementById("nc-venc").value : "";
    if(!b) { showT("Falta completar el Banco"); return; }
    
    var p = S.nCard.p || ((S.data.mbs||[]).length > 0 ? (S.data.mbs||[])[0].n : "");
    
    S.ccData.cards.push({id:Date.now(), b:b, br:br, p:p, dCierre:dCierre, dVenc:dVenc});
    saveCC(); S.showNewCard=false; S.nCard={b:"", br:"Visa", p:"", dCierre:"", dVenc:""}; render();
}
function delCard(id){
    var nc = []; for(var i=0; i<S.ccData.cards.length; i++){ if(S.ccData.cards[i].id!==id) nc.push(S.ccData.cards[i]); }
    S.ccData.cards = nc;
    var nt = []; for(var i=0; i<S.ccData.txs.length; i++){ if(S.ccData.txs[i].cId!==id) nt.push(S.ccData.txs[i]); }
    S.ccData.txs = nt;
    saveCC(); S.showDelCard=0; render();
}
function openEditCard(id){
    var c = null;
    for(var i=0;i<S.ccData.cards.length;i++){if(S.ccData.cards[i].id===id){c=S.ccData.cards[i];break}}
    if(!c)return;
    S.eCard = {id:c.id, b:c.b, br:c.br, p:c.p||"Hogar", dCierre:c.dCierre||"", dVenc:c.dVenc||""};
    S.showEditCard = id;
    render();
}
function saveEditCard(){
    var b = document.getElementById("ec-b").value;
    var br = document.getElementById("ec-br").value;
    var dCierre = document.getElementById("ec-cierre").value;
    var dVenc = document.getElementById("ec-venc").value;
    if(!b){showT("Falta el nombre del banco");return;}
    
    for(var i=0;i<S.ccData.cards.length;i++){
        if(S.ccData.cards[i].id===S.showEditCard){
            S.ccData.cards[i].b = b;
            S.ccData.cards[i].br = br;
            S.ccData.cards[i].dCierre = dCierre;
            S.ccData.cards[i].dVenc = dVenc;
            S.ccData.cards[i].p = S.eCard.p;
            break;
        }
    }
    saveCC(); S.showEditCard=0; render();
}

function addCCTx(){
    var cidEl = document.getElementById("nx-cid");
    var dEl = document.getElementById("nx-d");
    var mEl = document.getElementById("nx-m");
    var qEl = document.getElementById("nx-q");
    var cEl = document.getElementById("nx-c");
    
    var cid = cidEl ? parseInt(cidEl.value) : 0;
    var desc = dEl ? dEl.value.trim() : "";
    var monto = mEl ? parseFloat(mEl.value) : 0;
    var cuotas = qEl ? (parseInt(qEl.value) || 1) : 1;
    var cat = cEl ? cEl.value : "";
    
    // In USD mode, use the calculated ARS value from state if input is empty
    if(S.nCCTx.cur === "USD" && (!monto || monto === 0) && S.nCCTx.m){
        monto = parseFloat(S.nCCTx.m) || 0;
    }
    
    if(!desc || !monto || !cid || !cat) { showT("Faltan datos"); return; }
    
    var tx = {id:Date.now(), cId:cid, d:desc, m:monto, q:cuotas, c:cat, sm:S.month, sy:S.year, t:S.nCCTx.t || "Hogar"};
    
    if(S.nCCTx.cur === "USD" && S.nCCTx.mUsd){
      tx.cur = "USD";
      tx.mUsd = parseFloat(S.nCCTx.mUsd) || 0;
      tx.payM = S.nCCTx.payM || "ARS";
      tx.dolarRate = tx.payM === "USD" ? (DOLAR.oficial || 0) : (DOLAR.tarjeta || DOLAR.oficial || 0);
    }
    S.ccData.txs.push(tx);
    saveCC(); S.showNewCCTx=false; S.nCCTx={cId:"", d:"", m:"", q:1, c:"", cur:"ARS", mUsd:"", t:"Hogar", payM:"ARS"}; render();
}

function setCCCur(cur){
  S.nCCTx.cur = cur;
  if(cur === "USD" && DOLAR.oficial === 0) fetchDolar();
  render();
}

function calcUsdToArs(){
  var el = document.getElementById("nx-musd");
  if(!el) return;
  S.nCCTx.mUsd = el.value;
  var usd = parseFloat(el.value) || 0;
  
  // Si paga en USD usa el Oficial, si paga en ARS usa el Tarjeta
  var rate = S.nCCTx.payM === "USD" ? (DOLAR.oficial || 0) : (DOLAR.tarjeta || DOLAR.oficial || 0);
  
  if(rate > 0){
    S.nCCTx.m = Math.round(usd * rate);
    var arsEl = document.getElementById("nx-m");
    if(arsEl) arsEl.value = S.nCCTx.m;
    var eqEl = document.getElementById("usd-equiv");
    if(eqEl) eqEl.textContent = "Equiv: " + fmt(S.nCCTx.m);
  }
}

function openEditCCTx(id){
    var tx = null;
    for(var i=0;i<S.ccData.txs.length;i++){if(S.ccData.txs[i].id===id){tx=S.ccData.txs[i];break}}
    if(!tx)return;
    S.eCCTx = {id:tx.id, d:tx.d, m:tx.m, q:tx.q||1, c:tx.c, t:tx.t||"Hogar", fixed:!!tx.fixed};
    S.showEditCCTx = id;
    render();
}
function saveEditCCTx(){
    var d = document.getElementById("ex-d").value;
    var m = parseFloat(document.getElementById("ex-m").value);
    var qEl = document.getElementById("ex-q");
    var q = S.eCCTx.fixed ? 1 : (qEl ? (parseInt(qEl.value)||1) : 1);
    var c = document.getElementById("ex-c").value;
    if(!d||!m||!c){showT("Faltan datos");return;}
    for(var i=0;i<S.ccData.txs.length;i++){
        if(S.ccData.txs[i].id===S.showEditCCTx){
            S.ccData.txs[i].d=d; S.ccData.txs[i].m=m; S.ccData.txs[i].q=q; S.ccData.txs[i].c=c; S.ccData.txs[i].t=S.eCCTx.t;
            S.ccData.txs[i].fixed = S.eCCTx.fixed ? true : false;
            break;
        }
    }
    saveCC(); S.showEditCCTx=0; render();
}
function delCCTx(id){
    var nt = []; for(var i=0; i<S.ccData.txs.length; i++){ if(S.ccData.txs[i].id!==id) nt.push(S.ccData.txs[i]); }
    S.ccData.txs = nt;
    saveCC(); render();
}

// Gastos Actions
function addG(){
  var d=document.getElementById("ng-d").value;
  var m=parseFloat(document.getElementById("ng-m").value);
  var c=document.getElementById("ng-c").value;
  var fEl=document.getElementById("ng-f");
  var f=fEl?fEl.value:"";
  if(!f)f=new Date().toISOString().split("T")[0];
  var owEl=document.getElementById("ng-owner");
  var owner=owEl?owEl.value:"Hogar";
  if(!d||!m||!c){showT("Faltan datos");return;}
  S.data.gR.push({id:Date.now(),d:d,m:m,c:c,f:f,owner:owner});
  saveD();S.showNewGasto=false;S.nG={d:"",m:"",c:CV[0],f:"",owner:"Hogar"};render();
}
function openEditG(id){
  var g=null;
  for(var i=0;i<S.data.gR.length;i++){if(S.data.gR[i].id===id){g=S.data.gR[i];break}}
  if(!g)return;
  S.eG={id:g.id,d:g.d,m:g.m,c:g.c,f:g.f||"",owner:g.owner||"Hogar"};
  S.showEditG=id;
  render();
}
function saveEditG(){
  var d=document.getElementById("eg-d").value;
  var m=parseFloat(document.getElementById("eg-m").value);
  var c=document.getElementById("eg-c").value;
  var f=document.getElementById("eg-f").value;
  var owEl=document.getElementById("eg-owner");
  var owner=owEl?owEl.value:"Hogar";
  if(!d||!m||!c){showT("Faltan datos");return;}
  for(var i=0;i<S.data.gR.length;i++){
    if(S.data.gR[i].id===S.showEditG){
      S.data.gR[i].d=d;S.data.gR[i].m=m;S.data.gR[i].c=c;S.data.gR[i].f=f;S.data.gR[i].owner=owner;
      break;
    }
  }
  saveD();S.showEditG=0;render();
}
function delG(id){
    var ng = []; for(var i=0; i<S.data.gR.length; i++){ if(S.data.gR[i].id!==id) ng.push(S.data.gR[i]); }
    S.data.gR = ng;
    saveD();render();
}
function addS(){var d=document.getElementById("ns-d").value;var m=parseFloat(document.getElementById("ns-m").value);var c=document.getElementById("ns-c").value;if(!d||!m||!c){showT("Faltan datos");return;}if(!S.data.gC)S.data.gC=[];S.data.gC.push({id:Date.now(),d:d,m:m,c:c,p:S.nS.p,f:new Date().toISOString().split("T")[0]});saveD();S.showNewShared=false;S.nS={d:"",m:"",c:"",p:""};render()}
function delS(id){
    var ng = []; for(var i=0; i<S.data.gC.length; i++){ if(S.data.gC[i].id!==id) ng.push(S.data.gC[i]); }
    S.data.gC = ng;
    saveD();render();
}
function setSP(p){S.nS.p=p;render()}

// NUEVA FUNCIÓN DE GUARDADO PARA GASTOS FIJOS
function saveAllFijos(){
    for(var i=0; i<S.data.gF.length; i++){
        var el = document.getElementById("fi-"+i);
        if(el) S.data.gF[i].m = parseFloat(el.value) || 0;
    }
    saveD();
    showT("Gastos fijos guardados");
    render();
}

function saveNotes(v){S.data.notas=v;saveD()}

function closeM(e){
    if(e.target.className.indexOf("mo")!==-1){
        S.showConfig=false; S.showNewGasto=false; S.showNewShared=false; 
        S.showCB=false; S.showReset=false; S.showResetFijos=false; S.showMP=false; 
        S.showNewCard=false; S.showNewCCTx=false; S.showDelCard=0; S.showSync=false;
        S.showEditG=0; S.showEditCCTx=0; S.showEditCard=0;
        
        S.nCCTx.t = "Hogar";
        render();
    }
}

var toastTimer = null;
function showT(msg){
    S.toast=msg;
    render();
    if(toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){S.toast="";render()}, 3000);
}

function openCB(){S.cbD={};for(var k in S.data.pC)S.cbD[k]=S.data.pC[k];S.showCB=true;render()}
function saveCB(){var p={};for(var i=0;i<CV.length;i++){var cat=CV[i];var el=document.getElementById("cb-"+cat.replace(/[^a-zA-Z]/g,""));var v=el?parseFloat(el.value)||0:0;if(v>0)p[cat]=v}S.data.pC=p;saveD();S.showCB=false;render()}

function doResetMonth(){
  var pm=S.month===0?11:S.month-1;var py=S.month===0?S.year-1:S.year;
  var prev=localStorage.getItem(skey(pm,py));
  var d=mkD(S.month,S.year);
  if(prev){
      try {
          var p=JSON.parse(prev);
          if(p.gF) d.gF=JSON.parse(JSON.stringify(p.gF));
          d.pG = p.pG||0; d.pA = p.pA||0;
          if(p.pC) d.pC = JSON.parse(JSON.stringify(p.pC));
          if(p.mbs) d.mbs = JSON.parse(JSON.stringify(p.mbs));
      } catch(e) {}
  }
  S.data = d;
  saveD(); 
  S.showReset=false;
  showT("Datos del mes borrados");
  render();
}

function doResetFijos(){
  for(var i=0; i<S.data.gF.length; i++){
      S.data.gF[i].m = 0;
  }
  saveD();
  S.showResetFijos=false;
  showT("Fijos reseteados a 0");
  render();
}