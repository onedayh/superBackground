<template>
    <div id="Sidebars" :class="{'bug' : showDialog}">
        <el-dropdown @command="handleClick">
            <div class="logo">
                <img src="@/assets/images/logo.jpg" alt="logo">
                <p>{{nickName}}</p>
            </div>
            <el-dropdown-menu slot="dropdown">
                <el-dropdown-item command="change">修改密码</el-dropdown-item>
                <el-dropdown-item command="quit">安全退出</el-dropdown-item>
            </el-dropdown-menu>
        </el-dropdown>
        <el-menu
            style="margin-top: 35px;"
            :default-active="curRoute"
            background-color="#272d3d"
            :unique-opened="Boolean(true)"
            :router="Boolean(true)"
            text-color="#fff"
            active-text-color="#00c2b2">
            <el-submenu v-for="(item, index) in menuList" :index="index.toString()" :key="index">
                <template slot="title">
                    <i :class="item.menuIcon"></i>
                    <span>{{item.menuText}}</span>
                </template>
                <el-menu-item v-for="(it, idx) in item.son" :index="it.actionPath" :key="idx">{{it.menuText}}</el-menu-item>
            </el-submenu>
        </el-menu>
        <el-dialog title="修改密码" :visible.sync="showDialog">
            <el-form :model="passForm" ref="passForm" :rules="passRules" class="form-div" label-width="100px">
                <el-form-item class="for-item" v-for="(item, index) in formList" v-if="item.hidden ? Boolean(false) : Boolean(true)" :label="item.label" :key="index" :prop="item.prop">
                    <el-input v-model="passForm[item.prop]" :type="item.type === 'pass' ? 'password' : 'text'" :disabled="item.disabled ? Boolean(true) : Boolean(false)" :placeholder="item.confirm ? '请确认密码' : '请输入' + item.label"></el-input>
                    <span class="tips" v-if="item.tips">{{item.tips}}</span>
                    <img v-if="item.code" class="code" @click="getVerCode()" :src="verUrl" alt="验证码" title="换一个">
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="showDialog = false">取 消</el-button>
                <el-button type="primary" :loading="btnLoad" @click="submitForm('passForm')">{{btnLoad ? '提交中' : '确 定'}}</el-button>
            </div>
        </el-dialog>
        <div class="s-wrap" v-if="showDialog"></div>
    </div>
</template>

<script>
    import {mapMutations} from 'vuex';
    import {CHANGE_LOGIN_STATE} from '@/store/mutation_types';
    import { JSEncrypt } from 'jsencrypt';

	export default {
		name: "Sidebars",
        data(){
			// 密码验证
			const validatePassword = (rule, value, callback) => {
				if (this.passForm.checkPassword !== '' && value !== '') {
					this.$refs.passForm.validateField('checkPassword');
				}
				callback();
			};
			const validateCheckPassword = (rule, value, callback) => {
				if (value !== this.passForm.password && value !== '') {
					callback(new Error('两次输入密码不一致!'));
				} else {
					callback();
				}
			};
			return{
				curRoute: '',
                menuList: [],
				nickName: '',
				showDialog: false,
				btnLoad: false,
				formList: [
					{label: '旧密码', prop: 'oldword', type: 'pass'},
					{label: '新密码', prop: 'password', type: 'pass', tips: '6-16个字符，由英文字母（区分大小写）、数字、符号组成，请勿使用简单密码。'},
					{label: '确认新密码', prop: 'checkPassword', type: 'pass'},
					{label: '验证码', prop: 'imageCode', code: true}
				],
				passForm: {
					oldword: '',
					password: '',
					checkPassword: '',
					imageCode: ''
                },
				passRules: {
					oldword: [
                        {required: true, message: '请输入旧密码', trigger: 'blur'}
                    ],
					password: [
						{required: true, message: '请输入新密码', trigger: 'blur'},
                        {min: 6, max: 16, message: '密码长度在6-16之间', trigger: 'blur'},
                        {validator: validatePassword, trigger: 'blur'}
					],
					checkPassword: [
						{required: true, message: '请确认密码', trigger: 'blur'},
						{validator: validateCheckPassword, trigger: 'blur'}
					],
					imageCode: [
						{required: true, message: '请输入验证码', trigger: 'blur'}
					]
                },
				verUrl: null
            }
        },
        created(){
			this.curRoute = this.$route.path;
			this.getMenu();
			this.getLoginInfo()
        },
        watch: {
			'$route.path'(val){
				this.curRoute = val
            },

			showDialog(val){
				if(val){
					if(!this.verUrl) this.getVerCode()
                }else{
					this.resetForm('passForm')
                }
            }
        },
        methods: {
            ...mapMutations([CHANGE_LOGIN_STATE]),
			// 获取菜单列表
			getMenu(){
				this.$axios.get('/platform/menu.htm').then(res => {
					this.menuList = res.data;
				}).catch(err => {
					this.$util.showMessage(err, 'error');
				})
			},

            getLoginInfo(){
				this.$axios.get('/platform/user/find-current-user.htm').then(res => {
					this.nickName = res.data.nickName
                })
            },

			handleClick(val){
				if(val === 'quit'){
					this.$util.showModel('确定要退出吗？', () => {
						this.$axios.post('/platform/logout').then(() => {
							this[CHANGE_LOGIN_STATE](0);
							this.$router.replace({path: '/login'})
                        }).catch(err => {
                        	this.$util.showMessage(err, 'error')
                        })
                    })
                }else if(val === 'change'){
                    this.showDialog = true;
                }
            },

			submitForm(formName){
				this.$refs[formName].validate((valid) => {
					if (valid) {
						// 获取公钥
                        this.btnLoad = true;
						this.$axios.get('/common/get-public-key.htm').then(res => {
                            const publicKey = res.data.publicKey;
							const encryptor = new JSEncrypt();
							const {passForm} = this;
							encryptor.setPublicKey(publicKey);
							this.$axios.post('/platform/user/modify-password.htm', {
								oldword: encryptor.encrypt(passForm.oldword),
								password: encryptor.encrypt(passForm.password),
								imageCode: passForm.imageCode
                            }).then(() => {
								this.$util.showMessage('修改密码成功');
								this.btnLoad = false;
								this.showDialog = false;
                            }).catch(err => {
								this.btnLoad = false;
								this.getVerCode();
                            	this.$util.showMessage(err, 'error')
                            })
						}).catch(err => {
							this.btnLoad = false;
							this.$util.showMessage(err, 'error')
						})
					}
				})
            },

			// 获取验证码
			getVerCode(){
				this.verUrl = `${this.$baseUrl}/vcode.jpg?${new Date().getTime()}`;
			},

			// 重置表单
			resetForm(formName) {
				this.$refs[formName].resetFields();
			}
        }
	}
</script>