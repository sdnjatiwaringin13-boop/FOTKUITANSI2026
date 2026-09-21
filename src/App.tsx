import { useEffect, useMemo, useState } from "react";

type Item = {
  id: string;
  description: string;
  qty: number;
  price: number;
};

type Receipt = {
  id: string;
  number: string;
  date: string;
  payer: string;
  payerAddress: string;
  paymentMethod: string;
  notes: string;
  items: Item[];
  discount: number;
  savedAt: string;
};

const STORAGE_KEY = "kuitansi-digital-data-v1";
const SETTINGS_KEY = "kuitansi-digital-settings-v1";

const defaultSettings = {
  businessName: "KUITANSI DIGITAL",
  address: "Alamat usaha / sekolah",
  phone: "Telepon / WhatsApp",
  footer: "Terima kasih atas pembayaran Anda."
};

const today = () => new Date().toISOString().slice(0, 10);

const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(Math.max(0, value || 0));

const numberToWords = (num: number): string => {
  const words = [
    "nol", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan",
    "sembilan", "sepuluh", "sebelas"
  ];
  const n = Math.floor(Math.abs(num));

  const convert = (x: number): string => {
    if (x < 12) return words[x];
    if (x < 20) return `${words[x - 10]} belas`;
    if (x < 100) return `${convert(Math.floor(x / 10))} puluh${x % 10 ? ` ${convert(x % 10)}` : ""}`;
    if (x < 200) return `seratus${x % 100 ? ` ${convert(x % 100)}` : ""}`;
    if (x < 1000) return `${convert(Math.floor(x / 100))} ratus${x % 100 ? ` ${convert(x % 100)}` : ""}`;
    if (x < 2000) return `seribu${x % 1000 ? ` ${convert(x % 1000)}` : ""}`;
    if (x < 1_000_000) return `${convert(Math.floor(x / 1000))} ribu${x % 1000 ? ` ${convert(x % 1000)}` : ""}`;
    if (x < 1_000_000_000) return `${convert(Math.floor(x / 1_000_000))} juta${x % 1_000_000 ? ` ${convert(x % 1_000_000)}` : ""}`;
    if (x < 1_000_000_000_000) return `${convert(Math.floor(x / 1_000_000_000))} miliar${x % 1_000_000_000 ? ` ${convert(x % 1_000_000_000)}` : ""}`;
    if (x < 1_000_000_000_000_000) return `${convert(Math.floor(x / 1_000_000_000_000))} triliun${x % 1_000_000_000_000 ? ` ${convert(x % 1_000_000_000_000)}` : ""}`;
    return "nilai terlalu besar";
  };

  return `${convert(n).replace(/\s+/g, " ").trim()} rupiah`.replace(/^./, c => c.toUpperCase());
};

const formatDate = (value: string) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(`${value}T00:00:00`));
};

const newItem = (): Item => ({
  id: crypto.randomUUID(),
  description: "",
  qty: 1,
  price: 0
});

const emptyReceipt = (): Receipt => ({
  id: crypto.randomUUID(),
  number: `KW-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`,
  date: today(),
  payer: "",
  payerAddress: "",
  paymentMethod: "Tunai",
  notes: "",
  items: [newItem()],
  discount: 0,
  savedAt: new Date().toISOString()
});

