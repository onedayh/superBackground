import axios from 'axios';
import router from '@/router/index';
import util from '@/utils/util';
import store from '@/store';
import * as types from '@/store/mutation_types';
import qs from 'qs';

axios.defaults.timeout = 10000; // 响应时间
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'; // 配置请求头
// axios.defaults.withCredentials = true;  // 跨源请求不提供凭据(cookie、HTTP认证及客户端SSL证明等)

// POST传参序列化(添加请求拦截器)
axios.interceptors.request.use(config => {
	if (config.data && config.method === 'post' && config.data.constructor !== FormData) {
		//判断config.data.constructor不是formdata，则不qs格式化data
		config.data = qs.stringify(config.data, { arrayFormat: 'repeat' });//数组需要格式化一下，格式化模式有三种：indices、brackets、repeat
	}
	// 发送请求之前
	return config
}, error => {
	// 请求错误
	return Promise.reject(error)
});

//返回状态判断(添加响应拦截器)
let loginTime = 0;
axios.interceptors.response.use(res => {
	// 响应数据之前
	if(res.status === 200){
		if(!res.data.success){
			if(res.data.code === 'login'){
				loginTime ++;
				if(loginTime === 1){
					store.commit(types.ChANGE_LOGIN_PATH, router.history.current.path);
					store.commit(types.CHANGE_LOGIN_STATE, 0);
					router.replace({path: '/login'});
					setTimeout(() => {
						loginTime = 0
					}, 3000)
				}
			}
			return Promise.reject(res.data.msg);
		}
	}else{
		return Promise.reject(res.statusText)
	}
	return res.data
}, err => {
	// 响应错误
	return Promise.reject(err.data)
});

export default axios;