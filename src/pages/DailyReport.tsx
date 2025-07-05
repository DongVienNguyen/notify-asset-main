import React from 'react';
import { FileText, Download, ListTree } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { useDailyReportLogic } from '@/hooks/useDailyReportLogic';
import DailyReportFilters from '@/components/DailyReportFilters';
import GroupedReportView from '@/components/GroupedReportView';
import DetailedReportView from '@/components/DetailedReportView';
import { Transaction } from '@/types/asset'; // Import Transaction type

const DailyReport = () => {
  const {
    transactions,
    isLoading,
    isExporting,
    showGrouped,
    setShowGrouped,
    filterType,
    setFilterType,
    customFilters,
    setCustomFilters,
    currentPage,
    setCurrentPage,
    resultsRef,
    handleCustomFilter,
    groupedRows,
    paginatedTransactions,
    totalPages,
    exportToPDF,
    getFilterDisplayText,
    dateStrings,
  } = useDailyReportLogic();

  if (isLoading && (transactions as Transaction[]).length === 0) { // Cast to Transaction[]
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Danh sách TS cần lấy</h1>
          </div>
        </div>

        <DailyReportFilters
          filterType={filterType}
          setFilterType={setFilterType}
          customFilters={customFilters}
          setCustomFilters={setCustomFilters}
          handleCustomFilter={handleCustomFilter}
          dateStrings={dateStrings}
        />

        <div className="flex justify-end space-x-4">
          <Button onClick={exportToPDF} disabled={isExporting} className="bg-green-600 hover:bg-green-700">
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Đang xuất...' : 'Xuất PDF'}
          </Button>
          <Button variant="outline" onClick={() => setShowGrouped(!showGrouped)} className="text-purple-600 border-purple-600 hover:bg-purple-50">
            <ListTree className="w-4 h-4 mr-2" />
            {showGrouped ? 'Hiện chi tiết' : 'Hiện DS tổng'}
          </Button>
        </div>

        <div id="print-section" ref={resultsRef}>
          {showGrouped ? (
            <GroupedReportView
              groupedRows={groupedRows}
              filterDisplayText={getFilterDisplayText()}
            />
          ) : (
            <DetailedReportView
              transactions={transactions as Transaction[]} // Cast to Transaction[]
              paginatedTransactions={paginatedTransactions as Transaction[]} // Cast to Transaction[]
              totalPages={totalPages}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              filterDisplayText={getFilterDisplayText()}
            />
          )}
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-section, #print-section * { visibility: visible; }
          #print-section { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </Layout>
  );
};

export default DailyReport;