
import { StatsCard, StatsCardSkeleton } from "./StatsCard";

interface StatsItem {
  title: string;
  value: string;
  change: string;
  iconType: "sales" | "products" | "orders" | "customers";
  trend: "up" | "down";
}

interface StatsGridProps {
  stats: StatsItem[];
  isLoading: boolean;
}

export const StatsGrid = ({ stats, isLoading }: StatsGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array(4).fill(0).map((_, index) => (
          <StatsCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  );
};
