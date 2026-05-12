// ==========================================
// SECCIÓN DE SINCRONIZACIÓN FIREBASE
// ==========================================
var fbUnsubscribe = null;
var isSyncing = false;
var lastCloudUpdate = 0;
var currentSyncStatus = "Conectando...";

function initFb(){
    if(typeof firebase === 'undefined') return;
    try {
        var cfg = {
            apiKey: "AIzaSyBmeJOmjhwxNoLLCDPo1fxZs_n1YosdQkA",
            authDomain: "presupuestar-15772.firebaseapp.com",
            projectId: "presupuestar-15772",
            storageBucket: "presupuestar-15772.firebasestorage.app",
            messagingSenderId: "514669346941",
            appId: "1:514669346941:web:8287b64a133ea76fd5f114",
            measurementId: "G-NMJRKTZHHF"
        };
        if(!firebase.apps.length) firebase.initializeApp(cfg);
        window.db = firebase.firestore();
        firebase.auth().signInAnonymously().then(function(){
            var hh = localStorage.getItem('budget_fb_household');
            if(hh) listenFb(hh);
        }).catch(function(e){ updateSyncStatus("Error de sesion"); });
    } catch(e) { console.error("Firebase init error", e); }
}

// === BACKUP / RESTORE ===
function backupAll(){
    var backup = {_type:"presupuesto_backup", _date:new Date().toISOString(), months:{}, ccData:{}};
    for(var i=0; i<localStorage.length; i++){
        var k = localStorage.key(i);
        if(k && k.indexOf("budget_20")===0){
            try{ backup.months[k] = JSON.parse(localStorage.getItem(k)); }catch(e){}
        }
    }
    var ccR = localStorage.getItem("budget_cc_data");
    if(ccR){ try{ backup.ccData = JSON.parse(ccR); }catch(e){} }
    var blob = new Blob([JSON.stringify(backup, null, 2)], {type:"application/json"});
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "presupuesto_backup_" + new Date().toISOString().split("T")[0] + ".json";
    a.click();
    URL.revokeObjectURL(url);
    showT("Backup descargado");
}
function restoreBackup(file){
    if(!file) return;
    var reader = new FileReader();
    reader.onload = function(e){
        try{
            var backup = JSON.parse(e.target.result);
            if(backup._type !== "presupuesto_backup"){ showT("Archivo invalido"); return; }
            var count = 0;
            if(backup.months){
                for(var k in backup.months){
                    localStorage.setItem(k, JSON.stringify(backup.months[k]));
                    count++;
                }
            }
            if(backup.ccData){
                localStorage.setItem("budget_cc_data", JSON.stringify(backup.ccData));
                S.ccData = backup.ccData;
            }
            loadD(); render();
            showT("Restaurado: " + count + " meses");
        }catch(err){ showT("Error al restaurar"); }
    };
    reader.readAsText(file);
}

function resetFbCfg(){
    localStorage.removeItem('budget_fb_household');
    showT("Desvinculado del hogar");
    setTimeout(function(){ location.reload(); }, 1000);
}

function makeId(L) {
    var res = ''; var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for ( var i = 0; i < L; i++ ) res += chars.charAt(Math.floor(Math.random() * chars.length));
    return res;
}

function createHousehold(){
    if(!window.db) return showT("Firebase no iniciado");
    var uid = null;
    try { uid = firebase.auth().currentUser ? firebase.auth().currentUser.uid : null; } catch(e){}
    if(!uid) return showT("Sesion no iniciada, recarga la pagina");
    var hh = makeId(12);
    // Crear hogar con el UID como miembro
    var hhDoc = { members: [uid], createdAt: firebase.firestore.FieldValue.serverTimestamp() };
    window.db.collection('households').doc(hh).set(hhDoc).then(function(){
        localStorage.setItem('budget_fb_household', hh);
        SS({showSync:false}); 
        showT("Hogar creado: " + hh);
        listenFb(hh);
        triggerSync();
    }).catch(function(e){
        showT("Error al crear hogar");
        console.error(e);
    });
}

