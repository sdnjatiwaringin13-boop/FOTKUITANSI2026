(() => {
  const $ = id => document.getElementById(id);
  const API = window.APP_CONFIG?.API_URL || "";
  let current = null;
  let items = [];
  let history = [];
  let settings = {
    nama: "KUITANSI DIGITAL",
    alamat: "Alamat usaha / sekolah",
    telepon: "",
    penandatangan: "Penerima",
    footer: "Terima kasih atas pembayaran Anda.",
    logo: ""
  };

  const today = () => new Date().toISOString().slice(0,10);
  const rupiah = n => new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Math.max(0,Number(n)||0));
  const esc = s => String(s ?? "").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
  const fmtDate = s => s ? new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"long",year:"numeric"}).format(new Date(s+"T00:00:00")) : "-";

  function terbilang(n){
    const w=["nol","satu","dua","tiga","empat","lima","enam","tujuh","delapan","sembilan","sepuluh","sebelas"];
    n=Math.floor(Math.abs(Number(n)||0));
    const f=x=>{
      if(x<12)return w[x]; if(x<20)return w[x-10]+" belas"; if(x<100)return f(Math.floor(x/10))+" puluh"+(x%10?" "+f(x%10):"");
      if(x<200)return "seratus"+(x%100?" "+f(x%100):""); if(x<1000)return f(Math.floor(x/100))+" ratus"+(x%100?" "+f(x%100):"");
      if(x<2000)return "seribu"+(x%1000?" "+f(x%1000):""); if(x<1e6)return f(Math.floor(x/1000))+" ribu"+(x%1000?" "+f(x%1000):"");
      if(x<1e9)return f(Math.floor(x/1e6))+" juta"+(x%1e6?" "+f(x%1e6):"");
      if(x<1e12)return f(Math.floor(x/1e9))+" miliar"+(x%1e9?" "+f(x%1e9):"");
      if(x<1e15)return f(Math.floor(x/1e12))+" triliun"+(x%1e12?" "+f(x%1e12):"");
      return "nilai terlalu besar";
    };
    const x=f(n); return x.charAt(0).toUpperCase()+x.slice(1)+" rupiah";
  }

  function toast(msg){
    $("toast").textContent=msg;
    $("toast").classList.add("show");
    setTimeout(()=>$("toast").classList.remove("show"),2500);
  }

  async function api(action, data={}){
    if(!API){ throw new Error("URL API belum diisi. Buka public/config.js dan isi API_URL."); }
    const body=JSON.stringify({action,...data});
    const res=await fetch(API,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body});
    const json=await res.json();
    if(!json.success) throw new Error(json.message||"Permintaan gagal.");
    return json;
  }

  function blank(){
    current={id:"",number:"",date:today(),payer:"",address:"",method:"Tunai",discount:0,notes:""};
    items=[{description:"",qty:1,price:0}];
    renderForm();
  }

  function renderItems(){
    $("items").innerHTML=`<div class="items-box">
      <div class="item item-head"><div>Deskripsi</div><div>Qty</div><div>Harga</div><div>Jumlah</div><div></div></div>
      ${items.map((it,i)=>`<div class="item">
        <input data-i="${i}" data-k="description" placeholder="Contoh: Pembayaran SPP" value="${esc(it.description)}">
        <input data-i="${i}" data-k="qty" type="number" min="1" value="${it.qty}">
        <input data-i="${i}" data-k="price" type="number" min="0" value="${it.price||""}">
        <strong class="money">${rupiah(it.qty*it.price)}</strong>
        <button class="remove" data-remove="${i}">×</button>
      </div>`).join("")}</div>`;
    $("items").querySelectorAll("input").forEach(el=>el.addEventListener("input",e=>{
      const i=Number(e.target.dataset.i), k=e.target.dataset.k;
      items[i][k]=k==="description"?e.target.value:(Number(e.target.value)||0);
      renderItems(); renderReceipt();
    }));
    $("items").querySelectorAll("[data-remove]").forEach(el=>el.addEventListener("click",()=>{
      const i=Number(el.dataset.remove); items.splice(i,1); if(!items.length)items.push({description:"",qty:1,price:0}); renderItems();renderReceipt();
    }));
  }

  function readForm(){
    current.number=$("number").value.trim(); current.date=$("date").value; current.payer=$("payer").value.trim();
    current.address=$("address").value.trim(); current.method=$("method").value; current.discount=Number($("discount").value)||0; current.notes=$("notes").value.trim();
  }

  function renderForm(){
    $("number").value=current.number||"";
    $("date").value=current.date||today();
    $("payer").value=current.payer||"";
    $("address").value=current.address||"";
    $("method").value=current.method||"Tunai";
    $("discount").value=current.discount||0;
    $("notes").value=current.notes||"";
    renderItems(); renderReceipt();
  }

  function totals(){
    const subtotal=items.reduce((s,x)=>s+(Number(x.qty)||0)*(Number(x.price)||0),0);
    return {subtotal,total:Math.max(0,subtotal-(Number(current.discount)||0))};
  }

  function renderReceipt(){
    const t=totals();
    $("receipt").innerHTML=`
      <div class="rhead">
        ${settings.logo?`<img class="rlogo" src="${esc(settings.logo)}" alt="Logo">`:`<div class="brand-logo">✓</div>`}
        <div><div class="rtitle">${esc(settings.nama)}</div><div class="rsub">${esc(settings.alamat)}</div><div class="rsub">${esc(settings.telepon)}</div></div>
        <div class="rlabel">KUITANSI</div>
      </div>
      <div class="rmeta"><div><span>No. Kuitansi</span><b>${esc(current.number||"-")}</b></div><div><span>Tanggal</span><b>${fmtDate(current.date)}</b></div></div>
      <div class="received"><span>Telah diterima dari</span><b>${esc(current.payer||"................................................")}</b>${current.address?`<small>${esc(current.address)}</small>`:""}</div>
      <table class="rt"><thead><tr><th>No</th><th>Rincian Pembayaran</th><th>Qty</th><th>Jumlah</th></tr></thead><tbody>
      ${items.map((x,i)=>`<tr><td>${i+1}</td><td>${esc(x.description||"-")}</td><td>${x.qty}</td><td>${rupiah(x.qty*x.price)}</td></tr>`).join("")}
      <tr><td colspan="3" class="right">Subtotal</td><td>${rupiah(t.subtotal)}</td></tr>
      <tr><td colspan="3" class="right">Diskon</td><td>${rupiah(current.discount)}</td></tr>
      <tr class="grand"><td colspan="3" class="right">TOTAL</td><td>${rupiah(t.total)}</td></tr>
      </tbody></table>
      <div class="terbilang"><span>Terbilang</span><b>${terbilang(t.total)}</b></div>
      <div class="rnote"><div><span>Metode pembayaran</span><b>${esc(current.method)}</b></div>${current.notes?`<div><span>Catatan</span><b>${esc(current.notes)}</b></div>`:""}</div>
      <div class="sign"><div></div><div>........................, ${fmtDate(current.date)}<div class="space"></div><b>${esc(settings.penandatangan)}</b></div></div>
      <footer>${esc(settings.footer)}</footer>`;
  }

  async function save(){
    readForm();
    if(!current.payer) return toast("Nama penerima wajib diisi.");
    if(!items.some(x=>x.description.trim() && x.price>0)) return toast("Tambahkan item dengan nominal lebih dari Rp0.");
    try{
      $("saveBtn").disabled=true; $("saveBtn").textContent="Menyimpan...";
      const r=await api("saveReceipt",{receipt:{...current,items}});
      current.id=r.data.id; current.number=r.data.number;
      toast("Kuitansi berhasil disimpan ke Spreadsheet.");
      await loadHistory(); renderForm();
    }catch(e){toast(e.message)}finally{$("saveBtn").disabled=false;$("saveBtn").textContent="Simpan Kuitansi";}
  }

  async function loadHistory(){
    try{const r=await api("listReceipts"); history=r.data||[]; renderHistory();}
    catch(e){renderHistory(); if(API)toast(e.message);}
  }

  function renderHistory(){
    const q=$("search").value.toLowerCase();
    const data=history.filter(x=>[x.number,x.payer,...(x.items||[]).map(i=>i.description)].join(" ").toLowerCase().includes(q));
    $("history").innerHTML=data.length?data.map(x=>`
      <div class="history-row">
        <div><b>${esc(x.number)}</b><span>${fmtDate(x.date)} · ${esc(x.payer)}</span><small>${(x.items||[]).map(i=>esc(i.description)).filter(Boolean).join(", ")}</small></div>
        <div class="history-actions"><b>${rupiah(x.total)}</b><br>
          <button class="btn small" data-edit="${esc(x.id)}">Edit</button>
          <button class="btn small" data-print="${esc(x.id)}">Cetak</button>
          <button class="btn small danger" data-delete="${esc(x.id)}">Hapus</button>
        </div>
      </div>`).join(""):`<div class="empty">Belum ada data kuitansi.</div>`;
    document.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>edit(b.dataset.edit));
    document.querySelectorAll("[data-print]").forEach(b=>b.onclick=async()=>{await edit(b.dataset.print);setTimeout(()=>window.print(),150)});
    document.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>del(b.dataset.delete));
  }

  async function edit(id){
    const x=history.find(a=>String(a.id)===String(id)); if(!x)return;
    current={...x}; items=(x.items||[]).map(a=>({...a}));
    $("formTab").classList.remove("hidden");$("historyTab").classList.add("hidden");$("settingsTab").classList.add("hidden");
    document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.tab==="form")); renderForm(); scrollTo({top:0,behavior:"smooth"});
  }

  async function del(id){
    if(!confirm("Hapus kuitansi ini?"))return;
    try{await api("deleteReceipt",{id});toast("Kuitansi dihapus.");await loadHistory();}catch(e){toast(e.message)}
  }

  async function loadSettings(){
    try{const r=await api("getSettings");settings={...settings,...r.data};fillSettings();renderReceipt();$("brandName").textContent=settings.nama||"Kuitansi Digital";}
    catch(e){fillSettings(); if(API)toast(e.message);}
  }

  function fillSettings(){
    $("sName").value=settings.nama||"";$("sAddress").value=settings.alamat||"";$("sPhone").value=settings.telepon||"";
    $("sSigner").value=settings.penandatangan||"";$("sFooter").value=settings.footer||"";$("sLogo").value=settings.logo||"";
  }

  async function saveSettings(){
    settings={nama:$("sName").value.trim()||"KUITANSI DIGITAL",alamat:$("sAddress").value.trim(),telepon:$("sPhone").value.trim(),penandatangan:$("sSigner").value.trim()||"Penerima",footer:$("sFooter").value.trim(),logo:$("sLogo").value.trim()};
    try{await api("saveSettings",{settings});toast("Pengaturan tersimpan.");renderReceipt();$("brandName").textContent=settings.nama;}catch(e){toast(e.message)}
  }

  document.querySelectorAll(".tab").forEach(tab=>tab.onclick=()=>{
    document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));tab.classList.add("active");
    $("formTab").classList.toggle("hidden",tab.dataset.tab!=="form");$("historyTab").classList.toggle("hidden",tab.dataset.tab!=="history");$("settingsTab").classList.toggle("hidden",tab.dataset.tab!=="settings");
    if(tab.dataset.tab==="history")loadHistory();
  });
  $("newBtn").onclick=()=>{blank();document.querySelector('[data-tab="form"]').click()};
  $("resetBtn").onclick=blank;
  $("addItem").onclick=()=>{items.push({description:"",qty:1,price:0});renderItems();renderReceipt()};
  $("saveBtn").onclick=save;
  $("printBtn").onclick=()=>{readForm();renderReceipt();window.print()};
  ["number","date","payer","address","method","discount","notes"].forEach(id=>$(id).addEventListener("input",()=>{readForm();renderReceipt()}));
  $("search").oninput=renderHistory;
  $("saveSettings").onclick=saveSettings;

  blank();
  loadSettings();
  loadHistory();
})();