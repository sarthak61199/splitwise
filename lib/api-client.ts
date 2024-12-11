import { ApiClientConfig, ApiError, ApiResponse } from "@/types/api";

export async function apiClient<TData, TResponse>({
  url,
  method = "GET",
  data,
  headers = {},
  credentials = "include",
  onSuccess,
  onError,
}: ApiClientConfig<TData, TResponse>): Promise<void> {
  try {
    const response = await fetch(url, {
      method,
      credentials,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      ...(data && { body: JSON.stringify(data) }),
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.message);
    }

    const result: ApiResponse<TResponse> = await response.json();
    onSuccess?.(result);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Something went wrong";
    onError?.(new Error(errorMessage));
  }
}
