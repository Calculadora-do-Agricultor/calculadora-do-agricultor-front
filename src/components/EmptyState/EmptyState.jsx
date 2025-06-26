const EmptyState = ({ icon, title, description }) => {
  return (
    <div className="empty-state-message text-center space-y-4 p-6">
      {icon && <div className="flex justify-center">{icon}</div>}
      {title && <h2 className="text-lg font-semibold">{title}</h2>}
      {description && <p className="text-sm text-gray-600">descrição</p>}
    </div>
  );
};

export default EmptyState;