function joinHousehold(){
    var el = document.getElementById('sy-hh');
    var hh = el ? el.value.toUpperCase().trim() : "";
    if(!hh || hh.length < 5) return showT("Codigo invalido");
    if(!window.db) return showT("Firebase no iniciado");
    var uid = null;
    try { uid = firebase.auth().currentUser ? firebase.auth().currentUser.uid : null; } catch(e){}
    if(!uid) return showT("Sesion no iniciada, recarga la pagina");
    // Verificar que existe y agregar UID
    window.db.collection('households').doc(hh).get().then(function(doc){
        if(!doc.exists) return showT("Hogar no encontrado");
        window.db.collection('households').doc(hh).update({
            members: firebase.firestore.FieldValue.arrayUnion(uid)
        }).then(function(){
            localStorage.setItem('budget_fb_household', hh);
            SS({showSync:false}); 
            showT("Vinculado al hogar " + hh);
            listenFb(hh);
        }).catch(function(e){
            showT("No se pudo unir: acceso denegado");
            console.error(e);
        });
    }).catch(function(e){
        showT("Error al buscar hogar");
        console.error(e);
    });
}

function updateSyncStatus(msg){
    currentSyncStatus = msg;
    var el = document.getElementById('sync-status');
    if(el) el.innerHTML = "Estado: " + msg;
}

function triggerSync(){
    var hh = localStorage.getItem('budget_fb_household');
    if(!hh || typeof firebase === 'undefined' || !window.db) return;
    isSyncing = true;
    updateSyncStatus("Sincronizando...");
    
    var allData = { meses: {}, ccData: {} };
    for(var i=0; i<localStorage.length; i++){
        var k = localStorage.key(i);
        if(k && k.indexOf("budget_20")===0){
            allData.meses[k] = JSON.parse(localStorage.getItem(k));
        }
    }
    var ccR = localStorage.getItem('budget_cc_data');
    if(ccR) allData.ccData = JSON.parse(ccR);
    
    allData.timestamp = firebase.firestore.FieldValue.serverTimestamp();
    // Agregar nuestro UID a members para no perderlo con merge
    var uid = null;
    try { uid = firebase.auth().currentUser ? firebase.auth().currentUser.uid : null; } catch(e){}
    if(uid) {
        allData.lastEditBy = uid;
        allData.members = firebase.firestore.FieldValue.arrayUnion(uid);
    }

    window.db.collection('households').doc(hh).set(allData, {merge:true})
        .then(function(){ 
            isSyncing = false; 
            lastCloudUpdate = Date.now();
            updateSyncStatus("Sincronizado"); 
        })
        .catch(function(e){ 
            isSyncing = false; 
            if(e.code === 'permission-denied') updateSyncStatus("Acceso denegado");
            else updateSyncStatus("Error al subir");
            console.error(e);
        });
}

function listenFb(hh){
    if(!window.db || !hh) return;
    if(fbUnsubscribe) fbUnsubscribe();
    
    updateSyncStatus("Conectando...");
    fbUnsubscribe = window.db.collection('households').doc(hh).onSnapshot(function(doc){
        if(isSyncing || (Date.now() - lastCloudUpdate < 2000)) return; 
        
        if(doc.exists){
            var data = doc.data();
            if(data.meses){
                for(var key in data.meses){
                    localStorage.setItem(key, JSON.stringify(data.meses[key]));
                }
            }
            if(data.ccData){
                localStorage.setItem('budget_cc_data', JSON.stringify(data.ccData));
                S.ccData = data.ccData;
            }
            updateSyncStatus("Sincronizado");
            
            var raw = localStorage.getItem(skey(S.month,S.year));
            if(raw) S.data = JSON.parse(raw);
            
            render();
        } else {
            updateSyncStatus("Hogar no existe");
        }
    }, function(err){
        updateSyncStatus("Error de conexion");
    });
}
// ==========================================


