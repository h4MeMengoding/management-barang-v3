interface AlertMessageProps {
  type: 'success' | 'error';
  message: string;
}

export default function AlertMessage({ type, message }: AlertMessageProps) {
  const isSuccess = type === 'success';
  
  return (
    <div
      className={`mb-6 p-4 rounded-lg border ${
        isSuccess
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30'
          : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30'
      }`}
    >
      <p
        className={`text-sm font-medium ${
          isSuccess
            ? 'text-green-800 dark:text-green-300'
            : 'text-red-800 dark:text-red-300'
        }`}
      >
        {message}
      </p>
    </div>
  );
}
