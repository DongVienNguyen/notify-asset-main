
import React from 'react';
import Layout from '@/components/Layout';
import FormHeader from '@/components/FormHeader';
import AssetEntryForm from '@/components/AssetEntryForm';

const AssetEntry = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <FormHeader />
        <AssetEntryForm />
      </div>
    </Layout>
  );
};

export default AssetEntry;
