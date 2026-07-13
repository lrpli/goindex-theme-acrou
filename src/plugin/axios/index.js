import axios from "axios";
import store from "@/store";
import notify from "@/components/notification";

// 创建一个 axios 实例
const service = axios.create({
  baseURL: process.env.VUE_APP_API ? process.env.VUE_APP_API : "",
  //   timeout: 30000,
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 在发送请求设置cancel token
    config.cancelToken = new axios.CancelToken((cancel) => {
      store.dispatch("acrou/cancelToken/push", cancel);
    });
    return config;
  },
  (error) => {
    // 发送失败
    console.log(error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }
    if (error && error.response && error.response.status === 401) {
      notify({
        title: "notify.title",
        message: "error.401",
        type: "error",
        duration: 5 * 1000,
      });
    } else {
      console.log(error);
      notify({
        title: "notify.title",
        message: "error.request_failed",
        type: "error",
        duration: 5 * 1000,
      });
    }
    return Promise.reject(error);
  }
);

export default service;
