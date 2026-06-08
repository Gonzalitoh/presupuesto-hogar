var S={
    month:new Date().getMonth(), year:new Date().getFullYear(),
    view:"dashboard", data:null, ccData:{cards:[], txs:[]}, toast:"",
    showConfig:false, showNewGasto:false, showNewShared:false, showCB:false, showReset:false, showResetFijos:false, showMP:false, showNewCard:false, showNewCCTx:false, showDelCard:0, showSync:false, showEditG:0, showEditCCTx:0, showEditCard:0,
    mpY:new Date().getFullYear(), gastoFilter:"",
    cfgD:{}, cbD:{}, catDetail:"", personalView:0, nG:{d:"",m:"",c:"",f:"",owner:"Hogar"}, nS:{d:"",m:"",c:"",p:""}, nCard:{b:"",br:"Visa",p:"",dCierre:"",dVenc:"",mVenc:"1"}, nCCTx:{cId:"",d:"",m:"",q:1,c:"",cur:"ARS",mUsd:"",t:"Hogar",payM:"ARS",fixed:false},
    eG:{id:0,d:"",m:"",c:"",f:"",owner:"Hogar"},
    eCCTx:{id:0,cId:"",d:"",m:"",q:1,c:"",t:"Hogar",fixed:false,fd:"",currq:"",cur:"ARS",payM:"ARS",mUsd:""},
    eCard:{id:0,b:"",br:"Visa",p:"",dCierre:"",dVenc:"",mVenc:"1"}
};

function mkD(m,y){return{month:m,year:y,mbs:[],pG:0,pA:0,gF:CF.map(function(c){return{n:c,m:0}}),gR:[],gC:[],pC:{},notas:"",cDates:{}}}

function loadD(){
  var ccRaw = localStorage.getItem('budget_cc_data');
  if(ccRaw) {
      try { S.ccData = JSON.parse(ccRaw); } catch(e) { S.ccData = {cards:[], txs:[]}; }
  } else S.ccData = {cards:[], txs:[]};
  if(!S.ccData.cards) S.ccData.cards = [];
  if(!S.ccData.txs) S.ccData.txs = [];

  var raw=localStorage.getItem(skey(S.month,S.year));
  if(raw){
      try { S.data = JSON.parse(raw); } catch(e) { S.data = mkD(S.month,S.year); }
      if(!S.data.gC)S.data.gC=[];
      if(!S.data.pC)S.data.pC={};
      if(S.data.notas==null)S.data.notas="";
      if(!S.data.cDates)S.data.cDates={};
      if(!S.data.mbs) {
          if(S.data.iS !== undefined) S.data.mbs = [{n:"Sol", i:S.data.iS||0}, {n:"Gon", i:S.data.iG||0}];
          else S.data.mbs = [];
      }
      if(!S.data.gF) S.data.gF = CF.map(function(c){return{n:c,m:0}});
  } else {
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
            else if(p.iS !== undefined) d.mbs=[{n:"Sol", i:p.iS||0}, {n:"Gon", i:p.iG||0}];
            if(p.cDates) d.cDates = JSON.parse(JSON.stringify(p.cDates));
        } catch(e) {}
    }
    S.data=d;
  }
}

function saveD(){
    localStorage.setItem(skey(S.month,S.year),JSON.stringify(S.data));
    triggerSync();
}
function saveCC(){
    localStorage.setItem('budget_cc_data', JSON.stringify(S.ccData));
    triggerSync();
}

