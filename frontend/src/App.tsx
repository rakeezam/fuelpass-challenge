import { useState } from "react";
import { OrderForm } from "./components/OrderForm";
import { OrderTable } from "./components/OrderTable";
import { FilterBar } from "./components/FilterBar";
import fuelpassLogo from "./assets/fuelpass-logo.png";

type Tab = "submit" | "manage";

const TAB_LABELS: Record<Tab, string> = {
  submit: "Submit Order",
  manage: "Manage Orders",
};

export const App = () => {
  const [activeTab, setActiveTab] = useState<Tab>("submit");
  const [airportCode, setAirportCode] = useState("");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 px-6 py-4">
        <h1>
          <img src={fuelpassLogo} alt="FuelPass" className="h-8 w-auto" />
        </h1>
      </header>

      <nav className="flex gap-2 border-b border-gray-200 bg-white px-6">
        {(Object.keys(TAB_LABELS) as Tab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`border-b-2 px-4 py-3 text-sm font-medium ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </nav>

      <main className="px-6 py-8">
        {activeTab === "submit" && <OrderForm />}
        {activeTab === "manage" && (
          <div>
            <FilterBar
              initialValue={airportCode}
              onFilterChange={setAirportCode}
            />
            <OrderTable airportCode={airportCode} />
          </div>
        )}
      </main>
    </div>
  );
};
