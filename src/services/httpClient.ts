import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

interface HttpResponse<T = any> {
  success: boolean;
  status?: number;
  data?: T;
  error?: string;
}

const DEFAULT_TIMEOUT = 5000;

async function request<T = any>(
  config: AxiosRequestConfig,
  retries = 1
): Promise<HttpResponse<T>> {
  try {
    const response: AxiosResponse<T> = await axios({
      timeout: DEFAULT_TIMEOUT,
      validateStatus: () => true, // don't throw on 4xx/5xx
      ...config
    });

    return {
      success: true,
      status: response.status,
      data: response.data
    };

  } catch (error: any) {
    if (retries > 0) {
      return request(config, retries - 1);
    }

    return {
      success: false,
      error: error.message
    };
  }
}

export const httpClient = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    request<T>({ method: "GET", url, ...config }),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    request<T>({ method: "POST", url, data, ...config })
};