function doCalc(d){
  if(!d)return{};
  var mbs = d.mbs || [];
  var iT = 0; 
  for(var i=0; i<mbs.length; i++){ iT += (mbs[i].i||0); }
  
  var tF=0; var gF = d.gF || [];
  for(var i=0; i<gF.length; i++) tF += (gF[i].m||0);
  
  var gV=d.gR||[]; var tV=0; 
  for(var i=0; i<gV.length; i++) tV += (gV[i].m||0);
  
  var tT=0; var ccActive=[]; var ccActivePersonal=[];
  var ccTotalByPerson = {}; 
  var cardBillByPerson = {}; 

  if(S.ccData && S.ccData.txs){
      var absCurr = d.year * 12 + d.month;
      for(var i=0; i<S.ccData.txs.length; i++){
          var tx = S.ccData.txs[i];
          
          var absStart;
          if(tx.absStart !== undefined){
              absStart = tx.absStart;
          } else {
              absStart = tx.sy * 12 + tx.sm;
          }
          
          var diff = absCurr - absStart;
          
          var effectiveQ = tx.fixed ? 9999 : (tx.q || 1);
          
          if(diff >= 0 && diff < effectiveQ){
              // If paid in USD, keep amount in USD; otherwise use ARS
              var amtPerQ;
              if(tx.fixed){
                  amtPerQ = (tx.cur === "USD" && tx.payM === "USD") ? (tx.mUsd || tx.m) : tx.m;
              } else {
                  amtPerQ = (tx.cur === "USD" && tx.payM === "USD") ? ((tx.mUsd || 0) / tx.q) : (tx.m / tx.q);
              }
              var amtARS = tx.fixed ? tx.m : (tx.m / tx.q); // Always keep ARS for totals
              
              var card = null;
              for(var k=0; k<S.ccData.cards.length; k++){ if(S.ccData.cards[k].id === tx.cId){ card = S.ccData.cards[k]; break; } }
              var owner = card ? (card.p || "Hogar") : "Hogar";

              var currQ = diff + 1;
              var displayQ = tx.fixed ? 0 : currQ; 

              if(owner !== "Hogar"){
                  cardBillByPerson[owner] = (cardBillByPerson[owner]||0) + amtARS;
                  
                  if (tx.t === "Personal") {
                      ccActivePersonal.push({ tx: tx, currQ: displayQ, amt: amtARS, amtUsd: (tx.cur==="USD"&&tx.payM==="USD") ? amtPerQ : 0 });
                  } else {
                      ccTotalByPerson[owner] = (ccTotalByPerson[owner]||0) + amtARS;
                      tT += amtARS;
                      ccActive.push({ tx: tx, currQ: displayQ, amt: amtARS, amtUsd: (tx.cur==="USD"&&tx.payM==="USD") ? amtPerQ : 0 });
                  }
              } else {
                  tT += amtARS;
                  if (tx.t === "Personal") {
                      ccActivePersonal.push({ tx: tx, currQ: displayQ, amt: amtARS, amtUsd: (tx.cur==="USD"&&tx.payM==="USD") ? amtPerQ : 0 });
                  } else {
                      ccActive.push({ tx: tx, currQ: displayQ, amt: amtARS, amtUsd: (tx.cur==="USD"&&tx.payM==="USD") ? amtPerQ : 0 });
                  }
              }
          }
      }
  }

  var tG=tF+tV+tT; 
  
  var pG=d.pG||0; var pA=d.pA||0;
  var totalManualAporte = 0;
  var useManualAporte = false;
  for(var i=0; i<mbs.length; i++){
      if(mbs[i].a > 0){
          totalManualAporte += mbs[i].a;
          useManualAporte = true;
      }
  }
  
  if(useManualAporte && totalManualAporte > 0){
      pG = totalManualAporte; 
  }
  
  var limit = Math.max(0, pG - pA);
  var rest = limit - tG;
  
  var pCat={}; var pCatPersonal={};
  // Gastos fijos del hogar
  for(var i=0; i<gF.length; i++){if(gF[i].m>0){ pCat[gF[i].n]=(pCat[gF[i].n]||0)+gF[i].m; }}
  // Gastos variables: hogar vs personal
  for(var i=0; i<gV.length; i++){
    var g=gV[i];
    if(g.owner && g.owner!=="Hogar"){ pCatPersonal[g.c]=(pCatPersonal[g.c]||0)+g.m; }
    else { pCat[g.c]=(pCat[g.c]||0)+g.m; }
  }
  // Cuotas tarjeta hogar
  for(var i=0; i<ccActive.length; i++){var a=ccActive[i]; pCat[a.tx.c]=(pCat[a.tx.c]||0)+a.amt}
  // Cuotas tarjeta personal
  for(var i=0; i<ccActivePersonal.length; i++){var ap=ccActivePersonal[i]; pCatPersonal[ap.tx.c]=(pCatPersonal[ap.tx.c]||0)+ap.amt}
  
  var sh=d.gC||[]; var tS_manual=0; 
  for(var i=0; i<sh.length; i++) tS_manual += (sh[i].m||0);

  var tS_cc = 0;
  for(var p in ccTotalByPerson) tS_cc += ccTotalByPerson[p];
  var tS = tS_manual + tS_cc;
  
  var mStats = [];
  if(mbs.length > 0){
      for(var i=0; i<mbs.length; i++){
          var m = mbs[i];
          var p = iT > 0 ? (m.i||0)/iT : 1/mbs.length;
          
          var aporteEsperado = 0;
          if(useManualAporte){
              aporteEsperado = m.a || 0;
              p = pG > 0 ? (aporteEsperado / pG) : p; 
          } else {
              aporteEsperado = pG * p;
          }
          
          var pS_manual = 0;
          for(var j=0; j<sh.length; j++){
              if(sh[j].p === m.n) pS_manual += (sh[j].m||0);
          }
          var pS_cc = ccTotalByPerson[m.n] || 0;
          var pS_total = pS_manual + pS_cc;

          var cardBill = cardBillByPerson[m.n] || 0;
          
          var cashToHogar = aporteEsperado - pS_total;
          
          var initSobrante = (m.i||0) - aporteEsperado;
          var finalSobrante = (m.i || 0) - cardBill - pS_manual - cashToHogar;

          mStats.push({ 
              n: m.n, 
              i: m.i||0, 
              p: p, 
              a: aporteEsperado, 
              fS: tF * p, 
              paidS_manual: pS_manual,
              paidS_cc: pS_cc,
              paidS: pS_total, 
              fairS: tS * p, 
              bal: pS_total - (tS * p),
              cardBill: cardBill,
              cashToHogar: cashToHogar,
              initSobrante: initSobrante,
              finalSobrante: finalSobrante
          });
      }
  }
  return{iT:iT, mbs:mbs, mStats:mStats, tF:tF, tV:tV, tT:tT, ccActive:ccActive, ccActivePersonal:ccActivePersonal, tG:tG, pG:pG, pA:pA, limit:limit, rest:rest, pCat:pCat, pCatPersonal:pCatPersonal, tS:tS}
}
function cc(){return doCalc(S.data)}

function getAllM(){
  var ms=[];
  for(var i=0;i<localStorage.length;i++){
    var k=localStorage.key(i);
    if(k&&k.indexOf("budget_")===0){
      var p=k.replace("budget_","").split("_");
      if(p.length===2){
          var year = parseInt(p[0]);
          var month = parseInt(p[1]);
          if(!isNaN(year) && !isNaN(month)){
              ms.push({y:year, m:month-1, k:k});
          }
      }
    }
  }
  ms.sort(function(a,b){return a.y!==b.y?a.y-b.y:a.m-b.m});
  return ms;
}

function getPrev(){
  var pm=S.month===0?11:S.month-1;var py=S.month===0?S.year-1:S.year;
  var r=localStorage.getItem(skey(pm,py));return r?JSON.parse(r):null;
}
function scrollTabs(dir){var el=document.getElementById("tabscroll");if(el)el.scrollBy({left:dir*120,behavior:"smooth"});}