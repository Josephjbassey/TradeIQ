import Header from "@/components/layout/header";
import TradeForm from "@/components/trade/trade-form";

export default function AddTrade() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Add Trade" subtitle="Record a new trading position" />
      <main className="flex-1 overflow-y-auto p-6">
        <TradeForm />
      </main>
    </div>
  );
}
