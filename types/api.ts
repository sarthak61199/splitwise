export type ApiError = {
  message: string;
  data: Record<string, never>;
};

export type ApiResponse<T> = {
  message: string;
  data: T;
};

export type ApiClientConfig<TData, TResponse> = {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  data?: TData;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
  onSuccess?: (response: ApiResponse<TResponse>) => void;
  onError?: (error: Error) => void;
  redirectUrl?: string;
};
