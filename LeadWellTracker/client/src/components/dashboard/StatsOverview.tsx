import { useQuery } from "@tanstack/react-query";
import { Stat } from "@shared/schema";

export function StatsOverview() {
  const { data: stats, isLoading, error } = useQuery<Stat[]>({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <div className="px-6 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200 h-32 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 mb-6">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          Error loading stats: {error.message}
        </div>
      </div>
    );
  }

  const getGradientByStatName = (name: string) => {
    switch (name) {
      case "New Leads":
        return "from-blue-500 to-blue-600";
      case "Qualified Leads":
        return "from-green-500 to-green-600";
      case "Scheduled Calls":
        return "from-primary-500 to-primary-600";
      case "Conversion Rate":
        return "from-purple-500 to-purple-600";
      default:
        return "from-primary-500 to-primary-600";
    }
  };

  const getIconColorByStatName = (name: string) => {
    switch (name) {
      case "New Leads":
        return "text-blue-500";
      case "Qualified Leads":
        return "text-green-500";
      case "Scheduled Calls":
        return "text-primary-500";
      case "Conversion Rate":
        return "text-purple-500";
      default:
        return "text-primary-500";
    }
  };

  return (
    <div className="px-6 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats?.map((stat) => (
        <div 
          key={stat.id} 
          className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden transition-all hover:shadow-md hover:border-neutral-300 group"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <i className={`${stat.icon} text-xl ${getIconColorByStatName(stat.name)}`}></i>
              </div>
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                stat.changePercentage && stat.changePercentage > 0 
                  ? "bg-green-100" 
                  : "bg-red-100"
              }`}>
                <span className={`flex items-center text-sm font-semibold ${
                  stat.changePercentage && stat.changePercentage > 0 
                    ? "text-green-600" 
                    : "text-red-600"
                }`}>
                  <i className={`${
                    stat.changePercentage && stat.changePercentage > 0 
                      ? "ri-arrow-up-line" 
                      : "ri-arrow-down-line"
                  } mr-0.5`}></i>
                  {Math.abs(stat.changePercentage || 0)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-neutral-500 text-sm font-medium">{stat.name}</p>
              <h3 className="text-3xl font-bold mt-1 bg-gradient-to-r bg-clip-text text-transparent transition-colors group-hover:scale-105 transform-gpu inline-block" 
                style={{ backgroundImage: `linear-gradient(to right, var(--primary-500), var(--primary-700))` }}
              >
                {stat.value}
              </h3>
              <div className="flex items-center mt-2 text-xs text-neutral-500">
                <span>vs last week</span>
              </div>
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r transition-all group-hover:h-2" 
            style={{ backgroundImage: `linear-gradient(to right, var(--primary-500), var(--primary-600))` }}
          ></div>
        </div>
      ))}
    </div>
  );
}
