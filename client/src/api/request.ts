import axios from "axios";
import type { AxiosRequestConfig } from "axios";
import "./csrf-interceptor";

interface RequestParams {
    url: string;
    method?: AxiosRequestConfig['method'];
    data?: any;
    headers?: any;
    params?: any;
    responseType?: AxiosRequestConfig['responseType'];
}

export const makeRequest = ({
    url = '', 
    method = "POST", 
    data = {}, 
    headers = {}, 
    params = {}, 
    responseType = 'json'
}: RequestParams) => {
    return axios({
        url,
        method,
        data,
        params,
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
            ...headers
        },
        responseType,
        withCredentials: true
    });
};