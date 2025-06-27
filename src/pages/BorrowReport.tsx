
import React from 'react';
import Layout from '@/components/Layout';
import ErrorBoundary from '@/components/ErrorBoundary';
import BorrowReportHeader from '@/components/BorrowReportHeader';
import BorrowReportFilters from '@/components/BorrowReportFilters';
import BorrowReportTable from '@/components/BorrowReportTable';
import { useBorrowReportData } from '@/hooks/useBorrowReportData';

const BorrowReport = () => {
  const {
    isLoading,
    dateRange,
    setDateRange,
    selectedRoom,
    setSelectedRoom,
    currentPage,
    setCurrentPage,
    filteredTransactions,
    paginatedTransactions,
    totalPages,
    rooms,
    ITEMS_PER_PAGE
  } = useBorrowReportData();

  if (isLoading) {
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
      <ErrorBoundary>
        <div className="space-y-6 p-6">
          <BorrowReportHeader />

          <BorrowReportFilters
            dateRange={dateRange}
            setDateRange={setDateRange}
            selectedRoom={selectedRoom}
            setSelectedRoom={setSelectedRoom}
            rooms={rooms}
          />

          <BorrowReportTable
            filteredTransactions={filteredTransactions}
            paginatedTransactions={paginatedTransactions}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            ITEMS_PER_PAGE={ITEMS_PER_PAGE}
          />
        </div>

        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #print-section, #print-section * {
              visibility: visible;
            }
            #print-section {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}</style>
      </ErrorBoundary>
    </Layout>
  );
};

export default BorrowReport;
