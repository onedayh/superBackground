<template>
    <div id="BusinessList">
        <!--标题-->
        <Titles
            :childName="titles.childName"
            @backPrev="titles.backPrev"
        />

        <!--查询 && 列表-->
        <div v-show="!titles.childName">
            <Filters
                labelWidth="100px"
                :filterList="filters.filterList"
                :searchLoad="filters.searchLoad"
                @handleSearch="filters.handleSearch"
            />
            <Tables
                tableName="商家列表"
                otherBtn="重置密码"
                :selection="Boolean(true)"
                :emptySelectionData="tables.emptySelect"
                :tableData="tables.tableData"
                :options="tables.options"
                :page="tables.page"
                :feedback="tables.feedback"
                @handle="tables.handle"
                @handleBtn="tables.handleBtn"
                @handlePage="tables.handlePage"
                @handleSelect="tables.handleSelect"
                @handleSizeChange="tables.handleSizeChange"
            />
        </div>

        <!--表单-->
        <el-form v-show="titles.childName" :model="myForm" :rules="rules" ref="myForm" label-width="100px" class="form-div">
            <el-form-item label="公司名称" prop="companyName">
                <el-input v-model="myForm.companyName" placeholder="请输入公司名称"></el-input>
            </el-form-item>
            <el-form-item label="登录账号" prop="accountName">
                <el-input v-model="myForm.accountName" placeholder="请输入登录账号"></el-input>
            </el-form-item>
            <el-form-item label="Email" prop="email">
                <el-input v-model="myForm.email" placeholder="请输入Email"></el-input>
            </el-form-item>
            <el-form-item label="联系人姓名">
                <el-input v-model="myForm.contacts" placeholder="请输入联系人姓名"></el-input>
            </el-form-item>
            <el-form-item label="联系人手机" prop="phoneMobile">
                <el-input v-model="myForm.phoneMobile" placeholder="请输入联系人手机"></el-input>
            </el-form-item>
            <el-form-item label="公司电话">
                <el-input v-model="myForm.phone" placeholder="请输入公司电话"></el-input>
            </el-form-item>
            <el-form-item label="公司地址">
                <el-input v-model="myForm.address" placeholder="请输入公司地址"></el-input>
            </el-form-item>
            <el-form-item label="公司传真">
                <el-input v-model="myForm.fax" placeholder="请输入公司传真"></el-input>
            </el-form-item>
            <el-form-item label="微信支付" v-if="companyId">
                <el-switch v-model="myForm.wxpay"></el-switch>
            </el-form-item>
            <el-form-item label="备注">
                <el-input type="textarea" v-model="myForm.note" placeholder="请输入备注"></el-input>
            </el-form-item>
            <el-form-item class="submit">
                <el-button class="my-btn" :loading="btnLoad" @click="submitForm('myForm')">{{btnLoad ? '正在提交' : '提交'}}</el-button>
            </el-form-item>
        </el-form>

        <!--授权弹窗-->
        <el-dialog title="授权商家" :visible.sync="showDialog">
            <el-form :model="authorForm" ref="authorForm" :rules="authorRules" class="form-div" label-width="140px">
                <el-form-item label="公司名称" prop="name">
                    <el-input disabled v-model="authorForm.name"></el-input>
                </el-form-item>
                <el-form-item label="授权时间" class="longer-error" prop="author_time">
                    <el-date-picker
                        v-model="authorForm.author_time"
                        type="datetimerange"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        range-separator="至"
                        start-placeholder="开始时间"
                        end-placeholder="结束时间">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="授权终端用户数" prop="seats">
                    <el-input v-model="authorForm.seats"></el-input>
                </el-form-item>
                <el-form-item class="sets-chabox" label="套餐版本" prop="roleIds">
                    <el-checkbox-group v-model="authorForm.roleIds">
                        <el-checkbox v-for="item in setsList" :label="item.roleId" :key="item.roleId">{{item.roleName}}</el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="showDialog = false">取 消</el-button>
                <el-button type="primary" :loading="btnLoad" @click="submitForm('authorForm')">{{btnLoad ? '提交中' : '确 定'}}</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
	import Titles from '@/components/Titles';
    import Filters from '@/components/Filters';
	import Tables from '@/components/Tables';
	import {mapState} from 'vuex';

	export default {
		name: "BusinessList",
        components: {
			Titles,
			Filters,
			Tables
        },
        data(){
			// 手机号验证
			const regPhone = /^[1][3-9][0-9]{9}$/;
			// Email验证
			const regEmail = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
			// 正整数验证
			const regNum = /^[1-9]\d*$/;
			const validatePhone = (rules, value, callback) => {
				if(value && !regPhone.test(value)){
					callback(new Error('请输入正确的手机号码'))
				}else{
					callback()
				}
			};
			const validateEmail = (rules, value, callback) => {
				if(value && !regEmail.test(value)){
					callback(new Error('请输入正确的Email'))
				}else{
					callback()
				}
			};

			return{
				titles: {
					childName: '',
					backPrev: () => {
						this.titles.childName = ''
                    }
                },
				filters: {
					filterList: [
						{span: 6, name: '商家公司名称', type: 'input', value: ''},
						{span: 6, name: '登录账号', type: 'input', value: ''},
						{span: 6, name: '联系人手机', type: 'input', value: ''},
						{span: 6, name: '联系人姓名', type: 'input', value: ''},
						{span: 12, name: '注册时间', type: 'time', value: ''},
						{span: 12, name: '授权时间', type: 'time', value: ''},
						{span: 6, name: '商户状态', type: 'select', value: '', selectList: [
                            {value: '', name: '所有状态'},
                            {value: '1', name: '有效'},
                            {value: '0', name: '无效'},
                            {value: '2', name: '过期'}
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
						{label: '商家公司名称', prop: 'companyName', fixed: 'left', width: 150, overflow: true},
						{label: '登录账号', prop: 'accountName', width: 120, overflow: true},
						{label: '联系人手机', prop: 'phoneMobile', width: 120},
						{label: '公司邮箱', prop: 'email', width: 200, overflow: true},
						{label: '商户号', prop: 'mchId', width: 200, overflow: true},
						{label: 'appID', prop: 'appId', width: 200},
						{label: '支付开通状态', prop: 'wxpayState', width: 200, overflow: true},
						{label: '联系人姓名', prop: 'contacts'},
						{label: '公司电话', prop: 'phone', width: 120},
						{label: '公司传真', prop: 'fax', width: 120},
						{label: '地址', prop: 'address', width: 300, overflow: true},
						{label: '备注', prop: 'note', width: 300, overflow: true},
						{label: '授权开始时间', prop: 'start', width: 200},
						{label: '授权结束时间', prop: 'end', width: 200},
						{label: '状态', prop: 'status', width: 60},
						{label: '注册时间', prop: 'createTime', width: 200},
						{
							label: '操作', fixed: 'right', width: 200, slot: [
								{type: 'modify', name: '修改'},
								{type: 'authorize', name: '授权'},
								{type: 'wxpay', name: '微信支付'}
							]
						},
					],
					feedback: '',
					emptySelect: false,     // 是否清空选择数据
					page: {
						total: 60,       // 数据量
						cur: 1          // 当前页
					},
					handle: (row, type) => {
						if(type === 'modify'){
							// 修改
							this.handleEdit(type, row)
                        }else if(type === 'authorize'){
                            // 授权
                            this.handleAuthor(row)
                        }else if(type === 'wxpay'){
							// 微信支付
                            this.handleWxpay(row.companyId)
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
						if(type === 'add'){
							// 新增
							this.handleEdit('add')
                        }else if(type === 'other'){
                            // 重置密码
                            this.handleResetPass()
                        }
                    },
					handleSelect: data => {
						// 选择表格数据
						this.selectData = data;
                    }
				},
				myForm: {
					companyName: '',
					accountName: '',
                    email: '',
					contacts: '',
					phoneMobile: '',
					phone: '',
                    fax: '',
                    wxpay: false,
                    address: '',
					note: ''
                },
				rules: {
					companyName: [
                        {required: true, message: '请输入公司名称', trigger: 'blur'}
                    ],
					accountName: [
						{required: true, message: '请输入登录账号', trigger: 'blur'}
					],
					email: [
						{required: true, message: '请输入Email', trigger: 'blur'},
                        {validator: validateEmail, trigger: 'blur'}
					],
					phoneMobile: [
						{required: true, message: '请输入联系人手机', trigger: 'blur'},
						{validator: validatePhone, trigger: 'blur'}
					]
                },
				showDialog: false,
				authorForm: {
					name: '',
					author_time: '',
					start: '',
					end: '',
					seats: '',
					roleIds: []
				},
				authorRules: {
					name: [
						{required: true, message: '请输入公司名称', trigger: 'blur'}
					],
					author_time: [
						{required: true, message: '请选择授权时间', trigger: 'blur'}
					],
					seats: [
						{required: true, message: '请输入授权终端用户数', trigger: 'blur'},
                        {validator: regNum, trigger: 'blur'}
					],
					roleIds: [
						{required: true, message: '请选择套餐版本', trigger: 'blur'}
					]
				},
				setsList: [],
				companyId: '',
				btnLoad: false,
				selectData: null
            }
        },
        computed: {
            ...mapState(['size'])
        },
        watch: {
			showDialog(val){
				if(!val){
					// 关闭授权弹窗
					this.companyId = '';
					this.resetForm('authorForm')
                }
            },
            'titles.childName'(val){
                if(!val){
                	// 显示表格
                	this.$router.replace({path: `?page=${this.tables.page.cur}`})
                }
			},
			'$route.query'(val){
				// 点击sidebar导航
				const queryArr = Object.keys(val);
				if(queryArr.length === 0) this.titles.childName = ''
			}
        },
        created(){
			// 若在新增页或修改页刷新，刷新后显示对应的信息
			const query = this.$route.query;
			const queryArr = Object.keys(query);
			if(queryArr.length > 0){
				this.titles.childName = query.add ? '新增商家' : query.companyId ? '修改商家' : '';
				if(query.companyId){
					this.companyId = query.companyId;
					this.getDetail(query.companyId, 'basicInfo')
                }
                if(query.page) this.tables.page.cur = Number(query.page);
			}
			this.getData();
        },

        methods: {
			// 获取数据
			getData(){
				this.tables.feedback = 'loading';
				const {filterList} = this.filters;
				let params = {
					companyName: filterList[0].value,                                   // 公司名称
					accountName: filterList[1].value,                                   // 账号
					phoneMobile: filterList[2].value,                                   // 手机号
					contacts: filterList[3].value,                                      // 姓名
					regStratTime: filterList[4].value ? filterList[4].value[0] : '',    // 注册开始时间
					regEndTime: filterList[4].value ? filterList[4].value[1] : '',      // 注册结束时间
					stratTime: filterList[5].value ? filterList[5].value[0] : '',       // 授权开始时间
					endTime: filterList[5].value ? filterList[5].value[1] : '',         // 授权结束时间
					status: filterList[6].value                                         // 状态
                }
				this.$axios.post('/platform/company/grid-company-info.htm', {
					...params,
					sidx: 'createTime',
					sord: 'desc',
					page: this.tables.page.cur,
					pageRows: this.size,
					_search: false,
					nd: new Date().getTime()
                }).then(res => {
                	let {tables} = this, {data} = res;
                	data.list.forEach(item => {
						item.wxpayState = item.wxpay ? '已开通' : '未开通'
                    });
                	[tables.tableData, tables.page.total, tables.feedback] = [data.list, data.totalRecord, data.totalRecord ? '' : 'empty'];
                	this.tables = tables;
					this.filters.searchLoad = false
                }).catch(err => {
                	this.$util.showMessage(err, 'error');
					[this.tables.tableData, this.tables.feedback] = [[], 'error'];
					this.filters.searchLoad = false
                })
            },

            // 获取公司详情
            getDetail(companyId, infoType){
				this.$axios.post('/platform/company/find-company-info.htm', {
					companyId: companyId
                }).then(res => {
                	const {data} = res;
                	if(infoType === 'authorInfo'){
                		// 授权
                        const hasTime = data.start && data.end ? true : false;
                        this.authorForm = {
							name: data.companyName,
							author_time: hasTime ? [data.start, data.end] : null,
							start: data.start,
							end: data.end,
							seats: data.seats ? data.seats.toString() : '',
							roleIds: data.roles
                        }
                    }else if(infoType === 'basicInfo'){
                		// 修改
						this.myForm = {
							companyName: data.companyName,
							accountName: data.accountName,
							email: data.email,
							contacts: data.contacts,
							phoneMobile: data.phoneMobile,
							phone: data.phone,
							fax: data.fax,
							wxpay: data.wxpay,
							address: data.address,
							note: data.note
						}
                    }
                })
            },

			// 新增 && 修改
			handleEdit(type, data){
				const cur = this.tables.page.cur;
                if(type === 'add'){
					// 新增
                    this.titles.childName = '新增商家';
					this.companyId = '';
					this.myForm = {
						companyName: '',
						accountName: '',
						email: '',
						contacts: '',
						phoneMobile: '',
						phone: '',
						fax: '',
						wxpay: false,
						address: '',
						note: ''
					}
					this.$router.replace({path: `?page=${cur}&add=true`});
                }else if(type === 'modify'){
					// 修改
                    this.companyId = data.companyId;
					this.$router.replace({path: `?page=${cur}&companyId=${data.companyId}`});
					this.titles.childName = '修改商家';
                    this.myForm = {
						companyName: data.companyName,
						accountName: data.accountName,
						email: data.email,
						contacts: data.contacts,
						phoneMobile: data.phoneMobile,
						phone: data.phone,
						fax: data.fax,
                        wxpay: data.wxpay,
						address: data.address,
						note: data.note
					}
                }
            },

            // 授权
			handleAuthor(data){
				if(this.setsList.length === 0) this.getSetsList();
				this.showDialog = true;
				this.companyId = data.companyId;
				this.getDetail(data.companyId, 'authorInfo');
            },

            // 重置密码
			handleResetPass(){
                if(this.selectData){
					const {selectData} = this;
					let ids = [];
					selectData.forEach(item => {
						item.data.forEach(it => {
							ids.push(it.companyId)
						})
					});
					if(ids.length > 0){
						this.$util.showModel('确认重置所选的商家密码吗？', () => {
							this.$axios.post('/platform/company/reset-pwd.htm', {
								companyIds: ids
							}).then(() => {
								this.$util.showMessage('重置密码成功');
								this.clearSelectData()
							}).catch(err => {
								this.$util.showMessage(err, 'error')
							})
						})
                    }else{
						this.$util.showMessage('请先选择商家账号', 'error');
                    }
                }else{
                	this.$util.showMessage('请先选择商家账号', 'error')
                }
            },

            // 清空表格选择数据
            clearSelectData(){
				this.tables.emptySelect = true;
				this.selectData = null;
				setTimeout(() => {
					this.tables.emptySelect = false;
                }, 1000)
            },
            // 提交表单
			submitForm(formName) {
				this.$refs[formName].validate((valid) => {
					if (valid) {
						this.btnLoad = true;
						if(formName === 'myForm'){
							// 公司表单
							this.submitMyForm()
                        }else if(formName === 'authorForm'){
							// 授权表单
							this.submitAuthorForm()
                        }
					}
				})
			},

            // 提交公司表单
            submitMyForm(){
			    this.$axios.post('/platform/company/submit-company.htm', {
                    ...this.myForm,
					companyId: this.companyId
                }).then(() => {
					this.getData();
					this.btnLoad = false;
			    	this.$util.showMessage(`${this.titles.childName}成功`);
			    	this.titles.childName = ''
                }).catch(err => {
					this.$util.showMessage(err, 'error');
					this.btnLoad = false
                })
            },

			// 提交授权表单
			submitAuthorForm(){
				const author_time = this.authorForm.author_time;
				[this.authorForm.start, this.authorForm.end] = [author_time[0], author_time[1]];
				this.$axios.post('/platform/company/set-role.htm', {
                    ...this.authorForm,
					author_time: '',
                    name: '',
                    companyId: this.companyId
                }).then(() => {
					this.btnLoad = false;
					this.showDialog = false;
					this.$util.showMessage('授权成功');
                }).catch(err => {
                	this.$util.showMessage(err, 'error');
					this.btnLoad = false;
                })

            },

            // 获取授权列表
            getSetsList(){
                this.$axios.get('/platform/role/grid-role.htm').then(res => {
                	this.setsList = res.data.list
                }).catch(err => {
					this.$util.showMessage(err, 'error');
                })
            },

            // 重置表单
			resetForm(formName) {
				this.$refs[formName].resetFields();
			},

            // 微信支付
			handleWxpay(id){
				this.$prompt('请输入商户号', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					inputPattern: /\S/,
					inputErrorMessage: '请输入商户号'
				}).then(({value}) => {
					this.$axios.post('/platform/company/set-mchid.htm', {
						companyId: id,
						mchId: value
                    }).then(res => {
                    	this.$util.showMessage(res.msg);
                    	this.getData();
                    }).catch(err => {
						this.$util.showMessage(err, 'error');
                    })
				})
            }
        }
	}
</script>