import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { KpiCards } from "@/components/kpi-cards";
import { SalesChart } from "@/components/sales-chart";
import { ActivityFeed } from "@/components/activity-feed";
import { StockBars } from "@/components/stock-bars";
import { WeeklyBrief } from "@/components/weekly-brief";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <WelcomeBanner />

      <KpiCards />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SalesChart />
        </div>
        <WeeklyBrief />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ActivityFeed />
        <StockBars />
      </div>
    </div>
  );
}
