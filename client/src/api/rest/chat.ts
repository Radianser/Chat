import { makeRequest } from "@api/request";
import type { AxiosRequestConfig } from "axios";

interface RequestParams {
    data?: any;
    method?: AxiosRequestConfig['method'];
}

export const findChats = ({ data, method }: RequestParams) => makeRequest({
    url: `/api/find-chats/`,
    method: method,
    data: data
});