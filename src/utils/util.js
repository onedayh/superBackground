import { Message, MessageBox } from 'element-ui';
export default {
	/*
	*  封装element-ui的api
	*/
	// 消息提示
	showMessage(message, type = 'success') {
		Message({
			message: message,
			type: type,
			center: true
		})
	},
	// 弹框
	showModel(content, successCb, title = '提示') {
		MessageBox.confirm(content, title, {
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning'
		}).then(() => {
			return successCb()
		}).catch(() => {
		
		})
	},
	// 转化日期选择器组件的时间格式
	timeValue(val) {
		let start_time = '', end_time = '';
		if (val) {
			start_time = val[0].getTime() / 1000;
			end_time = val[1].getTime() / 1000 + 86399
		} else {
			start_time = '';
			end_time = ''
		}
		return {
			start_time: start_time,
			end_time: end_time
		}
	},
	
	// 函数防抖
	debounce(func, delay) {
		let timer = null;
		// 闭包函数可以访问timer
		return function (...args) {
			// 如果事件被触发，清除timer并重新开始计时
			if (timer) clearTimeout(timer);
			timer = setTimeout(() => {
				func.apply(this, args)
			}, delay)
		}
	}
}