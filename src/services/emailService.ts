// Re-export core email functionality
export { sendEmail } from './core/emailClient';
export type { EmailRequest, EmailResponse } from './core/emailClient';

// Re-export asset notification services
export {
  sendAssetNotificationEmail,
  testEmailFunction,
  sendAssetTransactionConfirmation,
  sendAssetReminderEmail // Corrected export path
} from './notifications/assetNotificationService';

// Re-export error report service
export { sendErrorReport } from './notifications/errorReportService';

// Re-export utilities
export {
  formatEmailAddress,
  checkEmailStatus
} from './utils/emailUtils';