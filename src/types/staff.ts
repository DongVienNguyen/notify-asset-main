export interface StaffMember {
  id: string;
  ten_nv: string;
  email: string;
}

export interface Staff {
  cbqln: StaffMember[];
  cbkh: StaffMember[];
  ldpcrc: StaffMember[];
  cbcrc: StaffMember[];
  quycrc: StaffMember[];
}

export interface AssetReminder {
  id: string;
  ten_ts: string;
  ngay_den_han: string;
  cbkh: string | null;
  cbqln: string | null;
  is_sent: boolean;
  created_at: string;
}