function App() {
  const [settings, setSettings] = useState(defaultSettings);
  const [receipt, setReceipt] = useState<Receipt>(emptyReceipt);
  const [history, setHistory] = useState<Receipt[]>([]);
  const [activeTab, setActiveTab] = useState<"buat" | "riwayat" | "pengaturan">("buat");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      if (saved) setHistory(JSON.parse(saved));
      if (savedSettings) setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
    } catch {
      // Ignore corrupted local storage and start clean.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const subtotal = useMemo(
    () => receipt.items.reduce((sum, item) => sum + Math.max(0, item.qty) * Math.max(0, item.price), 0),
    [receipt.items]
  );
  const total = Math.max(0, subtotal - Math.max(0, receipt.discount));

  const updateReceipt = <K extends keyof Receipt>(key: K, value: Receipt[K]) =>
    setReceipt(prev => ({ ...prev, [key]: value }));

  const updateItem = (id: string, key: keyof Item, value: string | number) => {
    setReceipt(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [key]: value } : item)
    }));
  };

  const addItem = () =>
    setReceipt(prev => ({ ...prev, items: [...prev.items, newItem()] }));

  const removeItem = (id: string) => {
    setReceipt(prev => ({
      ...prev,
      items: prev.items.length <= 1 ? [newItem()] : prev.items.filter(item => item.id !== id)
    }));
  };

  const saveReceipt = () => {
    if (!receipt.payer.trim()) {
      setNotice("Nama penerima/pembayar wajib diisi.");
      return;
    }
    if (!receipt.items.some(i => i.description.trim() && i.price > 0)) {
      setNotice("Tambahkan minimal satu item dengan nominal lebih dari Rp0.");
      return;
    }

    const updated = { ...receipt, savedAt: new Date().toISOString() };
    setHistory(prev => [updated, ...prev.filter(x => x.id !== updated.id)]);
    setReceipt(updated);
    setNotice("Kuitansi berhasil disimpan.");
    setTimeout(() => setNotice(""), 2500);
  };

  const newReceipt = () => {
    setReceipt(emptyReceipt());
    setActiveTab("buat");
    setNotice("Form kuitansi baru siap digunakan.");
    setTimeout(() => setNotice(""), 1800);
  };

  const editReceipt = (item: Receipt) => {
    setReceipt(item);
    setActiveTab("buat");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteReceipt = (id: string) => {
    if (!confirm("Hapus kuitansi ini dari riwayat?")) return;
    setHistory(prev => prev.filter(x => x.id !== id));
  };

  const saveSettings = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setNotice("Pengaturan berhasil disimpan.");
    setTimeout(() => setNotice(""), 1800);
  };

  const filteredHistory = history.filter(item => {
    const q = search.toLowerCase();
    return (
      item.number.toLowerCase().includes(q) ||
      item.payer.toLowerCase().includes(q) ||
      item.items.some(x => x.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="app">
      <header className="topbar no-print">
        <div className="brand">
          <div className="brand-icon">✓</div>
          <div>
            <strong>Kuitansi Digital</strong>
            <span>Manajemen kuitansi sederhana & profesional</span>
          </div>
        </div>
        <button className="btn primary" onClick={newReceipt}>＋ Kuitansi Baru</button>
      </header>

      <nav className="tabs no-print">
        <button className={activeTab === "buat" ? "active" : ""} onClick={() => setActiveTab("buat")}>Buat Kuitansi</button>
        <button className={activeTab === "riwayat" ? "active" : ""} onClick={() => setActiveTab("riwayat")}>Riwayat</button>
        <button className={activeTab === "pengaturan" ? "active" : ""} onClick={() => setActiveTab("pengaturan")}>Pengaturan</button>
      </nav>

      {notice && <div className="notice no-print">{notice}</div>}

      {activeTab === "buat" && (
        <main className="workspace">
          <section className="panel no-print">
            <div className="panel-title">
              <div>
                <h2>Data Kuitansi</h2>
                <p>Isi data transaksi lalu simpan atau cetak.</p>
              </div>
              <span className="badge">Draft</span>
            </div>

            <div className="form-grid">
              <label>Nomor Kuitansi
                <input value={receipt.number} onChange={e => updateReceipt("number", e.target.value)} />
              </label>
              <label>Tanggal
                <input type="date" value={receipt.date} onChange={e => updateReceipt("date", e.target.value)} />
              </label>
              <label className="wide">Diterima dari
                <input placeholder="Nama orang / instansi" value={receipt.payer} onChange={e => updateReceipt("payer", e.target.value)} />
              </label>
              <label className="wide">Alamat / keterangan penerima
                <input placeholder="Opsional" value={receipt.payerAddress} onChange={e => updateReceipt("payerAddress", e.target.value)} />
              </label>
              <label>Metode Pembayaran
                <select value={receipt.paymentMethod} onChange={e => updateReceipt("paymentMethod", e.target.value)}>
                  <option>Tunai</option>
                  <option>Transfer</option>
                  <option>QRIS</option>
                  <option>Debit</option>
                  <option>Kredit</option>
                </select>
              </label>
              <label>Diskon
                <input type="number" min="0" value={receipt.discount || ""} onChange={e => updateReceipt("discount", Number(e.target.value) || 0)} />
              </label>
            </div>

            <div className="items-head">
              <h3>Rincian Pembayaran</h3>
              <button className="btn small" onClick={addItem}>＋ Tambah Item</button>
            </div>

            <div className="items-table">
              <div className="item-row item-header">
                <span>Deskripsi</span><span>Qty</span><span>Harga</span><span>Jumlah</span><span></span>
              </div>
              {receipt.items.map(item => (
                <div className="item-row" key={item.id}>
                  <input placeholder="Contoh: Pembayaran SPP" value={item.description} onChange={e => updateItem(item.id, "description", e.target.value)} />
                  <input type="number" min="1" value={item.qty} onChange={e => updateItem(item.id, "qty", Number(e.target.value) || 1)} />
                  <input type="number" min="0" value={item.price || ""} onChange={e => updateItem(item.id, "price", Number(e.target.value) || 0)} />
                  <strong>{rupiah(item.qty * item.price)}</strong>
                  <button className="icon-btn danger" title="Hapus item" onClick={() => removeItem(item.id)}>×</button>
                </div>
              ))}
            </div>

            <label className="notes">Catatan
              <textarea rows={3} placeholder="Catatan tambahan..." value={receipt.notes} onChange={e => updateReceipt("notes", e.target.value)} />
            </label>

            <div className="action-row">
              <button className="btn primary" onClick={saveReceipt}>Simpan Kuitansi</button>
              <button className="btn" onClick={() => window.print()}>🖨 Cetak / PDF</button>
              <button className="btn ghost" onClick={newReceipt}>Reset</button>
            </div>
          </section>

          <ReceiptPreview receipt={receipt} settings={settings} subtotal={subtotal} total={total} />
        </main>
      )}

      {activeTab === "riwayat" && (
        <main className="single-panel no-print">
          <div className="panel-title">
            <div><h2>Riwayat Kuitansi</h2><p>{history.length} kuitansi tersimpan di perangkat ini.</p></div>
            <input className="search" placeholder="Cari nomor, nama, deskripsi..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="history-list">
            {filteredHistory.length === 0 ? (
              <div className="empty">Belum ada kuitansi yang cocok.</div>
            ) : filteredHistory.map(item => {
              const totalItem = item.items.reduce((s, x) => s + x.qty * x.price, 0) - item.discount;
              return (
                <div className="history-card" key={item.id}>
                  <div>
                    <strong>{item.number}</strong>
                    <span>{formatDate(item.date)} · {item.payer}</span>
                    <small>{item.items.map(x => x.description).filter(Boolean).join(", ") || "Tanpa deskripsi"}</small>
                  </div>
                  <div className="history-right">
                    <strong>{rupiah(totalItem)}</strong>
                    <div>
                      <button className="btn small" onClick={() => editReceipt(item)}>Edit</button>
                      <button className="btn small" onClick={() => { setReceipt(item); setActiveTab("buat"); setTimeout(() => window.print(), 100); }}>Cetak</button>
                      <button className="btn small danger-outline" onClick={() => deleteReceipt(item.id)}>Hapus</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {activeTab === "pengaturan" && (
        <main className="single-panel no-print">
          <div className="panel-title">
            <div><h2>Pengaturan Identitas</h2><p>Data ini akan tampil pada bagian atas dan bawah kuitansi.</p></div>
          </div>
          <div className="settings-form">
            <label>Nama Usaha / Sekolah
              <input value={settings.businessName} onChange={e => setSettings({ ...settings, businessName: e.target.value })} />
            </label>
            <label>Alamat
              <input value={settings.address} onChange={e => setSettings({ ...settings, address: e.target.value })} />
            </label>
            <label>Telepon / WhatsApp
              <input value={settings.phone} onChange={e => setSettings({ ...settings, phone: e.target.value })} />
            </label>
            <label>Footer Kuitansi
              <input value={settings.footer} onChange={e => setSettings({ ...settings, footer: e.target.value })} />
            </label>
            <button className="btn primary" onClick={saveSettings}>Simpan Pengaturan</button>
          </div>
        </main>
      )}
    </div>
  );
}

function ReceiptPreview({
  receipt,
  settings,
  subtotal,
  total
}: {
  receipt: Receipt;
  settings: typeof defaultSettings;
  subtotal: number;
  total: number;
}) {
  return (
    <section className="receipt-wrap">
      <div className="receipt">
        <div className="receipt-header">
          <div className="receipt-logo">✓</div>
          <div>
            <h1>{settings.businessName}</h1>
            <p>{settings.address}</p>
            <p>{settings.phone}</p>
          </div>
          <div className="receipt-label">KUITANSI</div>
        </div>

        <div className="receipt-meta">
          <div><span>No. Kuitansi</span><strong>{receipt.number || "-"}</strong></div>
          <div><span>Tanggal</span><strong>{formatDate(receipt.date)}</strong></div>
        </div>

        <div className="received">
          <span>Telah diterima dari</span>
          <strong>{receipt.payer || "........................................................"}</strong>
          {receipt.payerAddress && <small>{receipt.payerAddress}</small>}
        </div>

        <table className="receipt-table">
          <thead>
            <tr><th>No</th><th>Rincian Pembayaran</th><th>Qty</th><th>Jumlah</th></tr>
          </thead>
          <tbody>
            {receipt.items.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.description || "-"}</td>
                <td>{item.qty}</td>
                <td>{rupiah(item.qty * item.price)}</td>
              </tr>
            ))}
            <tr><td colSpan={3} className="right">Subtotal</td><td>{rupiah(subtotal)}</td></tr>
            <tr><td colSpan={3} className="right">Diskon</td><td>{rupiah(receipt.discount)}</td></tr>
            <tr className="grand"><td colSpan={3} className="right">TOTAL</td><td>{rupiah(total)}</td></tr>
          </tbody>
        </table>

        <div className="terbilang">
          <span>Terbilang</span>
          <strong>{numberToWords(total)}</strong>
        </div>

        <div className="payment-note">
          <div><span>Metode pembayaran</span><strong>{receipt.paymentMethod}</strong></div>
          {receipt.notes && <div><span>Catatan</span><strong>{receipt.notes}</strong></div>}
        </div>

        <div className="sign">
          <div></div>
          <div>
            <span>........................, {formatDate(receipt.date)}</span>
            <div className="signature-space"></div>
            <strong>{settings.businessName}</strong>
          </div>
        </div>

        <footer>{settings.footer}</footer>
      </div>
    </section>
  );
}

export default App;