
export const getEmailTemplate = (tenTaiSan: string, ngayDenHan: string, cbkh: string, cbqln: string) => {
  // Filter out "Chưa chọn" values and create participant list
  const participants = [];
  if (cbkh && cbkh !== 'Chưa chọn') participants.push(`bạn ${cbkh}`);
  if (cbqln && cbqln !== 'Chưa chọn') participants.push(`bạn ${cbqln}`);
  
  const greeting = participants.length > 0 ? `Xin chào ${participants.join(' và ')}, ` : 'Xin chào, ';
  
  return `${greeting}Tài sản ${tenTaiSan} sẽ đến hạn vào ngày ${ngayDenHan}, các bạn hãy hoàn thành thủ tục trước hạn. Trân trọng cám ơn.`;
};
