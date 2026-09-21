import { Receipt, SchoolProfile, CloudConfig } from '../types';

const STORAGE_KEYS = {
  RECEIPTS: 'kuitansi_db_receipts_v1',
  SCHOOL_PROFILE: 'kuitansi_db_school_profile_v1',
  CLOUD_CONFIG: 'kuitansi_db_cloud_config_v1',
};

export const DEFAULT_SCHOOL_PROFILE: SchoolProfile = {
  namaSekolah: 'SMP NEGERI 1 TELADAN BANGSA',
  instansiInduk: 'PEMERINTAH PROVINSI DAERAH KHUSUS IBUKOTA JAKARTA\nDINAS PENDIDIKAN',
  alamatSekolah: 'Jl. Merdeka Pendidikan No. 45, Gambir, Jakarta Pusat 10110',
  telepon: '(021) 3845921 / 3845922',
  email: 'smpn1teladan@sekolah.belajar.id',
  kota: 'Jakarta',
  kepalaSekolahDefault: 'Drs. H. Bambang Sudarsono, M.M',
  nipKepalaSekolahDefault: '19720415 199802 1 002',
  bendaharaDefault: 'Hj. Siti Nurhaliza, S.E, Ak',
  nipBendaharaDefault: '19810820 200604 2 007',
  panitiaDefault: 'Ahmad Fauzi, S.Pd',
  nipPanitiaDefault: '19890210 201503 1 004',
  jabatanPanitiaDefault: 'Ketua Panitia Pelaksana Asesmen Standar',
  nomorSuratPrefix: 'KWT',
};

export const DEFAULT_CLOUD_CONFIG: CloudConfig = {
  spreadsheetUrl: '',
  appsScriptUrl: '',
  sheetName: 'Data Kuitansi',
  autoSync: false,
  lastSyncTime: null,
};

const INITIAL_RECEIPTS: Receipt[] = [
  {
    id: 'kwt-sample-1',
    noKuitansi: 'KWT/2026/IX/001',
    telahDiterimaDari: 'Bendahara BOS Dinas Pendidikan Provinsi DKI Jakarta',
    jumlahUang: 12500000,
    terbilang: 'Dua Belas Juta Lima Ratus Ribu Rupiah',
    tempat: 'Jakarta',
    tanggal: '2026-09-08',
    untukPembayaran: 'Penyelenggaraan Kegiatan Asesmen Bakat Minat & Pengadaan Bahan Ujian Siswa Semester Ganjil TA 2026/2027',
    setujuDibayarKepalaSekolah: 'Drs. H. Bambang Sudarsono, M.M',
    nipKepalaSekolah: '19720415 199802 1 002',
    bendaharaSekolah: 'Hj. Siti Nurhaliza, S.E, Ak',
    nipBendahara: '19810820 200604 2 007',
    panitiaPelaksana: 'Ahmad Fauzi, S.Pd',
    nipPanitia: '19890210 201503 1 004',
    jabatanPanitia: 'Ketua Panitia Pelaksana',
    materai: true,
    syncStatus: 'local',
    syncedAt: null,
    createdAt: '2026-09-08T08:30:00.000Z',
    updatedAt: '2026-09-08T08:30:00.000Z',
  },
  {
    id: 'kwt-sample-2',
    noKuitansi: 'KWT/2026/IX/002',
    telahDiterimaDari: 'CV. Pustaka Ilmu Mandiri (Penyedia Alat Peraga & Media Belajar)',
    jumlahUang: 4850000,
    terbilang: 'Empat Juta Delapan Ratus Lima Puluh Ribu Rupiah',
    tempat: 'Jakarta',
    tanggal: '2026-09-09',
    untukPembayaran: 'Pembelian Perangkat Kit Praktikum IPA Fisika & Biologi Laboratorium Sekolah',
    setujuDibayarKepalaSekolah: 'Drs. H. Bambang Sudarsono, M.M',
    nipKepalaSekolah: '19720415 199802 1 002',
    bendaharaSekolah: 'Hj. Siti Nurhaliza, S.E, Ak',
    nipBendahara: '19810820 200604 2 007',
    panitiaPelaksana: 'Dra. Endang Purwanti',
    nipPanitia: '19780614 200501 2 009',
    jabatanPanitia: 'Kepala Laboratorium IPA',
    materai: false,
    syncStatus: 'local',
    syncedAt: null,
    createdAt: '2026-09-09T09:15:00.000Z',
    updatedAt: '2026-09-09T09:15:00.000Z',
  },
];

export const storage = {
  getReceipts(): Receipt[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECEIPTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(INITIAL_RECEIPTS));
        return INITIAL_RECEIPTS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load receipts from localStorage:', e);
      return INITIAL_RECEIPTS;
    }
  },

  saveReceipt(receipt: Receipt): Receipt[] {
    const list = this.getReceipts();
    const existingIndex = list.findIndex((r) => r.id === receipt.id);
    let updated: Receipt[];

    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = { ...receipt, updatedAt: new Date().toISOString() };
    } else {
      updated = [{ ...receipt, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...list];
    }

    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(updated));
    return updated;
  },

  deleteReceipt(id: string): Receipt[] {
    const list = this.getReceipts();
    const updated = list.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(updated));
    return updated;
  },

  getSchoolProfile(): SchoolProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCHOOL_PROFILE);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.SCHOOL_PROFILE, JSON.stringify(DEFAULT_SCHOOL_PROFILE));
        return DEFAULT_SCHOOL_PROFILE;
      }
      return { ...DEFAULT_SCHOOL_PROFILE, ...JSON.parse(data) };
    } catch (e) {
      console.error('Failed to load school profile:', e);
      return DEFAULT_SCHOOL_PROFILE;
    }
  },

  saveSchoolProfile(profile: SchoolProfile): SchoolProfile {
    localStorage.setItem(STORAGE_KEYS.SCHOOL_PROFILE, JSON.stringify(profile));
    return profile;
  },

  getCloudConfig(): CloudConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLOUD_CONFIG);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.CLOUD_CONFIG, JSON.stringify(DEFAULT_CLOUD_CONFIG));
        return DEFAULT_CLOUD_CONFIG;
      }
      return { ...DEFAULT_CLOUD_CONFIG, ...JSON.parse(data) };
    } catch (e) {
      console.error('Failed to load cloud config:', e);
      return DEFAULT_CLOUD_CONFIG;
    }
  },

  saveCloudConfig(config: CloudConfig): CloudConfig {
    localStorage.setItem(STORAGE_KEYS.CLOUD_CONFIG, JSON.stringify(config));
    return config;
  },

  exportDatabaseJSON(): string {
    const data = {
      receipts: this.getReceipts(),
      schoolProfile: this.getSchoolProfile(),
      cloudConfig: this.getCloudConfig(),
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    return JSON.stringify(data, null, 2);
  },

  importDatabaseJSON(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.receipts)) {
        localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(parsed.receipts));
      }
      if (parsed.schoolProfile) {
        localStorage.setItem(STORAGE_KEYS.SCHOOL_PROFILE, JSON.stringify(parsed.schoolProfile));
      }
      if (parsed.cloudConfig) {
        localStorage.setItem(STORAGE_KEYS.CLOUD_CONFIG, JSON.stringify(parsed.cloudConfig));
      }
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  },
};
