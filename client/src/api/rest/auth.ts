import { makeRequest } from "@api/request";
import type { AxiosRequestConfig } from "axios";

interface RequestParams {
    data?: any;
    method?: AxiosRequestConfig['method'];
}

export const registerUser = ({ data, method }: RequestParams) => makeRequest({
    url: `/user/register`,
    method: method,
    data: data
});

export const testFunc = ({ data, method }: RequestParams) => makeRequest({
    url: `/api/main/`,
    method: method,
    data: data
});

export const getAuthUser = () => makeRequest({
    url: `/api/get-auth-user/`
});

export const authorizeUser = ({ data, method }: RequestParams) => makeRequest({
    url: `/api/authorize-user/`,
    method: method,
    data: data
});

export const registrateUser = ({ data, method }: RequestParams) => makeRequest({
    url: `/api/registrate-user/`,
    method: method,
    data: data
});

export const verifyToken = ({ data, method }: RequestParams) => makeRequest({
    url: `/api/verify-token/`,
    method: method,
    data: data
});

export const logoutUser = ({ data, method }: RequestParams) => makeRequest({
    url: `/api/logout-user/`,
    method: method,
    data: data
});

export const restorePassword = ({ data, method }: RequestParams) => makeRequest({
    url: `/api/restore-password/`,
    method: method,
    data: data
});

export const changePassword = ({ data, method }: RequestParams) => makeRequest({
    url: `/api/change-password/`,
    method: method,
    data: data
});