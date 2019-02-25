<template>
    <div id="Filters">
        <p class="f-title">筛选查询</p>
        <el-form :label-width="labelWidth" label-position="left">
            <el-row :gutter="40">
                <el-col v-for="(item, index) in filterList" :key="index" :span="item.span">
                    <el-form-item :label="item.name">
                        <el-input
                            v-if="item.type === 'input'"
                            type="text"
                            v-model="item.value"
                            placeholder="请输入内容"
                            clearable
                        ></el-input>
                        <el-select
                            v-if="item.type === 'select'"
                            v-model="item.value"
                            placeholder="请选择"
                        >
                            <el-option
                                v-for="(it, idx) in item.selectList"
                                :key="idx"
                                :label="it.name"
                                :value="it.value"
                            ></el-option>
                        </el-select>
                        <el-date-picker
                            v-if="item.type === 'time'"
                            v-model="item.value"
                            type="datetimerange"
                            value-format="yyyy-MM-dd HH:mm:ss"
                            range-separator="至"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"
                        >
                        </el-date-picker>
                        <el-button @click="handleSearch()" :loading="searchLoad" class="my-btn" v-if="item.type === 'button'">{{searchLoad ? '查询中...' : '查询'}}</el-button>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
    </div>
</template>

<script>
	export default {
		name: "Filters",
        props: {
			filterList: {
				type: Array,
				default: () => {
					return []
				}
			},
			labelWidth: {
				type: String,
                default: '70px'
            },
			searchLoad: {
				type: Boolean,
				default: false
            }
        },

        methods: {
			handleSearch(){
				this.$emit('handleSearch')
            }
        }
	}
</script>