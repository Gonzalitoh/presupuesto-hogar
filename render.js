function render(){
  var c=cc();var d=S.data;if(!d)return;
  if(S.view === "compartidos" && (d.mbs||[]).length < 2) S.view = "dashboard";

  var pp=c.limit>0?Math.min((c.tG/c.limit)*100,100):0;
  var pc=pp>90?"var(--red)":pp>70?"#f59e0b":"var(--green)";
  var h="";

  h+='<div class="hd"><h1>Presupuesto Hogar</h1>';
  var isLinked = localStorage.getItem('budget_fb_household') ? true : false;
  h+='<div class="mn">';
  if(isLinked) h+='<div style="width:34px"></div>'; 
  h+='<button onclick="navM(-1)">&lsaquo;</button>';
  h+='<span class="ml" onclick="openMP()">'+MO[S.month]+" "+S.year+' &#9662;</span>';
  h+='<button onclick="navM(1)">&rsaquo;</button>';
  if(isLinked) h+='<button style="font-size:16px;background:var(--sol-bg);border-color:var(--sol)" onclick="triggerSync()" title="Guardar en la nube">&#128190;</button>';
  h+='</div></div>';

  if(c.mStats.length===0&&!S.showConfig){
    h+='<div class="cb" onclick="openCfg()">&#9881;&#65039; Configurar personas e ingresos</div>';
  }

  var tabList=[["dashboard","Resumen"],["gastos","Gastos"],["tarjetas","Tarjetas"],["fijos","Fijos"],["balance","Balance"]];
  tabList.push(["graficos","&#128202; Evolucion"]);
  tabList.push(["sync","&#128260; Sync"]);

  h+='<div class="tabs-wrap">';
  h+='<button class="tab-arrow" onclick="scrollTabs(-1)">&lsaquo;</button>';
  h+='<div class="tabs" id="tabscroll">';
  for(var i=0;i<tabList.length;i++){
    var t=tabList[i];
    h+='<button class="tb'+(S.view===t[0]?" ac":"")+'" onclick="setV(\''+t[0]+'\')">'+t[1]+'</button>';
  }
  h+='<button class="tb ic" onclick="openCfg()">&#9881;&#65039;</button>';
  h+='<button class="tb ic" onclick="doExport()">&#128229;</button>';
  h+='</div>';
  h+='<button class="tab-arrow" onclick="scrollTabs(1)">&rsaquo;</button>';
  h+='</div>';

  if(S.toast)h+='<div class="toast">'+S.toast+'</div>';

  // === DASHBOARD ===
  if(S.view==="dashboard"){
    h+='<div class="cd"><div style="display:flex;justify-content:space-between;align-items:flex-start">';
    h+='<div><div class="sl">Ingreso Total</div><div style="font-size:22px;font-weight:700">'+fmt(c.iT)+'</div></div>';
    
    if(c.mStats.length > 0){
        var nms=[], inc=[];
        for(var i=0;i<c.mStats.length;i++){
            var pcol = PCOLORS[i % PCOLORS.length];
            nms.push('<span style="color:'+pcol.c+'">'+c.mStats[i].n + ' ' + pctF(c.mStats[i].p)+'</span>');
            inc.push('<span style="color:'+pcol.c+'">'+fmt(c.mStats[i].i)+'</span>');
        }
        h+='<div style="text-align:right"><div style="font-size:11px;color:var(--text3)">'+nms.join(' &middot; ')+'</div>';
        h+='<div style="font-size:13px;margin-top:2px;font-weight:600">'+inc.join(' &middot; ')+'</div></div>';
    } else {
        h+='<div style="text-align:right;cursor:pointer" onclick="openCfg()"><div style="font-size:11px;color:var(--red)">Sin integrantes</div><div style="font-size:13px;margin-top:2px;font-weight:600">Agregar +</div></div>';
    }
    h+='</div></div>';

    h+='<div class="cd"><div style="display:flex;justify-content:space-between;margin-bottom:6px">';
    h+='<span style="font-size:13px;font-weight:600">Gastado vs L&#237;mite (Sin Ahorro)</span>';
    h+='<span style="font-size:13px;font-weight:600;color:'+(c.rest<0?'var(--red)':'var(--green)')+'">'+(c.rest>=0?'Quedan '+fmt(c.rest):'Excedido '+fmt(Math.abs(c.rest)))+'</span></div>';
    h+='<div class="pt"><div class="pf" style="width:'+pp+'%;background:'+pc+'"></div></div>';
    h+='<div class="pl"><span>'+fmt(c.tG)+'</span><span>Límite: '+fmt(c.limit)+'</span></div></div>';

    h+='<div class="g2">';
    h+='<div class="cd sc"><div class="sl">Gastos Fijos</div><div class="sv">'+fmt(c.tF)+'</div></div>';
    h+='<div class="cd sc"><div class="sl">Gastos Variables</div><div class="sv">'+fmt(c.tV)+'</div></div>';
    h+='<div class="cd sc" style="background:var(--sol-bg)"><div class="sl">Tarjetas (Hogar)</div><div class="sv" style="color:var(--sol)">'+fmt(c.tT)+'</div></div>';
    h+='<div class="cd sc" style="background:var(--red-bg)"><div class="sl" style="color:var(--red)">Total Gastos Hogar</div><div class="sv" style="color:var(--red)">'+fmt(c.tG)+'</div></div>';
    h+='<div class="cd sc"><div class="sl">Ahorro Objetivo</div><div class="sv" style="color:var(--green)">'+fmt(c.pA)+'</div></div>';
    h+='<div class="cd sc"><div class="sl">Presup. Libre</div><div class="sv" style="color:'+(c.rest>=0?'var(--green)':'var(--red)')+'">'+fmt(c.rest)+'</div></div>';
    h+='</div>';

    // CC Summary + last installment alerts
    if(c.ccActive.length > 0){
      h+='<div class="cd" style="padding:12px 14px">';
      h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">';
      h+='<span style="font-size:12px;font-weight:600">&#128179; Cuotas activas (Hogar)</span>';
      h+='<span style="font-size:12px;color:var(--sol);font-weight:700">'+fmt(c.tT)+'/mes</span></div>';
      for(var i=0; i<c.ccActive.length; i++){
        var a = c.ccActive[i];
        var isLast = (a.currQ === a.tx.q);
        var labelColor = isLast ? 'var(--green)' : 'var(--text2)';
        var icon = isLast ? '&#10003;' : '&#128179;';
        var extra = isLast ? ' <strong style="color:var(--green)">(&#250;ltima)</strong>' : '';
        h+='<div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;color:'+labelColor+';margin-top:3px">';
        h+='<span>'+icon+' '+esc(a.tx.d)+' ('+a.currQ+'/'+a.tx.q+')'+extra+'</span>';
        h+='<span style="font-weight:600">'+fmt(a.amt)+'</span></div>';
      }
      h+='</div>';
    }

    var cats=[];
    var catKeys=Object.keys(c.pCat);
    for(var i=0; i<catKeys.length; i++) cats.push([catKeys[i], c.pCat[catKeys[i]]]);
    cats.sort(function(a,b){return b[1]-a[1]});
    
    var prevD=getPrev();
    var prevC=prevD?doCalc(prevD):null;
    
    if(cats.length>0){
      h+='<div class="cd"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">';
      h+='<span class="ct" style="margin:0">Por Categoria</span>';
      h+='<button style="font-size:11px;color:var(--sol);background:none;border:none;cursor:pointer;font-weight:600;font-family:inherit" onclick="openCB()">Definir topes &#9656;</button></div>';
      for(var i=0;i<cats.length;i++){
        var cat=cats[i][0];var monto=cats[i][1];
        var tope=d.pC[cat]||0;
        var tGastos = c.tV + c.tT; 
        var catPct=tope>0?(monto/tope)*100:(tGastos>0?(monto/tGastos)*100:0);
        var col=CCOLORS[cat]||"#6366f1";
        var over=tope>0&&monto>tope;
        var trend="";
        if(prevC&&prevC.pCat){var pm2=prevC.pCat[cat]||0;if(pm2>0){var ch=((monto-pm2)/pm2)*100;if(Math.abs(ch)>1){trend='<span class="tbg '+(ch>0?'tu':'td')+'">'+(ch>0?'&uarr;':'&darr;')+' '+Math.abs(ch).toFixed(0)+'%</span>'}}}
        h+='<div class="cbr"><div class="cbh"><span class="cbn">'+cic(cat)+' '+fmtCat(cat)+' '+trend+'</span>';
        h+='<span class="cba">'+fmt(monto)+(tope>0?' / '+fmt(tope):'')+'</span></div>';
        h+='<div class="cbt"><div class="cbf" style="width:'+Math.min(catPct,100)+'%;background:'+(over?'var(--red)':col)+'"></div></div>';
        if(over)h+='<div style="font-size:10px;color:var(--red);margin-top:2px">Excedido en '+fmt(monto-tope)+'</div>';
        h+='</div>';
      }
      h+='</div>';
    }

    if((d.gC||[]).length>0 && (d.mbs||[]).length >= 2){
      h+='<div class="cd" style="background:#f5f5f3"><div class="ct">Gastos compartidos</div>';
      var dts=[], cds=[];
      for(var i=0;i<c.mStats.length;i++){
          var st = c.mStats[i];
          if(st.bal > 1) cds.push(st.n + ' recibe <strong>'+fmt(Math.abs(st.bal))+'</strong>');
          else if(st.bal < -1) dts.push(st.n + ' debe <strong>'+fmt(Math.abs(st.bal))+'</strong>');
      }
      if(dts.length === 0) h+='<p style="font-size:13px;color:var(--text3)">Estan parejos &#128076;</p>';
      else{
          for(var i=0;i<dts.length;i++) h+='<p style="font-size:13px">'+dts[i]+'</p>';
          for(var i=0;i<cds.length;i++) h+='<p style="font-size:13px">'+cds[i]+'</p>';
      }
      h+='</div>';
    }

    h+='<div class="cd"><div class="ct">&#128221; Notas del mes</div>';
    h+='<textarea class="na" onblur="saveNotes(this.value)" placeholder="Anotaciones, recordatorios...">'+esc(d.notas||'')+'</textarea></div>';
  }

  // === GASTOS VARIABLES ===
  if(S.view==="gastos"){
    h+='<button class="bp" style="margin-bottom:12px" onclick="SS({showNewGasto:true})">+ Registrar Gasto Variable</button>';
    var gs=d.gR||[];
    if(gs.length > 3){
      h+='<div style="margin-bottom:10px"><input type="text" placeholder="&#128269; Buscar gasto..." value="'+esc(S.gastoFilter)+'" oninput="S.gastoFilter=this.value;render()" style="padding:8px 12px;font-size:13px"></div>';
    }
    var filtered = [];
    var filt = (S.gastoFilter||"").toLowerCase();
    for(var i=gs.length-1;i>=0;i--){
      var g=gs[i];
      if(filt && g.d.toLowerCase().indexOf(filt)===-1 && g.c.toLowerCase().indexOf(filt)===-1) continue;
      filtered.push(g);
    }
    if(!gs.length)h+='<div class="cd es">No hay gastos variables registrados este mes</div>';
    else if(!filtered.length)h+='<div class="cd es">No se encontraron gastos con "'+esc(S.gastoFilter)+'"</div>';
    else for(var i=0;i<filtered.length;i++){var g=filtered[i];
      h+='<div class="cd gi">';
      h+='<div class="ga" style="background:var(--sol-bg);color:var(--sol)">'+cic(g.c)+'</div>';
      h+='<div class="gf"><div class="gd">'+esc(g.d)+'</div><div class="gm">'+g.c+' &middot; '+g.f+'</div></div>';
      h+='<div class="gv">'+fmt(g.m)+'</div>';
      h+='<button class="gx" style="color:var(--sol);font-size:14px" onclick="openEditG('+g.id+')" title="Editar">&#9998;</button>';
      h+='<button class="gx" onclick="delG('+g.id+')" title="Eliminar">&times;</button></div>';
    }
  }

  // === TARJETAS ===
  if(S.view==="tarjetas"){
      h+='<div class="cd" style="padding:10px 14px"><div style="display:flex;justify-content:space-between;align-items:center">';
      h+='<div style="font-size:12px;color:var(--text2)">';
      if(DOLAR.loading) h+='Cargando cotizacion...';
      else if(DOLAR.oficial > 0) h+='&#128181; Oficial: <strong>'+fmt(DOLAR.oficial)+'</strong> &middot; Tarjeta: <strong>'+fmt(DOLAR.tarjeta)+'</strong> &middot; Blue: <strong>'+fmt(DOLAR.blue)+'</strong>';
      else h+='Cotizacion no disponible';
      h+='</div>';
      h+='<button style="font-size:10px;color:var(--sol);background:none;border:none;cursor:pointer;font-family:inherit" onclick="fetchDolar()">&#8635; Actualizar</button>';
      h+='</div>';
      if(DOLAR.ts) h+='<div style="font-size:9px;color:var(--text3);margin-top:2px">Actualizado: '+DOLAR.ts+' &middot; Imp. Ganancias: '+DOLAR_IMP_PCT+'%</div>';
      h+='</div>';

      h+='<div class="br" style="margin-bottom:12px">';
      if(S.ccData.cards.length>0) h+='<button class="bp" onclick="SS({showNewCCTx:true})">+ Consumo</button>';
      h+='<button class="bs" onclick="SS({showNewCard:true})">+ Tarjeta</button></div>';

      if(S.ccData.cards.length===0){
          h+='<div class="cd es">No hay tarjetas registradas. Agregá una para empezar a sumar consumos en cuotas.</div>';
      }else{
          for(var i=0;i<S.ccData.cards.length;i++){
              var card = S.ccData.cards[i];
              var acts = []; var cTot = 0;
              
              for(var j=0; j<c.ccActive.length; j++){
                  if(c.ccActive[j].tx.cId === card.id){ acts.push(c.ccActive[j]); cTot += c.ccActive[j].amt; }
              }
              for(var j=0; j<c.ccActivePersonal.length; j++){
                  if(c.ccActivePersonal[j].tx.cId === card.id){ acts.push(c.ccActivePersonal[j]); cTot += c.ccActivePersonal[j].amt; }
              }

              var ownerTag = "";
              if(card.p){
                  if(card.p === "Hogar"){
                      ownerTag = ' <span style="font-size:10px;background:var(--sol-bg);color:var(--sol);padding:2px 6px;border-radius:10px;vertical-align:middle;margin-left:6px">Hogar (Conjunta)</span>';
                  } else {
                      var pIdx = -1; for(var k=0; k<(d.mbs||[]).length; k++){ if((d.mbs||[])[k].n === card.p){ pIdx=k; break; } }
                      if (pIdx >= 0) {
                          var pcol = PCOLORS[pIdx % PCOLORS.length];
                          ownerTag = ' <span style="font-size:10px;background:'+pcol.b+';color:'+pcol.c+';padding:2px 6px;border-radius:10px;vertical-align:middle;margin-left:6px">'+card.p+'</span>';
                      }
                  }
              }

              var selectHtml = "";
              if((d.mbs||[]).length >= 2){
                  selectHtml += '<select onchange="updateCardOwner('+card.id+', this.value)" style="font-size:10px; padding:2px; margin-left:6px; border-radius:4px; border:1px solid var(--border); background:var(--bg); color:var(--text2); outline:none; font-weight:600">';
                  selectHtml += '<option value="Hogar" '+(card.p==="Hogar"||!card.p?'selected':'')+'>Hogar (Conjunta)</option>';
                  for(var m=0; m<(d.mbs||[]).length; m++){
                      selectHtml += '<option value="'+d.mbs[m].n+'" '+(card.p===d.mbs[m].n?'selected':'')+'>Titular: '+d.mbs[m].n+'</option>';
                  }
                  selectHtml += '</select>';
              } else {
                  selectHtml = ' <span style="font-size:10px;background:var(--sol-bg);color:var(--sol);padding:2px 6px;border-radius:10px;vertical-align:middle;margin-left:6px">'+(card.p||'Hogar')+'</span>';
              }

              h+='<div class="cd"><div class="cbh" style="align-items:flex-start">';
              h+='<div><span class="ct" style="margin:0; display:flex; align-items:center;">&#128179; '+esc(card.b)+' ('+card.br+') <button class="gx" style="font-size:14px; margin-left:6px; color:var(--sol)" onclick="openEditCard('+card.id+')" title="Editar Tarjeta">&#9998;</button>'+selectHtml+'</span>';
              if(card.dCierre || card.dVenc) h+='<div style="font-size:11px;color:var(--text3);margin-top:4px">Cierre: Día '+ (card.dCierre||'-') +' &middot; Vence: Día '+ (card.dVenc||'-') +'</div>';
              h+='</div><span class="sv" style="margin:0;font-size:16px">'+fmt(cTot)+'</span></div>';

              if(acts.length===0){
                  h+='<div class="es" style="padding:10px">Sin consumos para este mes</div>';
              }else{
                  for(var j=0;j<acts.length;j++){
                      var a = acts[j];
                      var usdInfo = "";
                      if(a.tx.cur === "USD" && a.tx.mUsd){
                        var usdPerQ = a.tx.mUsd / a.tx.q;
                        usdInfo = ' <span style="font-size:10px;color:var(--green);font-weight:400">'+fmtUSD(usdPerQ)+'</span>';
                        var curRate = DOLAR.tarjeta || DOLAR.oficial || 0;
                        if(curRate > 0){
                          var curArs = Math.round(usdPerQ * curRate);
                          var origArs = Math.round(a.amt);
                          if(Math.abs(curArs - origArs) > 10){
                            usdInfo += ' <span style="font-size:9px;color:var(--text3)">(hoy: '+fmt(curArs)+')</span>';
                          }
                        }
                      }
                      
                      var tTag = (a.tx.t === "Personal") ? '<span style="font-size:9px;background:#e5e7eb;color:#4b5563;padding:1px 4px;border-radius:4px;margin-left:4px;font-weight:600">PERSONAL</span>' : '<span style="font-size:9px;background:var(--sol-bg);color:var(--sol);padding:1px 4px;border-radius:4px;margin-left:4px;font-weight:600">HOGAR</span>';
                      
                      h+='<div class="fr"><div class="fn"><div style="font-weight:600">'+esc(a.tx.d)+usdInfo+tTag+' '+(a.currQ===a.tx.q?'<span style="font-size:9px;background:var(--green-bg);color:var(--green);padding:1px 6px;border-radius:4px;font-weight:600">ULTIMA</span> ':'')+' <span style="font-size:11px;color:var(--text3);font-weight:400">'+(a.tx.q>1?'(Cuota '+a.currQ+'/'+a.tx.q+')':'(1 pago)')+'</span></div><div class="gm">'+a.tx.c+'</div></div>';
                      h+='<div class="fv">'+fmt(a.amt)+'</div>';
                      h+='<button class="gx" style="color:var(--sol);font-size:14px" onclick="openEditCCTx('+a.tx.id+')" title="Editar">&#9998;</button>';
                      h+='<button class="gx" onclick="delCCTx('+a.tx.id+')">&times;</button></div>';
                  }
              }
              h+='<button style="font-size:11px;color:var(--red);background:none;border:none;cursor:pointer;margin-top:12px;text-decoration:underline" onclick="SS({showDelCard:'+card.id+'})">Eliminar tarjeta</button>';
              h+='</div>';
          }
      }
  }

  // === FIJOS ===
  if(S.view==="fijos"){
    h+='<div class="cd"><div class="ct">Gastos Fijos Mensuales</div>';
    if(c.mStats.length > 0){
        var pArr=[]; for(var i=0;i<c.mStats.length;i++) pArr.push(c.mStats[i].n+' '+pctF(c.mStats[i].p));
        h+='<div class="cs">Se distribuyen: '+pArr.join(' &middot; ')+'</div>';
    }
    for(var i=0;i<d.gF.length;i++){
      var g=d.gF[i];
      h+='<div class="fr" style="display:flex;align-items:center;padding:8px 0;border-bottom:1px solid #f2f1ed">';
      h+='<span class="fn" style="flex:1;font-size:13px">'+g.n+'</span>';
      h+='<div style="position:relative;width:110px">';
      h+='<span style="position:absolute;left:8px;top:8px;color:var(--text3);font-size:13px">$</span>';
      h+='<input type="number" id="fi-'+i+'" value="'+(g.m||'')+'" style="width:100%;text-align:right;padding:8px;padding-left:20px;border-radius:6px;border:1px solid var(--border);font-size:14px;background:#fafaf8;outline:none" onfocus="this.style.borderColor=\'var(--sol)\'" onblur="this.style.borderColor=\'var(--border)\'">';
      h+='</div></div>';
    }
    
    h+='<button class="bp" style="margin-top:16px" onclick="saveAllFijos()">Guardar Gastos Fijos</button>';
    h+='<div class="ft" style="margin-top:16px;padding-top:12px;border-top:2px solid var(--text)"><span>Total Fijos</span><span>'+fmt(c.tF)+'</span></div>';
    h+='</div>'; 
    
    h+='<div class="cd" style="text-align:center;background:#edeceb"><div class="ct" style="margin-bottom:10px">&#9888;&#65039; Resetear Fijos</div>';
    h+='<button class="bd" style="border-color:var(--red); color:var(--red); background:var(--card)" onclick="SS({showResetFijos:true})">Resetear fijos del mes a $0</button>';
    h+='<p style="font-size:11px;color:var(--text3);margin-top:6px">Esto volver&#225; a 0 todos los montos de esta lista.</p></div>';
    
    if(c.mStats.length > 0){
        h+='<div class="cd"><div class="ct">Distribucion</div><div class="g2" style="display:flex;flex-wrap:wrap;gap:8px">';
        for(var i=0;i<c.mStats.length;i++){
            var st = c.mStats[i];
            var pcol = PCOLORS[i % PCOLORS.length];
            h+='<div class="dc" style="background:'+pcol.b+';flex:1;min-width:45%"><div style="font-size:11px;font-weight:600;color:'+pcol.c+'">'+st.n+'</div><div style="font-size:18px;font-weight:700;color:'+pcol.c+'">'+fmt(st.fS)+'</div></div>';
        }
        h+='</div></div>';
    }
  }

  // === BALANCE ===
  if(S.view==="balance"){
    h+='<div class="cd"><div class="oxauto"><div class="ct">1. Presupuesto del Hogar</div>';
    h+='<table class="tbl"><thead><tr><th>Concepto</th><th class="r">Total</th>';
    for(var i=0;i<c.mStats.length;i++) h+='<th class="r">'+c.mStats[i].n+'</th>';
    h+='</tr></thead><tbody>';
    
    h+='<tr><td>Aporte al Hogar (Base)</td><td class="r">'+fmt(c.pG)+'</td>';
    for(var i=0;i<c.mStats.length;i++) h+='<td class="r">'+fmt(c.mStats[i].a)+'</td>';
    h+='</tr>';
    
    h+='<tr><td>Objetivo Ahorro</td><td class="r" style="color:var(--green)">- '+fmt(c.pA)+'</td>';
    for(var i=0;i<c.mStats.length;i++) h+='<td class="r" style="color:var(--green)">- '+fmt(c.pA*c.mStats[i].p)+'</td>';
    h+='</tr>';
    
    h+='<tr class="tw"><td>L&#237;mite para Gastar</td><td class="r">'+fmt(c.limit)+'</td>';
    for(var i=0;i<c.mStats.length;i++) h+='<td class="r">'+fmt(c.limit*c.mStats[i].p)+'</td>';
    h+='</tr>';
    
    h+='<tr><td>Gastado hasta ahora</td><td class="r" style="color:var(--red)">- '+fmt(c.tG)+'</td>';
    for(var i=0;i<c.mStats.length;i++) h+='<td class="r" style="color:var(--red)">- '+fmt(c.tG*c.mStats[i].p)+'</td>';
    h+='</tr>';
    
    h+='<tr class="tw"><td>Sobrante del Hogar</td><td class="r" style="color:'+(c.rest>=0?'var(--green)':'var(--red)')+'">'+fmt(c.rest)+'</td>';
    for(var i=0;i<c.mStats.length;i++) h+='<td class="r" style="color:'+((c.limit*c.mStats[i].p - c.tG*c.mStats[i].p)>=0?'var(--green)':'var(--red)')+'">'+fmt((c.limit*c.mStats[i].p - c.tG*c.mStats[i].p))+'</td>';
    h+='</tr>';
    h+='</tbody></table></div></div>';

    if(d.mbs && (d.mbs||[]).length >= 2){
        h+='<div class="cd"><div class="oxauto"><div class="ct">2. Balance Personal</div>';
        h+='<table class="tbl"><thead><tr><th>Concepto</th>';
        for(var i=0;i<c.mStats.length;i++) h+='<th class="r">'+c.mStats[i].n+'</th>';
        h+='</tr></thead><tbody>';
        
        h+='<tr><td>Ingreso Personal</td>';
        for(var i=0;i<c.mStats.length;i++) h+='<td class="r">'+fmt(c.mStats[i].i)+'</td>';
        h+='</tr>';
        
        h+='<tr><td style="color:var(--red)">(-) Resumen Tarjetas Propias</td>';
        for(var i=0;i<c.mStats.length;i++) h+='<td class="r" style="color:var(--red)">'+fmt(c.mStats[i].cardBill)+'</td>';
        h+='</tr>';

        h+='<tr><td style="color:var(--text3)">(-) Pagos Manuales (Hogar)</td>';
        for(var i=0;i<c.mStats.length;i++) h+='<td class="r" style="color:var(--text3)">'+fmt(c.mStats[i].paidS_manual)+'</td>';
        h+='</tr>';

        h+='<tr><td style="color:var(--red)">(-) Aporte al Pozo (Restante a Transferir)</td>';
        for(var i=0;i<c.mStats.length;i++){
            var val = c.mStats[i].cashToHogar;
            if(val >= 0) h+='<td class="r" style="color:var(--red)">'+fmt(val)+'</td>';
            else h+='<td class="r" style="color:var(--green)">+ '+fmt(Math.abs(val))+' (A recibir)</td>';
        }
        h+='</tr>';

        h+='<tr class="tw"><td>(=) Sobrante Real (Bolsillo)</td>';
        for(var i=0;i<c.mStats.length;i++) h+='<td class="r" style="color:'+(c.mStats[i].finalSobrante>=0?'var(--green)':'var(--red)')+'">'+fmt(c.mStats[i].finalSobrante)+'</td>';
        h+='</tr>';
        
        h+='</tbody></table></div></div>';
    }
  }

  // === SYNC VIEW ===
  if(S.view==="sync"){
    // Sincronizacion
    h+='<div class="cd" style="text-align:center"><div class="ct">&#128257; Sincronizaci&#243;n de dispositivos</div>';
    h+='<p style="font-size:12px;color:var(--text3);margin-bottom:12px">Vincula tu celular y PC para que los datos se sincronicen automaticamente</p>';
    h+='<button class="bp" onclick="SS({showSync:true})">Vincular dispositivos</button>';
    var isLinked = localStorage.getItem('budget_fb_household') ? true : false;
    
    var stTxt = isLinked ? currentSyncStatus : 'No vinculado';
    var semColor = '#dc2626';
    if(stTxt === 'Sincronizado'){ semColor = '#16a34a'; }
    else if(stTxt === 'Sincronizando...' || stTxt === 'Conectando...'){ semColor = '#d97706'; }
    else if(stTxt === 'Error al subir' || stTxt === 'Error de conexion' || stTxt === 'Error de sesion' || stTxt === 'Hogar no existe'){ semColor = '#dc2626'; }
    else if(!isLinked){ semColor = '#9ca3af'; }
    
    h+='<div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:12px" id="sync-status">';
    h+='<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:'+semColor+';flex-shrink:0"></span>';
    h+='<span style="font-size:12px;color:var(--text2);font-weight:600">'+stTxt+'</span></div>';
    if(isLinked){
        h+='<button class="bs" style="margin-top:10px;font-size:12px;padding:8px 0" onclick="triggerSync()">&#8635; Forzar sincronizaci&#243;n</button>';
    }
    h+='</div>';

    // Backup
    h+='<div class="cd" style="text-align:center"><div class="ct">&#128190; Backup de datos</div>';
    h+='<p style="font-size:12px;color:var(--text3);margin-bottom:10px">Descarga un archivo con todos tus datos como respaldo, o restaura desde un backup anterior</p>';
    h+='<div class="br"><button class="bs" onclick="backupAll()">&#128229; Descargar Backup</button>';
    h+='<button class="bs" onclick="document.getElementById(\'restore-file\').click()">&#128228; Restaurar Backup</button></div>';
    h+='<input type="file" id="restore-file" accept=".json" style="display:none" onchange="restoreBackup(this.files[0])">';
    h+='</div>';

    // Zona peligrosa
    h+='<div class="cd" style="text-align:center;background:#edeceb"><div class="ct" style="margin-bottom:10px">&#9888;&#65039; Zona peligrosa</div>';
    h+='<button class="bd" style="border-color:var(--red);color:var(--red);background:var(--card)" onclick="SS({showReset:true})">Borrar datos del Mes</button>';
    h+='<p style="font-size:11px;color:var(--text3);margin-top:6px">Esto vaciar&#225; &#250;nicamente los registros de '+MO[S.month]+' '+S.year+'</p></div>';
  }

  // === COMPARTIDOS ===
  if(S.view==="compartidos"){
    h+='<div class="cd"><div class="ct">Gastos Compartidos</div>';
    h+='<p style="font-size:12px;color:var(--text2)">Gastos generales pagados desde la cuenta personal de un integrante.</p></div>';
    h+='<button class="bp" style="margin-bottom:12px" onclick="SS({showNewShared:true})">+ Registrar Gasto Compartido</button>';
    var sh=d.gC||[];
    if(!sh.length && c.ccActive.length === 0) h+='<div class="cd es">No hay gastos compartidos ni consumos de tarjeta asignados al hogar este mes.</div>';
    else{
      for(var i=sh.length-1;i>=0;i--){var g=sh[i];
        var pIdx = -1; for(var k=0; k<(d.mbs||[]).length; k++){ if((d.mbs||[])[k].n===g.p){ pIdx=k; break; } }
        var pcol = pIdx >= 0 ? PCOLORS[pIdx % PCOLORS.length] : {c:"var(--accent)", b:"var(--bg)"};
        h+='<div class="cd gi"><div class="ga" style="background:'+pcol.b+';color:'+pcol.c+'">'+g.p.charAt(0).toUpperCase()+'</div>';
        h+='<div class="gf"><div class="gd">'+esc(g.d)+'</div><div class="gm">'+g.c+' &middot; '+g.f+'</div></div>';
        h+='<div class="gv">'+fmt(g.m)+'</div>';
        h+='<button class="gx" onclick="delS('+g.id+')">&times;</button></div>';
      }
      h+='<div class="cd"><div class="ct">Conciliacion</div><div class="oxauto">';
      h+='<table class="tbl"><thead><tr><th>Concepto</th>';
      for(var i=0;i<c.mStats.length;i++) h+='<th class="r">'+c.mStats[i].n+'</th>';
      h+='</tr></thead><tbody>';
      
      h+='<tr><td>Le correspondia (Manual + Tarjetas)</td>';
      for(var i=0;i<c.mStats.length;i++) h+='<td class="r">'+fmt(c.mStats[i].fairS)+'</td>';
      h+='</tr>';
      
      h+='<tr><td style="color:var(--text3)">Aport&#243; Manualmente</td>';
      for(var i=0;i<c.mStats.length;i++) h+='<td class="r" style="color:var(--text3)">'+fmt(c.mStats[i].paidS_manual)+'</td>';
      h+='</tr>';

      h+='<tr><td style="color:var(--text3)">Aport&#243; con Tarjetas</td>';
      for(var i=0;i<c.mStats.length;i++) h+='<td class="r" style="color:var(--text3)">'+fmt(c.mStats[i].paidS_cc)+'</td>';
      h+='</tr>';
      
      h+='<tr style="font-weight:600"><td>Total Aportado</td>';
      for(var i=0;i<c.mStats.length;i++) h+='<td class="r">'+fmt(c.mStats[i].paidS)+'</td>';
      h+='</tr>';
      
      h+='<tr class="tw"><td>Diferencia</td>';
      for(var i=0;i<c.mStats.length;i++){
          var st = c.mStats[i];
          var col = st.bal > 1 ? 'var(--green)' : st.bal < -1 ? 'var(--red)' : 'var(--text3)';
          h+='<td class="r" style="color:'+col+'">'+fmt(st.bal)+'</td>';
      }
      h+='</tr></tbody></table></div>';
      
      h+='<div class="cr" style="background:#f5f5f3">';
      var dts=[], cds=[];
      for(var i=0;i<c.mStats.length;i++){
          var st = c.mStats[i];
          if(st.bal > 1) cds.push(st.n + ' recibe ' + fmt(Math.abs(st.bal)));
          else if(st.bal < -1) dts.push(st.n + ' transfiere ' + fmt(Math.abs(st.bal)));
      }
      if(dts.length === 0) h+='Estan parejos &#128076;';
      else h+= dts.join('<br>') + '<div style="margin:4px 0"></div>' + cds.join('<br>');
      h+='</div></div>';
    }
  }

  // === GRAFICOS ===
  if(S.view==="graficos"){
    var am=getAllM();
    if(am.length<1){h+='<div class="cd es">Carga al menos un mes para ver la evolucion</div>'}
    else{
      var md=[];
      for(var i=0;i<am.length;i++){
          var r=localStorage.getItem(am[i].k);
          var dd=r?JSON.parse(r):mkD(am[i].m,am[i].y);
          md.push({y:am[i].y,m:am[i].m,d:dd,c:doCalc(dd)});
      }
      var mx=1;for(var i=0;i<md.length;i++){if(md[i].c.tG>mx)mx=md[i].c.tG;if(md[i].c.limit>mx)mx=md[i].c.limit}
      var bH=150;

      h+='<div class="cd"><div class="ct">Gastos por Mes</div>';
      h+='<div style="position:relative;width:100%;overflow-x:auto"><div class="bars" style="min-height:'+(bH+40)+'px;position:relative">';
      var ap=0;for(var i=0;i<md.length;i++)ap+=md[i].c.limit;ap=ap/md.length;
      if(ap>0){var ly=bH-(ap/mx)*bH;h+='<div class="bline" style="top:'+(ly+30)+'px"><span class="bll">L&#237;mite '+fK(ap)+'</span></div>'}
      for(var i=0;i<md.length;i++){var m=md[i];
        var hF=(m.c.tF/mx)*bH;var hV=(m.c.tV/mx)*bH;var hT=(m.c.tT/mx)*bH;
        h+='<div class="bcol"><div class="bval">'+fK(m.c.tG)+'</div>';
        h+='<div style="display:flex;flex-direction:column;align-items:center">';
        h+='<div class="bar" style="height:'+hT+'px;background:var(--sol)"></div>';
        h+='<div class="bar" style="height:'+hV+'px;background:var(--accent);border-radius:0"></div>';
        h+='<div class="bar" style="height:'+hF+'px;background:var(--text3);border-radius:0"></div>';
        h+='</div><div class="blbl">'+MS[m.m]+'<br>'+m.y+'</div></div>';
      }
      h+='</div></div>';
      h+='<div class="leg">';
      h+='<span><span class="ldot" style="background:var(--sol)"></span>Tarjetas</span>';
      h+='<span><span class="ldot" style="background:var(--accent)"></span>Variables</span>';
      h+='<span><span class="ldot" style="background:var(--text3)"></span>Fijos</span>';
      h+='<span><span class="ldot" style="background:var(--yellow);border-radius:0;height:2px;width:12px;vertical-align:middle"></span>L&#237;mite Gasto</span></div></div>';

      var acum=0;var ahs=[];for(var i=0;i<md.length;i++){acum+=md[i].c.rest;ahs.push({m:md[i].m,y:md[i].y,acum:acum})}
      var mxA=1;for(var i=0;i<ahs.length;i++){if(Math.abs(ahs[i].acum)>mxA)mxA=Math.abs(ahs[i].acum)}
      h+='<div class="cd"><div class="ct">Sobrante Acumulado</div>';
      h+='<div style="width:100%;overflow-x:auto"><div class="bars" style="min-height:'+(bH+40)+'px">';
      for(var i=0;i<ahs.length;i++){var a=ahs[i];var bh=Math.abs(a.acum/mxA)*bH;var col=a.acum>=0?"var(--green)":"var(--red)";
        h+='<div class="bcol"><div class="bval" style="color:'+col+'">'+fK(a.acum)+'</div>';
        h+='<div style="display:flex;flex-direction:column;align-items:center"><div class="bar" style="height:'+bh+'px;background:'+col+'"></div></div>';
        h+='<div class="blbl">'+MS[a.m]+'</div></div>';
      }
      h+='</div></div></div>';

      var allC={};
      for(var i=0;i<md.length;i++){
          var ks=Object.keys(md[i].c.pCat);
          for(var j=0;j<ks.length;j++) allC[ks[j]]=true;
      }
      var allCK=Object.keys(allC);
      if(allCK.length>0){
        h+='<div class="cd"><div class="ct">Categorias por Mes</div><div class="oxauto"><table class="tbl"><thead><tr><th>Categoria</th>';
        for(var i=0;i<md.length;i++)h+='<th class="r">'+MS[md[i].m]+'</th>';
        h+='</tr></thead><tbody>';
        for(var j=0;j<allCK.length;j++){var cat=allCK[j];h+='<tr><td style="white-space:nowrap;font-size:11px">'+cat+'</td>';
          for(var i=0;i<md.length;i++){var v=md[i].c.pCat[cat]||0;h+='<td class="r" style="font-size:11px">'+(v>0?fK(v):'-')+'</td>'}h+='</tr>'}
        h+='<tr class="tw"><td>Total</td>';for(var i=0;i<md.length;i++)h+='<td class="r">'+fK(md[i].c.tV + md[i].c.tT)+'</td>';
        h+='</tr></tbody></table></div></div>';
      }

      h+='<div class="cd"><div class="ct">Ingresos vs Gastos</div><div class="oxauto"><table class="tbl"><thead><tr><th>Mes</th><th class="r">Ingresos</th><th class="r">Total Gastos</th><th class="r">Sobrante</th></tr></thead><tbody>';
      for(var i=0;i<md.length;i++){var m=md[i];h+='<tr><td>'+MS[m.m]+' '+m.y+'</td><td class="r">'+fK(m.c.iT)+'</td><td class="r">'+fK(m.c.tG)+'</td><td class="r" style="color:'+(m.c.rest>=0?'var(--green)':'var(--red)')+'">'+fK(m.c.rest)+'</td></tr>'}
      h+='</tbody></table></div></div>';
    }
  }

  // === MODALS GLOBALES ===
  if(S.showMP){
    h+='<div class="mo" onclick="closeM(event)"><div class="ms" onclick="event.stopPropagation()"><div class="mh"></div>';
    h+='<div style="display:flex;justify-content:space-between;align-items:center;font-size:18px;font-weight:700;margin-bottom:10px">';
    h+='<button class="gx" style="padding:4px 16px;color:var(--text)" onclick="changeMPY(-1)">&lsaquo;</button>';
    h+='<span>'+S.mpY+'</span>';
    h+='<button class="gx" style="padding:4px 16px;color:var(--text)" onclick="changeMPY(1)">&rsaquo;</button></div>';
    h+='<div class="mpg">';
    for(var i=0;i<12;i++){
        var isAc = (S.mpY===S.year && i===S.month);
        h+='<button class="mpb'+(isAc?' ac':'')+'" onclick="selM('+i+')">'+MS[i]+'</button>';
    }
    h+='</div></div></div>';
  }

  // MODAL FIREBASE SYNC
  if(S.showSync){
    h+='<div class="mo" onclick="closeM(event)"><div class="ms" onclick="event.stopPropagation()"><div class="mh"></div>';
    h+='<div class="ct" style="margin-bottom:16px">&#128257; Vincular dispositivos</div>';
    
    var fbHousehold = localStorage.getItem('budget_fb_household');
    
    if(!fbHousehold) {
        h+='<p style="font-size:13px;color:var(--text2);margin-bottom:16px">Sincroniza tus datos entre celular y PC. Uno crea el hogar y le pasa el codigo al otro.</p>';
        h+='<button class="bp" style="margin-bottom:16px" onclick="createHousehold()">Crear nuevo hogar</button>';
        h+='<div style="text-align:center;color:var(--text3);margin-bottom:16px">&mdash; o &mdash;</div>';
        h+='<label class="il">Tengo un codigo de hogar</label>';
        h+='<input type="text" id="sy-hh" placeholder="Ej: ABC123XYZ456" style="text-align:center;letter-spacing:3px;font-weight:bold;margin-bottom:8px;text-transform:uppercase;font-size:16px">';
        h+='<button class="bs" onclick="joinHousehold()">Unirse al hogar</button>';
    } else {
        h+='<div class="cd sc" style="background:var(--green-bg);color:var(--green);border:1px solid var(--green)">';
        h+='Vinculado al hogar:<br><strong style="font-size:24px;letter-spacing:3px;display:block;margin-top:6px">'+fbHousehold+'</strong></div>';
        h+='<p style="font-size:12px;color:var(--text3);text-align:center;margin-bottom:12px">Comparti este codigo con tu pareja para vincular sus dispositivos</p>';
        h+='<button class="bd" style="margin-top:8px" onclick="resetFbCfg()">Desvincular dispositivo</button>';
    }
    
    h+='<div class="br" style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border)"><button class="bs" style="border:none;background:var(--bg)" onclick="SS({showSync:false})">Cerrar</button></div>';
    h+='</div></div>';
  }

  if(S.showConfig){
    h+='<div class="mo" onclick="closeM(event)"><div class="ms" onclick="event.stopPropagation()"><div class="mh"></div>';
    h+='<div class="ct" style="margin-bottom:16px">&#9881;&#65039; Configuracion del mes</div>';
    
    h+='<div class="ig" style="margin-bottom:8px"><label class="il">Integrantes</label></div>';
    if(S.cfgD.mbs.length === 0) h+='<div class="es" style="padding:10px;margin-bottom:10px;border:1px dashed #ccc;border-radius:8px">No hay personas configuradas.</div>';
    for(var i=0;i<S.cfgD.mbs.length;i++){
        h+='<div class="cd" style="padding:12px;margin-bottom:8px;background:#fafaf8;box-shadow:none;border:1px solid var(--border)">';
        h+='<div class="br" style="margin-top:0;margin-bottom:8px">';
        h+='<input type="text" id="c-mn-'+i+'" value="'+esc(S.cfgD.mbs[i].n)+'" placeholder="Nombre">';
        h+='<button class="bd" style="flex:0 0 40px;font-size:18px;padding:0" onclick="rmMb('+i+')">&times;</button>';
        h+='</div>';
        h+='<div class="br" style="margin-top:0">';
        h+='<div style="flex:1"><label style="font-size:10px;color:var(--text2);margin-bottom:2px;display:block">Ingreso $</label><input type="number" id="c-mi-'+i+'" value="'+(S.cfgD.mbs[i].i||'')+'" placeholder="0"></div>';
        h+='<div style="flex:1"><label style="font-size:10px;color:var(--text2);margin-bottom:2px;display:block">Aporte Hogar $</label><input type="number" id="c-ma-'+i+'" value="'+(S.cfgD.mbs[i].a||'')+'" placeholder="(Opcional)"></div>';
        h+='</div></div>';
    }
    h+='<button class="bs" style="margin-bottom:16px" onclick="addMb()">+ Agregar persona</button>';
    
    h+='<div class="ig"><label class="il">Presupuesto Gastos Maximos (Se ignora si fijas aportes manuales)</label><input type="number" id="c-pG" value="'+(S.cfgD.pG||'')+'" placeholder="0"></div>';
    h+='<div class="ig"><label class="il">Objetivo Ahorro</label><input type="number" id="c-pA" value="'+(S.cfgD.pA||'')+'" placeholder="0"></div>';
    h+='<div class="br"><button class="bp" onclick="saveCfg()">Guardar</button><button class="bs" onclick="SS({showConfig:false})">Cancelar</button></div>';
    h+='</div></div>';
  }

  // Modals Tarjetas
  if(S.showNewCard){
      h+='<div class="mo" onclick="closeM(event)"><div class="ms" onclick="event.stopPropagation()"><div class="mh"></div>';
      h+='<div class="ct" style="margin-bottom:16px">Agregar Nueva Tarjeta</div>';
      h+='<div class="ig"><label class="il">Banco (Ej: Santander, Galicia, BBVA)</label><input type="text" id="nc-b" value="'+esc(S.nCard.b)+'" placeholder="Banco"></div>';
      h+='<div class="ig"><label class="il">Marca de la Tarjeta</label><select id="nc-br">';
      var brs=["Visa","Mastercard","American Express","Cabal","Naranja","Otra"];
      for(var i=0;i<brs.length;i++)h+='<option value="'+brs[i]+'"'+(brs[i]===S.nCard.br?' selected':'')+'>'+brs[i]+'</option>';
      h+='</select></div>';
      
      h+='<div class="br" style="margin-bottom:12px">';
      h+='<div class="ig" style="margin-bottom:0"><label class="il">Día Cierre (Ej: 24)</label><input type="number" id="nc-cierre" value="'+esc(S.nCard.dCierre)+'" min="1" max="31" placeholder="24"></div>';
      h+='<div class="ig" style="margin-bottom:0"><label class="il">Día Venc. (Ej: 4)</label><input type="number" id="nc-venc" value="'+esc(S.nCard.dVenc)+'" min="1" max="31" placeholder="4"></div>';
      h+='</div>';

      if(d.mbs && (d.mbs||[]).length >= 2){
          h+='<div class="ig"><label class="il">Titular de la Tarjeta</label><div class="tr" style="flex-wrap:wrap">';
          var isHogar = (S.nCard.p === "Hogar");
          h+='<button class="tg" style="'+(isHogar?'background:var(--sol-bg);border-color:var(--sol);color:var(--sol)':'background:var(--card);border-color:var(--border);color:var(--text)')+'" onclick="syncNewCard();S.nCard.p=\'Hogar\';render()">Hogar (Conjunta)</button>';
          for(var i=0;i<(d.mbs||[]).length;i++){
              var nm = (d.mbs||[])[i].n;
              var pcol = PCOLORS[i % PCOLORS.length];
              var isSel = (S.nCard.p===nm);
              var bg = isSel ? pcol.b : 'var(--card)';
              var bd = isSel ? pcol.c : 'var(--border)';
              var tc = isSel ? pcol.c : 'var(--text)';
              h+='<button class="tg" style="background:'+bg+';border-color:'+bd+';color:'+tc+'" onclick="syncNewCard();S.nCard.p=\''+nm+'\';render()">'+nm+'</button>';
          }
          h+='</div></div>';
      }

      h+='<div class="br"><button class="bp" onclick="addCard()">Crear</button><button class="bs" onclick="SS({showNewCard:false})">Cancelar</button></div>';
      h+='</div></div>';
  }

  if(S.showNewCCTx){
      h+='<div class="mo" onclick="closeM(event)"><div class="ms" onclick="event.stopPropagation()"><div class="mh"></div>';
      h+='<div class="ct" style="margin-bottom:16px">Nuevo Consumo en Tarjeta</div>';
      h+='<div class="ig"><label class="il">&#191;Con que tarjeta compraste?</label><select id="nx-cid">';
      for(var i=0;i<S.ccData.cards.length;i++){
          var cd=S.ccData.cards[i];
          h+='<option value="'+cd.id+'"'+(cd.id===S.nCCTx.cId?' selected':'')+'>'+cd.b+' ('+cd.br+')</option>';
      }
      h+='</select></div>';
      
      h+='<div class="ig"><label class="il">Tipo de Gasto</label><div class="tr">';
      h+='<button class="tg" style="'+(S.nCCTx.t==="Hogar"?'background:var(--sol-bg);border-color:var(--sol);color:var(--sol)':'')+'" onclick="syncNewCCTx();S.nCCTx.t=\'Hogar\';render()">&#127968; Hogar (Compartido)</button>';
      h+='<button class="tg" style="'+(S.nCCTx.t==="Personal"?'background:#f3f4f6;border-color:#9ca3af;color:#4b5563':'')+'" onclick="syncNewCCTx();S.nCCTx.t=\'Personal\';render()">&#128100; Personal</button>';
      h+='</div></div>';

      h+='<div class="ig"><label class="il">Descripcion</label><input type="text" id="nx-d" value="'+esc(S.nCCTx.d)+'" placeholder="Ej: Supermercado, Zapatillas..."></div>';

      // Currency toggle
      h+='<div class="ig"><label class="il">Moneda</label><div class="tr">';
      h+='<button class="tg" style="'+(S.nCCTx.cur==="ARS"?'background:var(--sol-bg);border-color:var(--sol);color:var(--sol)':'')+'" onclick="syncNewCCTx();setCCCur(\'ARS\')">$ ARS</button>';
      h+='<button class="tg" style="'+(S.nCCTx.cur==="USD"?'background:var(--green-bg);border-color:var(--green);color:var(--green)':'')+'" onclick="syncNewCCTx();setCCCur(\'USD\')">US$ USD</button>';
      h+='</div></div>';

      if(S.nCCTx.cur==="USD"){
        h+='<div class="ig"><label class="il">¿Cómo vas a pagar este consumo?</label><div class="tr">';
        h+='<button class="tg" style="'+(S.nCCTx.payM==="ARS"?'background:var(--sol-bg);border-color:var(--sol);color:var(--sol)':'')+'" onclick="S.nCCTx.payM=\'ARS\';calcUsdToArs();render()">En Pesos</button>';
        h+='<button class="tg" style="'+(S.nCCTx.payM==="USD"?'background:var(--green-bg);border-color:var(--green);color:var(--green)':'')+'" onclick="S.nCCTx.payM=\'USD\';calcUsdToArs();render()">En Dólares</button>';
        h+='</div></div>';

        h+='<div class="ig"><label class="il">Monto en USD</label><input type="number" id="nx-musd" value="'+(S.nCCTx.mUsd||'')+'" placeholder="0.00" step="0.01" oninput="calcUsdToArs()"></div>';
        
        var rateInfo = S.nCCTx.payM === "USD" ? (DOLAR.oficial||0) : (DOLAR.tarjeta || DOLAR.oficial || 0);
        var impLabel = S.nCCTx.payM === "USD" ? "Dólar Oficial (Sin impuestos)" : "Dólar Tarjeta";
        
        h+='<div class="cd" style="background:var(--green-bg);padding:10px;margin-bottom:12px">';
        if(rateInfo > 0){
          h+='<div style="font-size:11px;color:var(--text3)">Aplicando '+impLabel+': <strong>'+fmt(rateInfo)+'</strong></div>';
          var usdVal = parseFloat(S.nCCTx.mUsd) || 0;
          var arsEquiv = Math.round(usdVal * rateInfo);
          h+='<div style="font-size:16px;font-weight:700;color:var(--green);margin-top:4px" id="usd-equiv">Equiv: '+fmt(arsEquiv)+'</div>';
        }else{
          h+='<div style="font-size:11px;color:var(--red)">Cotización no disponible. <button style="background:none;border:none;color:var(--sol);font-size:11px;cursor:pointer;text-decoration:underline" onclick="fetchDolar()">Reintentar</button></div>';
        }
        h+='</div>';
        h+='<div class="ig"><label class="il">Monto Total en ARS (Equivalencia)</label><input type="number" id="nx-m" value="'+(S.nCCTx.m||'')+'" placeholder="0"></div>';
      }else{
        h+='<div class="ig"><label class="il">Monto Total de la Compra</label><input type="number" id="nx-m" value="'+(S.nCCTx.m||'')+'" placeholder="0"></div>';
      }

      h+='<div class="ig"><label class="il">Cantidad de Cuotas</label><input type="number" id="nx-q" value="'+S.nCCTx.q+'" min="1" placeholder="1"></div>';
      h+='<div class="ig"><label class="il">Categoria</label>'+catSelectOpts("nx-c", S.nCCTx.c)+'</div>';
      h+='<p style="font-size:11px;color:var(--text2);margin-bottom:12px">El consumo comenzar&#225; a verse reflejado a partir de este mes ('+MO[S.month]+').</p>';
      h+='<div class="br"><button class="bp" onclick="addCCTx()">Agregar</button><button class="bs" onclick="SS({showNewCCTx:false})">Cancelar</button></div>';
      h+='</div></div>';
  }

  if(S.showNewGasto){
    var todayStr = new Date().toISOString().split("T")[0];
    h+='<div class="mo" onclick="closeM(event)"><div class="ms" onclick="event.stopPropagation()"><div class="mh"></div>';
    h+='<div class="ct" style="margin-bottom:16px">Sumar Gasto</div>';
    h+='<div class="ig"><label class="il">Descripcion</label><input type="text" id="ng-d" value="'+esc(S.nG.d)+'" placeholder="Ej: Coto compra semanal"></div>';
    h+='<div class="ig"><label class="il">Monto</label><input type="number" id="ng-m" value="'+S.nG.m+'" placeholder="0"></div>';
    h+='<div class="ig"><label class="il">Fecha</label><input type="date" id="ng-f" value="'+(S.nG.f||todayStr)+'"></div>';
    h+='<div class="ig"><label class="il">Categoria</label>'+catSelectOpts("ng-c", S.nG.c)+'</div>';
    if((d.mbs||[]).length >= 1){
      h+='<div class="ig"><label class="il">&#191;De qui&#233;n es este gasto?</label><select id="ng-owner">';
      h+='<option value="Hogar"'+(S.nG.owner==="Hogar"||!S.nG.owner?' selected':'')+'>Hogar (compartido)</option>';
      for(var i=0;i<(d.mbs||[]).length;i++){
        h+='<option value="'+esc((d.mbs||[])[i].n)+'"'+(S.nG.owner===(d.mbs||[])[i].n?' selected':'')+'>Personal: '+esc((d.mbs||[])[i].n)+'</option>';
      }
      h+='</select></div>';
    }
    h+='<div class="br"><button class="bp" onclick="addG()">Agregar</button><button class="bs" onclick="SS({showNewGasto:false})">Cancelar</button></div>';
    h+='</div></div>';
  }

  if(S.showEditG){
    h+='<div class="mo" onclick="closeM(event)"><div class="ms" onclick="event.stopPropagation()"><div class="mh"></div>';
    h+='<div class="ct" style="margin-bottom:16px">Editar Gasto</div>';
    h+='<div class="ig"><label class="il">Descripcion</label><input type="text" id="eg-d" value="'+esc(S.eG.d)+'"></div>';
    h+='<div class="ig"><label class="il">Monto</label><input type="number" id="eg-m" value="'+S.eG.m+'"></div>';
    h+='<div class="ig"><label class="il">Fecha</label><input type="date" id="eg-f" value="'+(S.eG.f||'')+'"></div>';
    h+='<div class="ig"><label class="il">Categoria</label>'+catSelectOpts("eg-c", S.eG.c)+'</div>';
    if((d.mbs||[]).length >= 1){
      h+='<div class="ig"><label class="il">&#191;De qui&#233;n es este gasto?</label><select id="eg-owner">';
      h+='<option value="Hogar"'+(S.eG.owner==="Hogar"||!S.eG.owner?' selected':'')+'>Hogar (compartido)</option>';
      for(var i=0;i<(d.mbs||[]).length;i++){
        h+='<option value="'+esc((d.mbs||[])[i].n)+'"'+(S.eG.owner===(d.mbs||[])[i].n?' selected':'')+'>Personal: '+esc((d.mbs||[])[i].n)+'</option>';
      }
      h+='</select></div>';
    }
    h+='<div class="br"><button class="bp" onclick="saveEditG()">Guardar</button><button class="bs" onclick="SS({showEditG:0})">Cancelar</button></div>';
    h+='</div></div>';
  }

  if(S.showNewShared){
    h+='<div class="mo" onclick="closeM(event)"><div class="ms" onclick="event.stopPropagation()"><div class="mh"></div>';
    h+='<div class="ct" style="margin-bottom:16px">Nuevo gasto compartido</div>';
    h+='<div class="ig"><label class="il">Descripcion</label><input type="text" id="ns-d" value="'+esc(S.nS.d)+'" placeholder="Ej: Cena aniversario"></div>';
    h+='<div class="ig"><label class="il">Monto</label><input type="number" id="ns-m" value="'+S.nS.m+'" placeholder="0"></div>';
    h+='<div class="ig"><label class="il">Categoria</label>'+catSelectOpts("ns-c", S.nS.c)+'</div>';
    
    h+='<div class="ig"><label class="il">Pagado por</label><div class="tr" style="flex-wrap:wrap">';
    for(var i=0;i<(d.mbs||[]).length;i++){
        var nm = (d.mbs||[])[i].n;
        var pcol = PCOLORS[i % PCOLORS.length];
        var isSel = (S.nS.p===nm);
        var bg = isSel ? pcol.b : 'var(--card)';
        var bd = isSel ? pcol.c : 'var(--border)';
        var tc = isSel ? pcol.c : 'var(--text)';
        h+='<button class="tg" style="background:'+bg+';border-color:'+bd+';color:'+tc+'" onclick="S.nS.p=\''+nm+'\';render()">'+nm+'</button>';
    }
    h+='</div></div>';
    h+='<div class="br"><button class="bp" onclick="addS()">Agregar</button><button class="bs" onclick="SS({showNewShared:false})">Cancelar</button></div>';
    h+='</div></div>';
  }

  if(S.showCB){
    h+='<div class="mo" onclick="closeM(event)"><div class="ms" onclick="event.stopPropagation()"><div class="mh"></div>';
    h+='<div class="ct" style="margin-bottom:4px">Topes por Categoria</div>';
    h+='<p style="font-size:12px;color:var(--text3);margin-bottom:14px">Defini un maximo mensual. Deja en 0 si no queres limitar.</p>';
    for(var i=0;i<CV.length;i++){
      var cat=CV[i];var cid="cb-"+cat.replace(/[^a-zA-Z]/g,"");
      h+='<div class="ig" style="margin-bottom:8px"><label class="il">'+cic(cat)+' '+cat+'</label>';
      h+='<input type="number" id="'+cid+'" value="'+(S.cbD[cat]||'')+'" placeholder="Sin tope"></div>';
    }
    h+='<div class="br"><button class="bp" onclick="saveCB()">Guardar</button><button class="bs" onclick="SS({showCB:false})">Cancelar</button></div>';
    h+='</div></div>';
  }

  if(S.showReset){
    h+='<div class="mo" onclick="closeM(event)"><div class="ms" onclick="event.stopPropagation()"><div class="mh"></div>';
    h+='<div class="ct" style="margin-bottom:10px">&#9888;&#65039; Borrar datos de '+MO[S.month]+' '+S.year+'</div>';
    h+='<p style="font-size:13px;color:var(--text2);margin-bottom:16px">Esta accion elimina permanentemente los datos cargados en <strong>este mes especifico</strong> (Gastos, Fijos). Los consumos de tarjeta no se eliminarán ya que son globales. No se puede deshacer.</p>';
    h+='<div class="br"><button class="bd" onclick="doResetMonth()">Si, borrar este mes</button><button class="bs" onclick="SS({showReset:false})">Cancelar</button></div>';
    h+='</div></div>';
  }

  if(S.showResetFijos){
    h+='<div class="mo" onclick="closeM(event)"><div class="ms" onclick="event.stopPropagation()"><div class="mh"></div>';
    h+='<div class="ct" style="margin-bottom:10px">Borrar montos fijos</div>';
    h+='<p style="font-size:13px;color:var(--text2);margin-bottom:16px">¿Estas seguro que quieres establecer todos los montos fijos de este mes a $0?</p>';
    h+='<div class="br"><button class="bd" onclick="doResetFijos()">Si, reiniciar a 0</button><button class="bs" onclick="SS({showResetFijos:false})">Cancelar</button></div>';
    h+='</div></div>';
  }

  if(S.showEditCCTx){
    h+='<div class="mo" onclick="closeM(event)"><div class="ms" onclick="event.stopPropagation()"><div class="mh"></div>';
    h+='<div class="ct" style="margin-bottom:16px">Editar Consumo de Tarjeta</div>';
    h+='<div class="ig"><label class="il">Descripcion</label><input type="text" id="ex-d" value="'+esc(S.eCCTx.d)+'"></div>';
    h+='<div class="ig"><label class="il">Monto'+(S.eCCTx.fixed?' mensual':'')+'</label><input type="number" id="ex-m" value="'+S.eCCTx.m+'"></div>';
    h+='<div class="ig"><label class="il">Tipo de gasto</label><div class="tr">';
    h+='<button class="tg" style="'+(S.eCCTx.fixed?'':'background:var(--sol-bg);border-color:var(--sol);color:var(--sol)')+'" onclick="S.eCCTx.fixed=false;render()">En cuotas</button>';
    h+='<button class="tg" style="'+(S.eCCTx.fixed?'background:var(--yellow-bg);border-color:var(--yellow);color:var(--yellow)':'')+'" onclick="S.eCCTx.fixed=true;render()">Fijo mensual</button>';
    h+='</div></div>';
    if(!S.eCCTx.fixed){
      h+='<div class="ig"><label class="il">Cuotas</label><input type="number" id="ex-q" value="'+S.eCCTx.q+'" min="1"></div>';
    }
    h+='<div class="ig"><label class="il">Categoria</label>'+catSelectOpts("ex-c", S.eCCTx.c)+'</div>';
    h+='<div class="ig"><label class="il">Asignacion</label><div class="tr">';
    h+='<button class="tg" style="'+(S.eCCTx.t!=="Personal"?'background:var(--sol-bg);border-color:var(--sol);color:var(--sol)':'')+'" onclick="S.eCCTx.t=\'Hogar\';render()">Hogar</button>';
    h+='<button class="tg" style="'+(S.eCCTx.t==="Personal"?'background:#e5e7eb;border-color:#6b7280;color:#4b5563':'')+'" onclick="S.eCCTx.t=\'Personal\';render()">Personal</button>';
    h+='</div></div>';
    h+='<div class="br"><button class="bp" onclick="saveEditCCTx()">Guardar</button><button class="bs" onclick="SS({showEditCCTx:0})">Cancelar</button></div>';
    h+='</div></div>';
  }

  if(S.showDelCard){
      h+='<div class="mo" onclick="closeM(event)"><div class="ms" onclick="event.stopPropagation()"><div class="mh"></div>';
      h+='<div class="ct" style="margin-bottom:10px">&#9888;&#65039; Eliminar tarjeta</div>';
      h+='<p style="font-size:13px;color:var(--text2);margin-bottom:16px">¿Estás seguro que querés eliminar esta tarjeta y TODO su historial de consumos de todos los meses?</p>';
      h+='<div class="br"><button class="bd" onclick="delCard('+S.showDelCard+')">Si, eliminar</button><button class="bs" onclick="SS({showDelCard:0})">Cancelar</button></div>';
      h+='</div></div>';
  }

  if(S.showEditCard){
      h+='<div class="mo" onclick="closeM(event)"><div class="ms" onclick="event.stopPropagation()"><div class="mh"></div>';
      h+='<div class="ct" style="margin-bottom:16px">Editar Tarjeta</div>';
      h+='<div class="ig"><label class="il">Banco</label><input type="text" id="ec-b" value="'+esc(S.eCard.b)+'"></div>';
      h+='<div class="ig"><label class="il">Marca de la Tarjeta</label><select id="ec-br">';
      var brs=["Visa","Mastercard","American Express","Cabal","Naranja","Otra"];
      for(var i=0;i<brs.length;i++)h+='<option value="'+brs[i]+'"'+(brs[i]===S.eCard.br?' selected':'')+'>'+brs[i]+'</option>';
      h+='</select></div>';
      
      h+='<div class="br" style="margin-bottom:12px">';
      h+='<div class="ig" style="margin-bottom:0"><label class="il">Día Cierre (Ej: 24)</label><input type="number" id="ec-cierre" value="'+esc(S.eCard.dCierre)+'" min="1" max="31"></div>';
      h+='<div class="ig" style="margin-bottom:0"><label class="il">Día Venc. (Ej: 4)</label><input type="number" id="ec-venc" value="'+esc(S.eCard.dVenc)+'" min="1" max="31"></div>';
      h+='</div>';
      
      if(d.mbs && (d.mbs||[]).length >= 2){
          h+='<div class="ig"><label class="il">Titular de la Tarjeta</label><div class="tr" style="flex-wrap:wrap">';
          var isHogar = (S.eCard.p === "Hogar");
          h+='<button class="tg" style="'+(isHogar?'background:var(--sol-bg);border-color:var(--sol);color:var(--sol)':'background:var(--card);border-color:var(--border);color:var(--text)')+'" onclick="S.eCard.p=\'Hogar\';render()">Hogar (Conjunta)</button>';
          for(var i=0;i<(d.mbs||[]).length;i++){
              var nm = (d.mbs||[])[i].n;
              var pcol = PCOLORS[i % PCOLORS.length];
              var isSel = (S.eCard.p===nm);
              var bg = isSel ? pcol.b : 'var(--card)';
              var bd = isSel ? pcol.c : 'var(--border)';
              var tc = isSel ? pcol.c : 'var(--text)';
              h+='<button class="tg" style="background:'+bg+';border-color:'+bd+';color:'+tc+'" onclick="S.eCard.p=\''+nm+'\';render()">'+nm+'</button>';
          }
          h+='</div></div>';
      }

      h+='<div class="br"><button class="bp" onclick="saveEditCard()">Guardar</button><button class="bs" onclick="SS({showEditCard:0})">Cancelar</button></div>';
      h+='</div></div>';
  }

  document.getElementById("app").innerHTML=h;
}