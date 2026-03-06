

const EmptyState = ({ 
  icon = '📊', 
  title = 'No data yet', 
  description = 'Data will appear here once available',
  action = null 
}: any) => (
  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
    <div className="text-6xl mb-4 opacity-50">{icon}</div>
    <h3 className="text-lg font-semibold text-slate-300 mb-2">{title}</h3>
    <p className="text-sm text-slate-500 mb-4 max-w-sm">{description}</p>
    {action && <div className="mt-2">{action}</div>}
  </div>
);

export default EmptyState;
