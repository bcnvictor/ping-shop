import type { tokenResponse, User } from '../types/auth.types';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  status: number | null;
}

export const postRequest = async <T = unknown>(
  endpoint: string,
  request: object,
  token?: string | null
): Promise<ApiResponse<T>> => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }


    const response = await fetch(`api/${endpoint}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(request),
    });

       if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
    }

    
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    
    let data: T | undefined;
    if (contentType?.includes('application/json') && contentLength !== '0') {
      const text = await response.text();
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.warn('Failed to parse response as JSON:', text);
        }
      }
    }
    return {
      success: true,
      data: data,
      status: response.status,
    };
  } catch (error) {
    console.error('Error during POST request', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: null,
    };
  }
};


export const getRequest = async <T = unknown>(
  endpoint: string,
  token?: string | null
): Promise<ApiResponse<T>> => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }


    const response = await fetch(`api/${endpoint}`, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
    }

    
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    
    let data: T | undefined;
    if (contentType?.includes('application/json') && contentLength !== '0') {
      const text = await response.text();
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.warn('Failed to parse response as JSON:', text);
        }
      }
    }
    return {
      success: true,
      data: data,
      status: response.status,
    };
  } catch (error) {
    console.error('Error during GET request', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: null,
    };
  }
};

export const putRequest = async <T = unknown>(
  endpoint: string,
  request: object,
  token?: string | null
): Promise<ApiResponse<T>> => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }


    const response = await fetch(`api/${endpoint}`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
    }

    
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    
    let data: T | undefined;
    if (contentType?.includes('application/json') && contentLength !== '0') {
      const text = await response.text();
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.warn('Failed to parse response as JSON:', text);
        }
      }
    }
    return {
      success: true,
      data: data,
      status: response.status,
    };
  } catch (error) {
    console.error('Error during POST request', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: null,
    };
  }
};


export const getUserProfile = async (login: string) => {
  if (!login || login.trim() === '') {
    return "";
  }
  const admResponse = await postRequest<tokenResponse>('user/login', {login: "admin.test", password: "test"});
  
  if (admResponse.success && admResponse.data) {
    const admToken = admResponse.data.token;
    const allUsersResponse = await getRequest<User[]>('user/all', admToken);
    if (allUsersResponse.success && allUsersResponse.data) {
      for (const user of allUsersResponse.data) {
        if (user.login === login) {
          const userInfoResponse = await getRequest<User>(`user/${user.id}`, admToken);
          if (userInfoResponse.success && userInfoResponse.data) {
            return userInfoResponse.data as User;
          }
        }
      }
    }
  }

  throw new Error(`User with login ${login} not found`);
}