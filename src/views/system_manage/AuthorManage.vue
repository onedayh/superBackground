<template>
    <div id="AuthorManage">
        <!--标题-->
        <Titles />

        <!--查询-->
        <Filters
            :filterList="filters.filterList"
            @handleSearch="filters.handleSearch"
        />

        <!--列表-->
        <Tables
            tableName="套餐列表"
            :tableData="tables.tableData"
            :options="tables.options"
            :page="tables.page"
            :feedback="tables.feedback"
            @handle="tables.handle"
            @handlePage="tables.handlePage"
            @handleBtn="tables.handleBtn"
            @handleSizeChange="tables.handleSizeChange"
        />

        <!--权限-->
        <el-dialog title="授权商家" :visible.sync="showDialog">
            <el-form :model="authorForm" ref="authorForm" :rules="authorRules" class="form-div" label-width="140px">
                <el-form-item label="套餐名称" prop="roleName">
                    <el-input v-model="authorForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="套餐编码" prop="roleCode">
                    <el-input v-model="authorForm.roleCode"></el-input>
                </el-form-item>
                <el-form-item label="套餐描述" prop="description">
                    <el-input type="textarea" v-model="authorForm.description"></el-input>
                </el-form-item>
                <el-form-item label="可选菜单/权限" class="author" required v-loading="loading">
                    <ul class="first-tree">
                        <li v-for="(item, index) in authorData" :key="index">
                            <div :class="['label', {'active' : item.id === fid}]" @click="handleTree('first', item.id, index)">
                                <div :class="['check', {'checked' : menuIds.indexOf(item.id) > -1}]" @click.stop="checkTree('first', item.id, index)"></div>
                                <span>{{item.name}}</span>
                                <i :class="['el-tree-node__expand-icon', 'el-icon-caret-right', {'expanded': item.id === fid}]"></i>
                            </div>
                            <transition name="fade">
                                <ul class="sub-tree" v-show="item.id === fid">
                                    <li v-for="(it, idx) in item.infraPermissions" :key="idx">
                                        <div :class="['label', {'active' : it.id === sid}]" @click="handleTree('second', it.id, idx)">
                                            <div :class="['check', {'checked' : menuIds.indexOf(it.id) > -1}]" @click.stop="checkTree('second', it.id, idx)"></div>
                                            <span>{{it.name}}</span>
                                        </div>
                                    </li>
                                </ul>
                            </transition>
                        </li>
                    </ul>
                    <ul v-show="sid" class="third-tree">
                        <li v-for="(it, idx) in thirdTree">
                            <div class="label" @click="handleTree('third', it.id, idx)">
                                <div :class="['check', {'checked' : thirdIds.indexOf(it.id) > -1}]"></div>
                                <span>{{it.name}}</span>
                            </div>
                        </li>
                    </ul>
                </el-form-item>
                <p class="info">{{menuIds.length === 0 && submit ? '请选择可选菜单/权限' : ''}}</p>
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
		name: "AuthorManage",
		components: {
			Titles,
			Filters,
			Tables
		},
		data(){
			return{
				filters: {
					filterList: [
						{span: 6, name: '套餐名称', type: 'input', value: ''},
						{span: 6, name: '套餐编码', type: 'input', value: ''},
						{span: 6, name: '', type: 'button'}
					],
					handleSearch: () => {
						// 查询
                        this.tables.page.cur = 1;
						this.getData()
                    }
                },
                tables: {
					tableData: [],
                    options: [
                        {label: '套餐名称', prop: 'roleName'},
                        {label: '套餐编码', prop: 'roleCode'},
                        {label: '描述', prop: 'roleDescription', overflow: true},
                        {label: '操作', slot: [
                            {type: 'modify', name: '修改'},
                            {type: 'delete', name: '删除'}
                        ]},
                    ],
					page: {
						total: 60,       // 数据量
						cur: 1          // 当前页
					},
					handle: (row, type) => {
						if(type === 'modify'){
							// 修改
							this.handleAuthor(type, row)
                        }else if(type === 'delete'){
							// 删除
							this.handleDelete(row.roleId)
                        }
                    },
					handlePage: val => {
						// 切换页码
						this.tables.page.cur = val;
						this.$router.replace({path: `?page=${val}`});
						this.getData();
                    },
					handleSizeChange: () => {
						// 改变每页条数
						this.tables.page.cur = 1;
						this.getData()
                    },
					handleBtn: type => {
						// 新增
						if(type === 'add') this.handleAuthor(type)
					}
                },
				showDialog: false,
				authorForm: {
					roleName: '',
					roleCode: '',
					description: ''
                },
				authorRules: {
					roleName: [
                        {required: true, message: '请输入套餐名称', trigger: 'blur'}
                    ],
					roleCode: [
						{required: true, message: '请输入套餐编码', trigger: 'blur'}
					],
					description: [
						{required: true, message: '请输入套餐描述', trigger: 'blur'}
					]
                },
                authorData: [],     // 所有节点数据
				fid: null,          // 当前一级节点id
                findex: null,       // 当前一级节点索引
                sid: null,          // 当前二级节点id
                sindex: null,       // 当前二级节点索引
				thirdTree: [],      // 三级节点数据
                menuIds: [],        // 一、二级树已选节点数据
                thirdIds: [],       // 三级已选节点数据
				submit: false,      // 是否提交
				btnLoad: false,
				roleId: null,
				loading: false
			}
		},
        watch: {
			showDialog(val){
				if(!val){
					this.resetForm('authorForm');
					this.fid = this.authorData[0].id;
					this.findex = 0;
					this.sid = null;
					this.sindex = null;
					this.thirdTree = [];
					this.menuIds = [];
					this.thirdIds = [];
					this.submit = false;
					this.roleId = null;
					this.loading = false
                }
            }
        },
        computed: {
            ...mapState(['size'])
        },
        created(){
		    this.getData()
        },
		methods: {
			// 获取数据
			getData(){
				this.tables.feedback = 'loading';
				const {filterList} = this.filters;
				let params = {
					roleName: filterList[0].value,                  // 套餐名称
					roleCode: filterList[1].value                   // 套餐编码
				};
				this.$axios.post('/platform/role/grid-role.htm', {
					...params,
					sidx: '',
					sord: 'asc',
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

            // 新增 && 修改
			handleAuthor(type, data){
				this.showDialog = true;
				// 获取权限数据
				if(this.authorData.length === 0) this.getAuthorData();
				// 获取权限详情
				if(type === 'modify'){
					this.roleId = data.roleId;
					this.getSets(data)
                }
            },

            // 获取权限数据
            getAuthorData(){
				this.loading = true;
                this.$axios.get('/platform/role/menu-tree.htm').then(res => {
                	const {data} = res;
                    let authorData = data.filter(item => {
                    	return item.pId === 0
                    });
					authorData.forEach(item => {
                		data.forEach(it => {
							if(it.pId === item.id) item.infraPermissions.push(it)
                        })
                    })
                    this.authorData = authorData;
					this.fid = authorData[0].id;
					this.findex = 0;
					if(!this.roleId) this.loading = false;
                }).catch(err => {
                	this.$util.showMessage(err, 'error');
					if(!this.roleId) this.loading = false;
                })
            },

            // 获取权限详情
            getSets(data){
				this.loading = true;
                this.authorForm = {
					roleName: data.roleName,
					roleCode: data.roleCode,
					description: data.roleDescription
                }
                this.$axios.post('/platform/role/find-role.htm', {
					roleId: data.roleId
                }).then(res => {
                	let {infraMenus} = res.data;
					infraMenus.forEach(item => {
                		item.checked ? this.menuIds.push(item.id) : '';
                		if(item.pId > 0){
                			item.infraPermissions.forEach(it => {
								it.checked ? this.thirdIds.push(it.id) : '';
                            })
                        }
                    })
					this.loading = false;
                }).catch(err => {
					this.loading = false;
                	this.$util.showMessage(err, 'error')
                })
            },

            // 删除
			handleDelete(id){
				this.$util.showModel(`确认要删除该套餐吗？`, () => {
					this.$axios.post('/platform/role/delete-role.htm', {
						roleId: id
                    }).then(() => {
                    	this.$util.showMessage(`删除成功`);
                    	this.getData()
                    }).catch(err => {
						this.$util.showMessage(err, 'error');
                    })
                })
            },

			// 提交表单
			submitForm(formName) {
				this.submit = true;
				this.$refs[formName].validate((valid) => {
					if (valid) {
                        if(this.menuIds.length === 0) return;
						const text = this.roleId ? '修改' : '新增';
                        const url = this.roleId ? 'update' : 'insert';
						this.btnLoad = true;
						this.$axios.post(`/platform/role/${url}-role.htm`, {
                            ...this.authorForm,
							roleId: this.roleId,
							infraMenus: this.menuIds,
							infraPermissions: this.thirdIds
                        }).then(() => {
							this.getData();
                        	this.showDialog = false;
							this.btnLoad = false;
							this.$util.showMessage(`${text}成功`);
                        }).catch(err => {
							this.btnLoad = false;
							this.$util.showMessage(err, 'error')
                        })
					}
				});
			},

			// 重置表单
			resetForm(formName) {
				this.$refs[formName].resetFields();
			},

            // 点击树节点
			handleTree(type, id, index){
				const {authorData} = this;
				if(type === 'first'){
					// 一级节点
					this.fid = id;
					this.findex = index;
					this.sid = null;
					this.sindex = null;
					this.thirdTree = [];
				}else if(type === 'second'){
					// 二级节点
					this.sid = id;
					this.sindex = index;
					this.thirdTree = authorData[this.findex].infraPermissions[index].infraPermissions
				}else{
                    // 三级节点
					this.thirdCheck(id)
				}
			},

			// 选择树节点
			checkTree(type, id, index){
				let {menuIds} = this;
				this.handleTree(type, id, index);
				if(type === 'first'){
					// 一级节点
                    if(menuIds.indexOf(id) > -1){
                    	// 已勾选 => 去掉自身勾选，去掉子二级、三级节点的勾选
						menuIds = this.removeChecked(id, menuIds);
						this.firstCheck(index, false);
                    }else{
                    	// 未勾选 => 勾选自身，勾选子二级、三级节点
						this.firstCheck(index, true);
						menuIds.push(id)
                    }
				}else if(type === 'second'){
					// 二级节点
					if(menuIds.indexOf(id) > -1){
						// 勾选 => 去掉自身勾选，去掉子三级节点的勾选，若是最后一个去掉二级勾选，去掉一级父节点的勾选
						menuIds = this.removeChecked(id, menuIds);
						this.secondCheck(false)
					}else{
						// 未勾选 => 勾选自身，勾选子三级节点，若是第一个二级勾选，勾选一级父节点
						menuIds.push(id);
						this.secondCheck(true)
					}
				}
			},

            // 去除勾选
            removeChecked(id, ids){
				const index = ids.indexOf(id);
				if(index > -1) ids.splice(index, 1);
				return ids;
			},

            // 选择一级树节点
            firstCheck(index, type){
				const {authorData, menuIds, thirdIds} = this;
                if(type){
                	// 勾选
                    authorData[index].infraPermissions.forEach(item => {
                    	// 勾选所有未勾选的子二级树节点
                        if(menuIds.indexOf(item.id) === -1) menuIds.push(item.id);
                        item.infraPermissions.forEach(it => {
							// 勾选所有未勾选的子三级树节点
							if(thirdIds.indexOf(it.id) === -1) thirdIds.push(it.id);
                        })
                    })
                }else{
                    // 去掉勾选
					authorData[index].infraPermissions.forEach(item => {
						// 去掉所有已勾选的子二级树节点勾选
						if(menuIds.indexOf(item.id) > -1) this.removeChecked(item.id, menuIds);
						item.infraPermissions.forEach(it => {
							// 去掉所有已勾选的子三级树节点勾选
							if(thirdIds.indexOf(it.id) > -1) this.removeChecked(it.id, thirdIds);
						})
					})
                }
            },

            // 选择二级树节点
            secondCheck(type){
				const {authorData, menuIds, findex, fid, sindex, thirdIds} = this;
				if(type){
					// 勾选
					authorData[findex].infraPermissions[sindex].infraPermissions.forEach(item => {
						// 勾选所有未勾选的子三级树节点
						if(thirdIds.indexOf(item.id) === -1) thirdIds.push(item.id)
                    })
					// 若是第一个二级勾选，即父节点还未在数据中，勾选一级父节点
                    if(menuIds.indexOf(fid) === -1) menuIds.push(fid)
                }else{
					// 去掉勾选
					authorData[findex].infraPermissions[sindex].infraPermissions.forEach(item => {
						// 去掉所有已勾选的子三级树节点勾选
						if(thirdIds.indexOf(item.id) > -1) this.removeChecked(item.id, thirdIds)
					})
					// 若是最后一个去掉二级勾选，即兄弟节点全部不在数据中，去掉一级父节点的勾选
					const noin = authorData[findex].infraPermissions.every(item => menuIds.indexOf(item.id) === -1);
                    if(noin) this.removeChecked(fid, menuIds)
                }
            },

            // 选择三级节点
			thirdCheck(id){
				const {authorData, menuIds, findex, fid, sid, sindex, thirdIds} = this;
				if(thirdIds.indexOf(id) === -1){
					/*
					* 未勾选 =>
					* 勾选自身
					* 若是第一个三级勾选，勾选二级父节点
					* 若二级父节点也是第一个勾选，勾选一级父节点
					*/
					thirdIds.push(id);
					if(menuIds.indexOf(sid) === -1){
						menuIds.push(sid);
						if(menuIds.indexOf(fid) === -1) menuIds.push(fid)
                    }
                }else{
					/*
					*  已勾选 =>
					*  去掉自身勾选
					*  若是最后一个去掉三级勾选，去掉二级父节点的勾选
					*  若二级父节点也是最后一个去掉勾选，去掉一级父节点的勾选
					*/
                    this.removeChecked(id, thirdIds);
                    const noin1 = authorData[findex].infraPermissions[sindex].infraPermissions.every(item => thirdIds.indexOf(item.id) === -1);
                    if(noin1){
						this.removeChecked(sid, menuIds);
						const noin2 = authorData[findex].infraPermissions.every(item => menuIds.indexOf(item.id) === -1);
                        if(noin2) this.removeChecked(fid, menuIds);
                    }
                }
            }
		}
	}
</script>