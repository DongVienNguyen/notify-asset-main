
export interface StaffMember {
  id: string;
  ten_nv: string;
  email: string;
}

export interface AssetReminder {
  id: string;
  ten_ts: string;
  ngay_den_han: string;
  cbqln: string;
  cbkh: string;
  is_sent: boolean;
  created_at: string;
}

export interface CRCReminder {
  id: string;
  loai_bt_crc: string;
  ngay_thuc_hien: string;
  ldpcrc: string;
  cbcrc: string;
  quycrc: string;
  is_sent: boolean;
  created_at: string;
}
