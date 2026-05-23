import React from "react";
import CustomSearchInput from "../../common/CustomSearchInput";
import CustomSelect from "../../common/CustomSelect";
import { ROOM_TYPES } from "../../../constants/roomConstants";

export default function RoomFilters({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeChange,
}) {
  const typeOptions = [{ value: "", label: "Все типы" }, ...ROOM_TYPES];

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="flex-1 min-w-[250px]">
        <CustomSearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Поиск по названию..."
        />
      </div>
      <div className="w-64">
        <CustomSelect
          value={typeFilter}
          onChange={onTypeChange}
          options={typeOptions}
          placeholder="Тип помещения"
          clearable
        />
      </div>
    </div>
  );
}