function doExport(){
  var c=cc();var d=S.data;
  var csv="PRESUPUESTO "+MO[S.month]+" "+S.year+"\n\nINGRESOS\n";
  for(var i=0;i<(d.mbs||[]).length;i++) csv+=(d.mbs||[])[i].n+","+(d.mbs||[])[i].i+"\n";
  csv+="Total,"+c.iT+"\n\nPORCENTAJES\n";
  for(var i=0;i<(c.mStats||[]).length;i++) csv+=c.mStats[i].n+","+(c.mStats[i].p*100).toFixed(1)+"%\n";
  
  csv+="\nGASTOS FIJOS\nCategoria,Monto";
  for(var i=0;i<(c.mStats||[]).length;i++) csv+=","+c.mStats[i].n;
  csv+="\n";
  for(var i=0;i<d.gF.length;i++){
      var g=d.gF[i]; csv+=g.n+","+g.m;
      for(var j=0;j<(c.mStats||[]).length;j++) csv+=","+Math.round(g.m*c.mStats[j].p);
      csv+="\n";
  }
  csv+="Total,"+c.tF;
  for(var j=0;j<(c.mStats||[]).length;j++) csv+=","+Math.round(c.mStats[j].fS);
  csv+="\n";
  
  csv+="\nGASTOS VARIABLES\nFecha,Descripcion,Categoria,Monto\n";
  var gr=d.gR||[];for(var i=0;i<gr.length;i++){var g=gr[i];csv+=g.f+',"'+g.d+'",'+g.c+","+g.m+"\n"}
  csv+="Total,"+c.tV+"\n\n";
  
  if(c.ccActive.length>0 || c.ccActivePersonal.length>0){
      csv+="TARJETAS (CUOTAS ACTIVAS ESTE MES)\nTarjeta,Tipo,Descripcion,Categoria,Cuota Actual,Monto Cuota\n";
      var allCC = c.ccActive.concat(c.ccActivePersonal);
      for(var i=0;i<allCC.length;i++){
          var a = allCC[i];
          var card = null;
          for(var k=0; k<S.ccData.cards.length; k++){ if(S.ccData.cards[k].id === a.tx.cId){ card = S.ccData.cards[k]; break; } }
          var tipoStr = a.tx.t === "Personal" ? "Personal" : "Hogar";
          csv+=(card?card.b+" "+card.br:"Desconocida")+','+tipoStr+',"'+a.tx.d+'",'+a.tx.c+","+a.currQ+"/"+a.tx.q+","+Math.round(a.amt)+"\n";
      }
      csv+="Total Tarjetas Hogar,"+Math.round(c.tT)+"\n\n";
  }
  
  var gc=d.gC||[];
  if(gc.length>0 && (d.mbs||[]).length>=2){
      csv+="GASTOS COMPARTIDOS\nFecha,Descripcion,Categoria,Monto,Pagado por\n";
      for(var i=0;i<gc.length;i++){var g=gc[i];csv+=g.f+',"'+g.d+'",'+g.c+","+g.m+","+g.p+"\n"}
      csv+="Total,"+c.tS+"\n\nCONCILIACION COMPARTIDOS\nIntegrante,Correspondia,Pago Real,Diferencia\n";
      for(var i=0;i<(c.mStats||[]).length;i++){
          var st = c.mStats[i];
          csv+=st.n+","+Math.round(st.fairS)+","+Math.round(st.paidS)+","+Math.round(st.bal)+"\n";
      }
      csv+="\n";
  }
  if(d.notas)csv+='NOTAS\n"'+d.notas.replace(/"/g,'""')+'"\n\n';
  csv+="RESUMEN\nPresupuesto,"+c.pT+"\nGastado,"+c.tG+"\nSobrante,"+c.sR+"\n";
  var blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});
  var url=URL.createObjectURL(blob);var a=document.createElement("a");a.href=url;a.download="Presupuesto_"+MO[S.month]+"_"+S.year+".csv";a.click();URL.revokeObjectURL(url);
  
  showT("Archivo generado para descargar");
}
