var DOLAR = {oficial:0, tarjeta:0, blue:0, ts:"", loading:false, error:""};
var DOLAR_IMP_PCT = 30;

function fetchDolar(){
  DOLAR.loading = true;
  render();
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "https://dolarapi.com/v1/dolares", true);
  xhr.timeout = 8000;
  xhr.onload = function(){
    if(xhr.status === 200){
      try{
        var data = JSON.parse(xhr.responseText);
        for(var i=0; i<data.length; i++){
          if(data[i].casa === "oficial") DOLAR.oficial = data[i].venta || 0;
          if(data[i].casa === "blue") DOLAR.blue = data[i].venta || 0;
          if(data[i].casa === "tarjeta") DOLAR.tarjeta = data[i].venta || 0;
        }
        if(!DOLAR.tarjeta && DOLAR.oficial > 0){
          DOLAR.tarjeta = Math.round(DOLAR.oficial * (1 + DOLAR_IMP_PCT/100));
        }
        DOLAR.ts = new Date().toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit"});
        DOLAR.error = "";
        localStorage.setItem("ph_dolar_cache", JSON.stringify(DOLAR));
      }catch(e){ DOLAR.error = "Error parseando datos"; }
    } else { DOLAR.error = "Error "+xhr.status; }
    DOLAR.loading = false;
    render();
  };
  xhr.onerror = function(){ DOLAR.loading = false; DOLAR.error = "Sin conexion"; render(); };
  xhr.ontimeout = function(){ DOLAR.loading = false; DOLAR.error = "Timeout"; render(); };
  xhr.send();
}

function loadDolarCache(){
  try{
    var raw = localStorage.getItem("ph_dolar_cache");
    if(raw){ var c = JSON.parse(raw); DOLAR.oficial=c.oficial||0; DOLAR.tarjeta=c.tarjeta||0; DOLAR.blue=c.blue||0; DOLAR.ts=c.ts||""; }
  }catch(e){}
}

function fmtUSD(n){
  if(n==null||isNaN(n))return"US$0";
  return"US$"+Math.abs(Math.round(n*100)/100).toLocaleString("es-AR",{minimumFractionDigits:2});
}

var PCOLORS=[
  {c:"#4f46e5",b:"#eef2ff"}, {c:"#db2777",b:"#fdf2f8"}, {c:"#16a34a",b:"#f0fdf4"},
  {c:"#d97706",b:"#fffbeb"}, {c:"#9333ea",b:"#faf5ff"}, {c:"#0891b2",b:"#cffafe"},
  {c:"#dc2626",b:"#fef2f2"}, {c:"#059669",b:"#d1fae5"}, {c:"#ca8a04",b:"#fef08a"},
  {c:"#475569",b:"#f1f5f9"}
];
