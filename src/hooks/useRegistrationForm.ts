import { useCallback, useState } from 'react';
import { RegistrationData, RegistrationResponse, createRegistration } from '@/lib/registration';

export interface UseRegistrationFormOptions {
  onSuccess?: (response: RegistrationResponse) => void;
  onError?: (error: Error) => void;
}

export function useRegistrationForm(options: UseRegistrationFormOptions = {}) {
  const { onSuccess, onError } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const submit = useCallback(
    async (data: RegistrationData) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await createRegistration(data);

        if (onSuccess) {
          onSuccess(response);
        }

        return response;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        if (onError) {
          onError(error);
        }
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, onError]
  );

  return {
    submit,
    isLoading,
    error,
  };
}
