import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);
import * as types from './mutation_types';

export default new Vuex.Store({
	state: {
		size: 20,							// 默认表格每页条数
		login_path: '/business_list',		// 默认登录路径
		is_login: 0							// 是否登录
	},
	
	mutations: {
		// 改变表格每页条数
		[types.CHANGE_SIZE](state, val){
			state.size = val;
			localStorage.setItem('size', val)
		},
		
		// 改变登录路径
		[types.ChANGE_LOGIN_PATH](state, val){
			state.login_path = val;
			localStorage.setItem('login_path', val)
		},
		
		// 改变登录状态
		[types.CHANGE_LOGIN_STATE](state, val){
			state.is_login = val;
			localStorage.setItem('is_login', val)
		}
	}
})