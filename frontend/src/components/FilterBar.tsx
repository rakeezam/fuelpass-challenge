import { useState } from "react";

interface FilterBarProps {
  initialValue?: string;
  onFilterChange: (airportCode: string) => void;
}

export const FilterBar = ({
  initialValue = "",
  onFilterChange,
}: FilterBarProps) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setValue(nextValue);

    if (nextValue.length === 0 || nextValue.length === 4) {
      onFilterChange(nextValue);
    }
  };

  return (
    <div className="mb-4">
      <label
        htmlFor="airportCode"
        className="mb-1 block text-sm font-medium text-gray-700"
      >
        Filter by Airport ICAO Code
      </label>
      <input
        id="airportCode"
        type="text"
        value={value}
        onChange={handleChange}
        maxLength={4}
        placeholder="e.g. ABCD"
        className="w-48 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};
