<template>
    <div id="Login">
        <div class="login-wrap">
            <div class="logo">
                <img src="../../assets/images/logo.jpg" alt="">
                <p>欢迎使用数商云批-超级后台</p>
            </div>
            <el-form class="login-box" ref="loginForm" :model="loginForm" :rules="loginRules">
                <el-form-item prop="admin">
                    <el-input v-model="loginForm.j_username" placeholder="请输入登录账号"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input type="password" v-model="loginForm.j_password" placeholder="请输入登录密码"></el-input>
                </el-form-item>
                <el-form-item class="ver-code" prop="ver_code">
                    <el-input v-model="loginForm.validateCode" placeholder="请输入验证码"></el-input>
                    <img @click="getVerCode()" :src="verUrl" alt="验证码" title="换一个">
                </el-form-item>
                <el-form-item>
                    <el-button class="my-btn" :loading="loading" @click="submitForm('loginForm')" :disabled="!(loginForm.j_username && loginForm.j_password && loginForm.validateCode)">{{loading ? '正在登录...' : '登 录'}}</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
    import {mapState, mapMutations} from 'vuex';
	import {CHANGE_LOGIN_STATE} from '@/store/mutation_types';

	export default {
		name: "Login",
		data(){
			return{
				loginForm: {
					j_username: '',
					j_password: '',
					validateCode: ''
                },
				loginRules: {
					j_username: [
						{required: true, message: '请输入登陆账号', trigger: 'blur'}
                    ],
					j_password: [
						{required: true, message: '请输入登陆密码', trigger: 'blur'}
                    ],
					validateCode: [
						{required: true, message: '请输入验证码', trigger: 'blur'}
                    ]
                },
				loading: false,
                verUrl: ''
            }
        },
        created(){
			const super_admin = localStorage.getItem('super_admin');
			if(super_admin) this.loginForm.j_username = super_admin;
		    this.getVerCode()
        },
        mounted(){
			// 监听键盘事件
			document.onkeyup = e => {
				if((e.key === 'Enter' || e.keyCode === 13) &&
                    this.loginForm.j_username &&
                    this.loginForm.j_password &&
                    this.loginForm.validateCode)
					this.submitForm('loginForm')
			}
        },
		// 销毁监听键盘
		destroyed(){
			document.onkeyup = null
		},
        computed: {
            ...mapState(['login_path'])
        },
        methods: {
            ...mapMutations([CHANGE_LOGIN_STATE]),

			// 获取验证码
			getVerCode(){
				this.verUrl = `${this.$baseUrl}/vcode.jpg?${new Date().getTime()}`;
            },
			// 登录
			submitForm(formName){
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                    	this.loading = true;
                    	// 登录
                        this.$axios.post('/platform/login-process', this.loginForm).then(() => {
							// 登录成功，跳转
							this.loading = false;
							localStorage.setItem('super_admin', this.loginForm.j_username);
							this[CHANGE_LOGIN_STATE](1);
							this.$router.replace(this.login_path);
                        }).catch(err => {
							this.loading = false;
                        	this.$util.showMessage(err, 'error');
                        	this.getVerCode();
                        })
                    }
                })
            }
        }
	}
</script>