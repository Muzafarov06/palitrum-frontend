import React from "react";
import { RefreshCw, Download, Plus } from "lucide-react";
import CustomDatePicker from "../../components/common/CustomDatePicker";
import CustomSelect from "../../components/common/CustomSelect";
import CustomSearchInput from "../../components/common/CustomSearchInput";
import IconButton from "../../components/common/IconButton";

export default function ApplicationFilters({
  statusFilter,
  setStatusFilter,
  programFilter,
  setProgramFilter,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  searchQuery,
  setSearchQuery,
  resetFilters,
  exportCSV,
  onNewApplication,
  statusOptions,
  programOptions,
  setPage,
}) {
  return (
    <div className="space-y-4">
      {/* Первая строка – кнопки и поиск */}
      <div className="flex items-center gap-3 mb-4 flex-shrink-0 flex-wrap">
        <IconButton onClick={resetFilters} title="Сбросить фильтры" icon={RefreshCw} />
        <IconButton onClick={exportCSV} title="Экспорт в CSV" icon={Download} />
        <IconButton onClick={onNewApplication} title="Создать новую заявку" icon={Plus} />

        <CustomSearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Поиск по фамилии, имени, СНИЛС ребёнка или email родителя"
          setPage={setPage}
        />
      </div>

      {/* Вторая строка – селекты и датапикеры */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 flex-shrink-0">
        <div className="relative z-20">
          <CustomSelect
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              if (setPage) setPage(0);
            }}
            options={statusOptions}
            placeholder="Статус"
            clearable
          />
        </div>

        <div className="relative z-20">
          <CustomSelect
            value={programFilter}
            onChange={(val) => {
              setProgramFilter(val);
              if (setPage) setPage(0);
            }}
            options={programOptions}
            placeholder="Программа"
            clearable
          />
        </div>

        <div className="relative z-20">
          <CustomDatePicker
            selected={dateFrom}
            onChange={(date) => {
              setDateFrom(date);
              if (setPage) setPage(0);
            }}
            placeholder="Дата от"
            maxDate={dateTo || new Date()}
            isClearable={true}
          />
        </div>

        <div className="relative z-20">
          <CustomDatePicker
            selected={dateTo}
            onChange={(date) => {
              setDateTo(date);
              if (setPage) setPage(0);
            }}
            placeholder="Дата до"
            maxDate={new Date()}
            minDate={dateFrom}
            isClearable={true}
          />
        </div>
      </div>
    </div>
  );
}