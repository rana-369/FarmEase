import React from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange 
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handlePageChange = (page) => {
    if (page === '...' || page === currentPage) return;
    onPageChange(page);
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-4 py-4 rounded-2xl" style={{ 
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-primary)'
    }}>
      {/* Items per page selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Show</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="px-3 py-2 rounded-lg outline-none cursor-pointer"
          style={{ 
            backgroundColor: 'var(--bg-button)',
            border: '1px solid var(--border-primary)',
            color: 'var(--text-primary)'
          }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>per page</span>
      </div>

      {/* Items info */}
      <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Showing <span style={{ color: '#22c55e' }}>{startItem}</span> to{' '}
        <span style={{ color: '#22c55e' }}>{endItem}</span> of{' '}
        <span style={{ color: 'var(--text-primary)' }}>{totalItems}</span> items
      </div>

      {/* Page navigation */}
      <div className="flex items-center gap-1">
        {/* First page */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ 
            backgroundColor: currentPage === 1 ? 'transparent' : 'var(--bg-button)',
            color: 'var(--text-muted)'
          }}
        >
          <FiChevronsLeft className="text-lg" />
        </motion.button>

        {/* Previous page */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ 
            backgroundColor: currentPage === 1 ? 'transparent' : 'var(--bg-button)',
            color: 'var(--text-muted)'
          }}
        >
          <FiChevronLeft className="text-lg" />
        </motion.button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: page === '...' ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePageChange(page)}
              className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all ${
                page === '...' ? 'cursor-default' : ''
              }`}
              style={{ 
                backgroundColor: page === currentPage ? '#22c55e' : 'var(--bg-button)',
                color: page === currentPage ? '#000000' : page === '...' ? 'var(--text-muted)' : 'var(--text-muted)',
                border: page === currentPage ? 'none' : '1px solid var(--border-primary)'
              }}
            >
              {page}
            </motion.button>
          ))}
        </div>

        {/* Next page */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ 
            backgroundColor: currentPage === totalPages ? 'transparent' : 'var(--bg-button)',
            color: 'var(--text-muted)'
          }}
        >
          <FiChevronRight className="text-lg" />
        </motion.button>

        {/* Last page */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ 
            backgroundColor: currentPage === totalPages ? 'transparent' : 'var(--bg-button)',
            color: 'var(--text-muted)'
          }}
        >
          <FiChevronsRight className="text-lg" />
        </motion.button>
      </div>
    </div>
  );
};

export default Pagination;
