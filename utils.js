function fmt(n){if(n==null||isNaN(n))return"$0";var a=Math.abs(Math.round(n));var s="$"+a.toLocaleString("es-AR");return n<0?"-"+s:s}
function fK(n){if(n==null||isNaN(n))return"$0";var a=Math.abs(n);if(a>=1e6)return(n<0?"-":"")+"$"+(a/1e6).toFixed(1)+"M";if(a>=1e3)return(n<0?"-":"")+"$"+Math.round(a/1e3)+"K";return fmt(n)}
function pctF(n){return(n==null||isNaN(n))?"0%":(n*100).toFixed(1)+"%"}
function skey(m,y){return"budget_"+y+"_"+(m<9?"0":"")+(m+1)}
function esc(s){return(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
function cic(c){return CICONS[c]||"\uD83D\uDCCB"}
function fmtCat(c){
  var idx=c.indexOf("(");
  if(idx===-1) return esc(c);
  return esc(c.substring(0,idx))+'<span style="font-size:0.85em;color:var(--text3);font-weight:400">'+esc(c.substring(idx))+'</span>';
}
function catSelectOpts(selId, selVal){
  var h='<select id="'+selId+'" style="color:'+(selVal?'var(--text)':'var(--text3)')+'" onchange="this.style.color=\'var(--text)\'">';
  h+='<option value=""'+(selVal?'':' selected')+' disabled style="color:var(--text3)">Seleccione una categor&#237;a...</option>';
  for(var i=0;i<CV.length;i++){h+='<option value="'+CV[i]+'" style="color:var(--text)"'+(CV[i]===selVal?' selected':'')+'>'+CV[i]+'</option>';}
  h+='</select>';
  return h;
}
