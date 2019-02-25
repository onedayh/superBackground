import Vue from 'vue';

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

import './assets/sass/main.scss';

import App from './App';

import router from './router';
import store from './store';

// 全局变量
import axios from './axios';
import util from './utils/util';
Vue.prototype.$axios = axios;
Vue.prototype.$util = util;
Vue.prototype.$baseUrl = location.href.indexOf("localhost") > -1 ? 'http://ceshi.shushangyun.com' : '';

Vue.config.productionTip = false;
new Vue({
	el: '#app',
	router,
	store,
	components: {App},
	template: '<App/>'
});
