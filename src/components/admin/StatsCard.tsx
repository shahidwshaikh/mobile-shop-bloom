
import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Package, ShoppingBag, Users } from "lucide-react";

interface StatsItemProps {
  title: string;
  value: string;
  change: string;
  iconType: "sales" | "products" | "orders" | "customers";
  trend: "up" | "down";
}

export const StatsCard = ({ title, value, change, iconType, trend }: StatsItemProps) => {
  // Render the appropriate icon based on iconType
  const renderIcon = () => {
    switch (iconType) {
      case "sales":
        return <TrendingUp className="text-green-500" />;
      case "products":
        return <Package className="text-blue-500" />;
      case "orders":
        return <ShoppingBag className="text-purple-500" />;
      case "customers":
        return <Users className="text-orange-500" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
        <div className="p-2 rounded-full bg-gray-100 mb-2">
          {renderIcon()}
        </div>
        <p className="text-xs text-gray-500">{title}</p>
        <h3 className="text-lg font-bold">{value}</h3>
        <p className={`text-xs ${trend === "up" ? "text-green-500" : "text-red-500"}`}>
          {change}
        </p>
      </CardContent>
    </Card>
  );
};

export const StatsCardSkeleton = () => (
  <Card>
    <CardContent className="p-4">
      <Skeleton className="h-8 w-8 rounded-full mb-2" />
      <Skeleton className="h-4 w-16 mb-1" />
      <Skeleton className="h-6 w-20 mb-1" />
      <Skeleton className="h-4 w-12" />
    </CardContent>
  </Card>
);
