import React from 'react';
import Layout from '@/components/Layout';
import FormHeader from '@/components/FormHeader';
import AssetEntryForm from '@/components/AssetEntryForm';
import { useTimeRestriction } from '@/hooks/useTimeRestriction';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

const AssetEntry = () => {
  const { isRestrictedTime } = useTimeRestriction();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <FormHeader />
        {isRestrictedTime && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Cảnh báo!</AlertTitle>
            <AlertDescription>
              Hiện tại đang trong khung giờ cấm (7:45-8:05 hoặc 12:45-13:05). Vui lòng nhắn Zalo thay vì dùng hệ thống.
            </AlertDescription>
          </Alert>
        )}
        <AssetEntryForm isRestrictedTime={isRestrictedTime} />
      </div>
    </Layout>
  );
};

export default AssetEntry;