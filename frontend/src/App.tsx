import { OrderForm } from "./components/OrderForm";
import { OrderTable } from "./components/OrderTable";

function App() {
  return (
    <>
      <header>
        <h1>Fuelpass</h1>
      </header>

      <main>
        <OrderTable />
        <OrderForm />
      </main>
    </>
  );
}

export default App;
