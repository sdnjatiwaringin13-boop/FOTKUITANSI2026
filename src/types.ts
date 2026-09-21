export interface Receipt {
  id: string;
  noKuitansi: string;
  telahDiterimaDari: string;
  jumlahUang: number;
  terbilang: string;
  tempat: string;
  tanggal: string;
  untukPembayaran: string;
  setujuDibayarKepalaSekolah: string;
  nipKepalaSekolah?: string;
  bendaharaSekolah: string;
  nipBendahara?: string;
  panitiaPelaksana: string;
  nipPanitia?: string;
  jabatanPanitia?: string;
  materai: boolean;
  syncStatus?: 'synced' | 'pending' | 'error' | 'local';
  syncedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolProfile {
  namaSekolah: string;
  instansiInduk: string;
  alamatSekolah: string;
  telepon: string;
  email: string;
  kota: string;
  kepalaSekolahDefault: string;
  nipKepalaSekolahDefault: string;
  bendaharaDefault: string;
  nipBendaharaDefault: string;
  panitiaDefault: string;
  nipPanitiaDefault: string;
  jabatanPanitiaDefault: string;
  logoUrl?: string;
  nomorSuratPrefix?: string;
}

export interface CloudConfig {
  spreadsheetUrl: string;
  appsScriptUrl: string;
  sheetName: string;
  autoSync: boolean;
  lastSyncTime: string | null;
}
