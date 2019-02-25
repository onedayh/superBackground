<template>
    <div id="UserManage">
        <!--标题-->
        <Titles
            :childName="titles.childName"
            @backPrev="titles.backPrev"
        />

        <!--查询 && 表格-->
        <div v-show="!titles.childName">
            <Filters
                :filterList="filters.filterList"
                :searchLoad="filters.searchLoad"
                @handleSearch="filters.handleSearch"
            />
            <Tables
                tableName="用户列表"
                :tableData="tables.tableData"
                :options="tables.options"
                :page="tables.page"
                :feedback="tables.feedback"
                @handle="tables.handle"
                @handlePage="tables.handlePage"
                @handleBtn="tables.handleBtn"
                @handleSizeChange="tables.handleSizeChange"
            />
        </div>

        <!--表单-->
        <el-form v-show="titles.childName" :model="myForm" :rules="rules" ref="myForm" label-width="100px" class="form-div">
            <el-form-item class="for-item" v-for="(item, index) in formList" v-if="item.hidden ? Boolean(false) : Boolean(true)" :label="item.label" :key="index" :prop="item.prop">
                <el-input v-model="myForm[item.prop]" :type="item.type === 'pass' ? 'password' : 'text'" :disabled="item.disabled ? Boolean(true) : Boolean(false)" :placeholder="item.confirm ? '请确认密码' : '请输入' + item.label"></el-input>
                <span class="tips" v-if="item.tips">{{item.tips}}</span>
            </el-form-item>
            <el-form-item label="状态" prop="enabled">
                <el-radio-group v-model="myForm.enabled">
                    <el-radio :label="Boolean(true)">有效</el-radio>
                    <el-radio :label="Boolean(false)">无效</el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item class="submit">
                <el-button class="my-btn" :loading="btnLoad" @click="submitForm('myForm')">{{btnLoad ? '正在提交' : '提交'}}</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
	import Titles from '@/components/Titles';
	import Filters from '@/components/Filters';
	import Tables from '@/components/Tables';
	import {mapState} from 'vuex';

	export default {
		name: "UserManage",
        components: {
			Titles,
			Filters,
			Tables
        },
		data(){
			// 手机号验证
			const regPhone = /^[1][3-9][0-9]{9}$/;
			const validatePhone = (rules, value, callback) => {
				if(value && !regPhone.test(value)){
					callback(new Error('请输入正确的手机号码'))
				}else{
					callback()
				}
			};
			// Email验证
			const regEmail = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
			const validateEmail = (rules, value, callback) => {
				if(value && !regEmail.test(value)){
					callback(new Error('请输入正确的Email'))
				}else{
					callback()
				}
			};
			// 密码验证
			const validatePasswordA = (rule, value, callback) => {
                if (this.myForm.passwordB !== '' && value !== '') {
                    this.$refs.myForm.validateField('passwordB');
                }
                callback();
			};
			const validatePasswordB = (rule, value, callback) => {
                if (value !== this.myForm.passwordA && value !== '') {
					callback(new Error('两次输入密码不一致!'));
				} else {
					callback();
				}
			};
			return{
				titles: {
					childName: '',
					backPrev: () => {
						this.titles.childName = '';
					}
                },
				filters: {
					filterList: [
						{span: 6, name: '账号', type: 'input', value: ''},
						{span: 6, name: '用户姓名', type: 'input', value: ''},
						{span: 6, name: '电话号码', type: 'input', value: ''},
						{span: 6, name: '状态', type: 'select', value: '', selectList: [
                            {name: '所有状态', value: ''},
                            {name: '有效', value: true},
                            {name: '无效', value: false}
                        ]},
						{span: 6, name: '', type: 'button'}
					],
					searchLoad: false,
					handleSearch: () => {
						// 查询
                        this.tables.page.cur = 1;
						this.filters.searchLoad = true;
						this.getData()
					}
                },
				tables: {
					tableData: [],
					options: [
						{label: '登录账号', prop: 'accountName'},
						{label: '用户姓名', prop: 'nickName'},
						{label: '手机号码', prop: 'phoneMobile', width: 70},
						{label: '状态', prop: 'enabled', width: 40},
						{label: '注册时间', prop: 'createTime'},
						{label: '最后登录时间', prop: 'lastLogin'},
						{
							label: '操作', width: 80, slot: [
								{type: 'modify', name: '修改'},
								{type: 'disabled', name: '禁用', value: '无效', prop: 'enabled'},
								{type: 'abled', name: '启用', value: '有效', prop: 'enabled'}
							]
						},
					],
					page: {
						total: 0,       // 数据量
						cur: 1          // 当前页
					},
					handle: (row, type) => {
						if(type === 'modify'){
							// 修改
							this.handleEdit(type, row)
                        }else if(type === 'disabled' || type === 'abled'){
							// 改变用户状态
                            this.changeStats(type, row.infraUserId)
                        }
					},
					handlePage: val => {
						// 切换页码
						this.tables.page.cur = val;
						this.$router.replace({path: `?page=${val}`});
						this.getData()
					},
					handleSizeChange: () => {
						// 改变每页条数
						this.tables.page.cur = 1;
						this.getData()
					},
					handleBtn: type => {
						// 新增
						if(type === 'add') this.handleEdit(type)
					}
				},
				myForm: {
					accountName: '',
					nickName: '',
					passwordA: '',
					passwordB: '',
					phoneMobile: '',
                    email: '',
                    department: '',
					position: '',
					enabled: ''
                },
				formList: [
                    {label: '登录账号', prop: 'accountName'},
                    {label: '姓名', prop: 'nickName'},
                    {label: '密码', prop: 'passwordA', type: 'pass', tips: '6-16个字符，由英文字母（区分大小写）、数字、符号组成，请勿使用简单密码。'},
                    {label: '确认密码', prop: 'passwordB', type: 'pass'},
                    {label: '联系电话', prop: 'phoneMobile'},
                    {label: 'Email', prop: 'email'},
                    {label: '部门', prop: 'department'},
                    {label: '职位', prop: 'position'}
                ],
                rules: {
					accountName: [
						{required: true, message: '请输入登录账号', trigger: 'blur'}
                    ],
					nickName: [
						{required: true, message: '请输入姓名', trigger: 'blur'}
					],
					passwordA: [
						{required: true, message: '请输入密码', trigger: 'blur'},
                        {min: 6, max: 16, message: '密码长度在6-16之间', trigger: 'blur'},
                        {validator: validatePasswordA, trigger: 'blur'}
					],
					passwordB: [
						{required: true, message: '请确认密码', trigger: 'blur'},
						{validator: validatePasswordB, trigger: 'blur'}
					],
					phoneMobile: [
						{validator: validatePhone, trigger: 'blur'}
					],
					email: [
						{validator: validateEmail, trigger: 'blur'}
					],
                    enabled: [
						{required: true, message: '请选择状态', trigger: 'change'}
					]
                },
                btnLoad: false,
                userId: null
			}
		},
        created(){
			// 若在新增页或修改页刷新，刷新后显示对应的信息
			const query = this.$route.query;
			const queryArr = Object.keys(query);
			if(queryArr.length > 0){
				this.titles.childName = query.add ? '新增用户' : query.userId ? '修改用户' : '';
				if(query.userId){
					this.userId = query.userId;
					this.getDetail(query.userId)
				}
				if(query.page) this.tables.page.cur = Number(query.page);
			}
		    this.getData()
        },
        watch: {
		    'titles.childName'(val){
		    	if(val === '修改用户'){
		    		this.formList[0].disabled = true;
		    		this.formList[2].hidden = true;
		    		this.formList[3].hidden = true;
                }else{
					this.formList[0].disabled = false;
					this.formList[2].hidden = false;
					this.formList[3].hidden = false;
					if(!val){
						this.resetForm('myForm');
						this.userId = null;
						this.$router.replace({path: ''})
                    }
                }
            },
			'$route.query'(val){
				// 点击sidebar导航
				const queryArr = Object.keys(val);
				if(queryArr.length === 0) this.titles.childName = ''
			}
        },
		compouted: {
            ...mapState(['size'])
        },
		methods: {
			// 获取数据
			getData(){
				this.tables.feedback = 'loading';
				const {filterList} = this.filters;
				let params = {
					accountName: filterList[0].value,       // 账号
					nickName: filterList[1].value,          // 姓名
					phoneMobile: filterList[2].value,       // 手机号
					enable: filterList[3].value             // 状态
				};
				this.$axios.post('/platform/user/grid-user.htm', {
					...params,
					sidx: '',
					sord: 'desc',
					page: this.tables.page.cur,
					pageRows: this.size,
					_search: false,
					nd: new Date().getTime()
				}).then(res => {
					let {tables} = this;
					const {data} = res;
					[tables.tableData, tables.page.total, tables.feedback] = [data.list, data.totalRecord, data.totalRecord ? '' : 'empty'];
					this.tables = tables;
					this.filters.searchLoad = false
				}).catch(err => {
					this.$util.showMessage(err, 'error');
					[this.tables.tableData, this.tables.feedback] = [[], 'error'];
					this.filters.searchLoad = false
				})
			},

            // 获取详情
            getDetail(id){
			    this.$axios.get('/platform/user/find-user.htm', {
			    	params: {
						infraUserId: id
                    }
                }).then(res => {
                	const {data} = res;
                	this.myForm = {
						accountName: data.accountName,
						nickName: data.nickName,
						passwordA: '',
						passwordB: '',
						phoneMobile: data.phoneMobile,
						email: data.email,
						department: data.department,
						position: data.position,
						enabled: data.enabled
                    }
                }).catch(err => {
                	this.$util.showMessage(err, 'error')
                })
            },

            // 新增 && 修改
			handleEdit(type, data){
				const {cur} = this.tables.page;
				if(type === 'add'){
					// 新增
					this.titles.childName = '新增用户';
					this.$router.replace({path: `?page=${cur}&add=true`})
                }else if(type === 'modify'){
					// 修改
					this.titles.childName = '修改用户';
					this.userId = data.infraUserId;
					this.$router.replace({path: `?page=${cur}&userId=${data.infraUserId}`});
					this.myForm = {
						accountName: data.accountName,
						nickName: data.nickName,
						passwordA: '',
						passwordB: '',
						phoneMobile: data.phoneMobile,
						email: data.email,
						department: data.department,
						position: data.position,
						enabled: data.enabled === '有效' ? true : false
                    }
                }
            },

            // 改变用户状态
			changeStats(type, id){
				let boo = null, text = '';
				if(type === 'disabled'){
					boo = false;
					text = '禁'
                }else if(type === 'abled'){
					boo = true;
					text = '启'
                }
				this.$util.showModel(`确定${text}用要该账号吗?`, () => {
					this.$axios.post('/platform/user/update-user-status.htm', {
						infraUserId: id,
						enabled: boo
                    }).then(() => {
						this.$util.showMessage(`${text}用成功`);
						this.getData()
                    }).catch(err => {
						this.$util.showMessage(err, 'error')
                    })
                })
            },

			// 提交表单
			submitForm(formName) {
				this.$refs[formName].validate((valid) => {
					if (valid) {
						this.btnLoad = true;
						const url = this.userId ? 'update-user' : 'insert-user';
						this.$axios.post(`/platform/user/${url}.htm`, {
							...this.myForm,
							infraUserId: this.userId
						}).then(() => {
							this.getData();
							this.btnLoad = false;
							this.$util.showMessage(`${this.titles.childName}成功`);
							this.titles.childName = ''
						}).catch(err => {
							this.$util.showMessage(err, 'error');
							this.btnLoad = false
						})
					}
				})
			},

			// 重置表单
			resetForm(formName) {
				this.$refs[formName].resetFields();
			}
		}
	}
</script>