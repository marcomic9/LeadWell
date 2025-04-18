import { useQuery } from "@tanstack/react-query";
import { AiInsight } from "@shared/schema";

export function AIInsights() {
  const { data: insights, isLoading, error } = useQuery<AiInsight[]>({
    queryKey: ["/api/ai-insights"],
  });

  const getInsightStyles = (type: string, index: number) => {
    // Base styles
    let bgClass = "bg-white";
    let borderClass = "border-neutral-200";
    let iconBgClass = "bg-neutral-100";
    let iconTextClass = "text-neutral-600";
    let actionClass = "text-primary-600 hover:text-primary-800";
    
    // Customized styles based on type and featured status
    switch (type) {
      case "quality":
        iconBgClass = "bg-primary-100";
        iconTextClass = "text-primary-600";
        if (index === 0) {
          bgClass = "bg-primary-50";
          borderClass = "border-primary-200";
        }
        break;
      case "schedule":
        iconBgClass = "bg-blue-100";
        iconTextClass = "text-blue-600";
        actionClass = "text-blue-600 hover:text-blue-800";
        if (index === 0) {
          bgClass = "bg-blue-50";
          borderClass = "border-blue-200";
        }
        break;
      case "trend":
        iconBgClass = "bg-green-100";
        iconTextClass = "text-green-600";
        actionClass = "text-green-600 hover:text-green-800";
        if (index === 0) {
          bgClass = "bg-green-50";
          borderClass = "border-green-200";
        }
        break;
      default:
        if (index === 0) {
          bgClass = "bg-primary-50";
          borderClass = "border-primary-200";
        }
        break;
    }
    
    return {
      bgClass,
      borderClass,
      iconBgClass,
      iconTextClass,
      actionClass
    };
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">AI Insights</h2>
        </div>
        <div className="p-4 space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">AI Insights</h2>
        </div>
        <div className="p-4">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            Error loading insights: {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center justify-center mr-3 rounded-md w-8 h-8 bg-primary-100">
            <i className="ri-robot-line text-primary-600"></i>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 flex items-center">
              AI Insights
              <div className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">New</div>
            </h2>
            <p className="text-xs text-neutral-500">Powered by OpenAI</p>
          </div>
        </div>
        <button className="text-neutral-500 hover:text-neutral-700 h-8 w-8 flex items-center justify-center rounded-full hover:bg-neutral-100">
          <i className="ri-refresh-line"></i>
        </button>
      </div>
      
      <div className="p-4 space-y-3">
        {insights && insights.length > 0 ? (
          insights.map((insight, index) => {
            const styles = getInsightStyles(insight.type, index);
            
            return (
              <div 
                key={insight.id} 
                className={`p-4 ${styles.bgClass} border ${styles.borderClass} rounded-lg hover:shadow-sm transition-all`}
              >
                <div className="flex">
                  <div className={`w-10 h-10 ${styles.iconBgClass} ${styles.iconTextClass} rounded-lg flex items-center justify-center mr-3 flex-shrink-0`}>
                    <i className={`${insight.icon} text-lg`}></i>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-neutral-900">{insight.title}</h4>
                      <span className="text-xs text-neutral-400">Today</span>
                    </div>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{insight.description}</p>
                    {insight.action && (
                      <div className="mt-3 flex">
                        <button className={`text-xs font-medium ${styles.actionClass} flex items-center`}>
                          {insight.action}
                          <i className="ri-arrow-right-line ml-1"></i>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 px-4">
            <div className="mx-auto w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-3">
              <i className="ri-robot-line text-3xl text-neutral-400"></i>
            </div>
            <p className="text-neutral-500 font-medium">No insights available</p>
            <p className="text-neutral-400 text-sm mt-1">Check back later for AI-generated insights about your leads</p>
          </div>
        )}
      </div>
      
      <div className="px-4 py-3 border-t border-neutral-200 bg-neutral-50">
        <button className="text-xs w-full text-primary-600 font-medium hover:text-primary-800 flex items-center justify-center">
          Generate new insights
          <i className="ri-magic-line ml-1.5"></i>
        </button>
      </div>
    </div>
  );
}
