import React from "react";

export default function UsersPagination({ page, totalPages, setPage, size, setSize, totalElements, usersCount }) {
  return (
    <div className="flex justify-between items-center flex-wrap gap-2">
      <div className="text-sm text-gray-600">
        Показано {usersCount} из {totalElements}
      </div>
      <div className="flex gap-2 items-center">
        <button
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
          className="px-3 py-1 border rounded-xl disabled:opacity-50 hover:bg-gray-100"
        >
          Назад
        </button>
        <span className="px-3 py-1">Страница {page + 1} из {totalPages}</span>
        <button
          onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
          disabled={page + 1 >= totalPages}
          className="px-3 py-1 border rounded-xl disabled:opacity-50 hover:bg-gray-100"
        >
          Вперёд
        </button>
        <select
          value={size}
          onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
          className="border rounded-xl px-2 py-1 ml-2 bg-white"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  );
}