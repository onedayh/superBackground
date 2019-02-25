import Vue from 'vue';
import Router from 'vue-router';
import store from '@/store';
import * as types from '@/store/mutation_types';
Vue.use(Router);

const router = new Router({
	routes: [
		{
			path: '/',
			redirect: '/business_list'
		}, {
			path: '/login',
			name: '登录',
			component: resolve => require(['@/views/login/Login'], resolve)
		}, {
			path: '/business_list',
			component: resolve => require(['@/views/Index'], resolve),
			children: [
				{
					path: '/business_list',
					name: '商家列表',
					component: resolve => require(['@/views/business_manage/BusinessList'], resolve)
				}, {
					path: '/user_manage',
					name: '平台用户管理',
					component: resolve => require(['@/views/system_manage/UserManage'], resolve)
				}, {
					path: '/author_manage',
					name: '套餐权限',
					component: resolve => require(['@/views/system_manage/AuthorManage'], resolve)
				}
			]
		}
	]
});

// 路由跳转之前
router.beforeEach((to, from, next) => {
	if(to.path !== '/login' && from.name === null){
		// 刷新页面，从缓存拿数据保存在store
		const size = localStorage.getItem('size');
		const login_path = localStorage.getItem('login_path');
		const is_login = localStorage.getItem('is_login');
		if(size) store.commit(types.CHANGE_SIZE, Number(size));
		if(login_path) store.commit(types.ChANGE_LOGIN_PATH, login_path);
		if(is_login) store.commit(types.CHANGE_LOGIN_STATE, Number(is_login));
	}else if(to.path === '/login'){
		if(store.state.is_login){
			return next({path: from.path})
		}
	}
	next()
})

export default router
