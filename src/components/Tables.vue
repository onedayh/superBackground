<template>
    <div id="Tables">
        <div class="head">
            <p>{{tableName}}</p>
            <el-button class="my-btn" @click="handleBtn('add')">新增</el-button>
            <el-button v-if="otherBtn" class="my-btn other-btn" @click="handleBtn('other')">{{otherBtn}}</el-button>
        </div>
        <el-table
            :style="paddingBottom"
            v-loading="feedback === 'loading'"
            element-loading-text="加载中..."
            header-row-class-name="table-header"
            :data="tableData"
            :max-height="bodyHeight"
            style="width: 100%"
            empty-text=" "
            ref="tableRef"
            @sort-change="handleSort"
            @selection-change="handleSelect"
        >
            <el-table-column v-if="selection" type="selection" min-width="50"></el-table-column>
            <el-table-column
                v-for="(item, index) in options"
                v-if="item.hide ? Boolean(false) : Boolean(true)"
                :key="index"
                :prop="item.prop"
                :align="item.slot || item.center ? 'center' : ''"
                :align-header="item.slot || item.center ? 'center' : ''"
                :label="item.label"
                :show-overflow-tooltip="item.overflow ? Boolean(true) : Boolean(false)"
                :sortable="item.sort"
                :min-width="item.width ? item.width : 100"
                :fixed="item.fixed"
            >
                <template slot-scope="scope">
                    <span v-if="!item.src" :class="renderClass(scope.row[item.prop], item.render)">{{scope.row[item.prop]}}</span>
                    <el-button
                        v-for="(it, idx) in item.slot"
                        :key="idx"
                        @click="handle(scope.row, it.type)"
                        v-if="!(it.value && it.value === scope.row[it.prop])"
                        type="text"
                        size="small"
                    >
                        {{it.name}}
                    </el-button>
                    <img v-if="item.src" class="table-img" :src="scope.row[item.prop]" alt="">
                </template>
            </el-table-column>
        </el-table>
        <div class="feedback" v-show="feedback === 'error' || feedback === 'empty'">
            <span v-if="feedback === 'error' || feedback === 'empty'">{{feedback === 'error' ? '获取数据失败' : feedback === 'empty' ? '暂无数据' : ''}}</span>
        </div>
        <el-pagination
            v-if="page.total > 0"
            @size-change="handleSizeChange"
            @current-change="handlePage"
            :current-page="page.cur"
            :page-sizes="[10, 20, 50]"
            :page-size="size"
            layout="total, sizes, prev, pager, next, jumper"
            :total="page.total">
        </el-pagination>
    </div>
</template>

<script>
    import {mapState, mapMutations} from 'vuex';
    import {CHANGE_SIZE} from '@/store/mutation_types';

    export default {
        name: "tables",
        props: {
            otherBtn: {
                type: String,
                default: ''
            },
            tableName: {
                type: String,
                default: ''
            },
            tableData: {        // 表格数据
                type: Array,
                default: () => []
            },
            /*
            *   表格配置【options】：接受一个<<对象数组>>
            *   字段说明：
            *   【hide】 => Boolean（非必填）=> default: false，为<true>时该列隐藏
            *   【label】 => String（必填） => 表头名称
            *   【prop】 => String（非必填） => 对应单元格的字段 => 有【slot】时不填，否则必填
            *   【render】 => Array（非必填） => 根据单元格内容给出对应的类名
            *              接受一个<<对象数组>>
            *              字段说明：
            *             【myTarget】 => String/Number（必填） => 比较的对象
            *             【myClass】 => String（必填） => 满足条件时的类名
            *             【mode】 => String（非必填） => 比较方法:
            *                                           'more' => 大于【myTarget】的值
            *                                           'less' => 小于【myTarget】的值
            *                                           不填【mode】 => 等于【myTarget】的值
            *    【slot】 => Array（非必填） => 对应单元格的操作
            *              接受一个<<对象数组>>
            *              字段说明：
            *              【type】 => String（必填） => 操作类型
            *              【name】 => String（必填） => 名字
            *    【sort】 => String => 排序 custom
            *    【center】 => Boolean => default: false => 为<true>时该列居中对齐, 默认局左对齐
            *    【overflow】 => Boolean => default: false => 为<true>时内容溢出隐藏
            *    【min-width】 => Number => 列宽度
            */
            options: {
                type: Array,
                default: () => []
            },
            page: {        // 页数配置
                type: Object,
                default: () => {
                    return {
                        total: 0,       // 数据量
                        cur: 1          // 当前页
                    }
                }
            },
            feedback: {         // 用户体验反馈 => 'loading'-加载中， 'empty'-暂无数据,  'error'-获取数据失败
                type: String,
                default: ''
            },
            selection: {        // 是否开启复选框
                type: Boolean,
                default: false
            },
            bodyHeight: {       // 限制table-body高度
                type: Number
            },
            emptySelectionData: {   // 清空复选数据
                type: Boolean,
                default: false
            }
        },

        data() {
            return {
                selectData: [],   // 复选数据
                togglePage: false
            }
        },

        watch: {
            // 清空复选数据
            emptySelectionData(val) {
                if (val) {
                    this.selectData = [];
                    this.$refs.tableRef.clearSelection();
                }
            }
        },

        computed: {
            ...mapState(['size']),

            paddingBottom() {
                return this.page.total ? {'padding-bottom': '70px'} : {'padding-bottom': 0}
            }
        },

        methods: {
            ...mapMutations([CHANGE_SIZE]),
            // 操作
            handle(row, type) {
                this.$emit('handle', row, type)
            },

            // 排序
            handleSort({prop, order}) {
                this.$emit('handleSort', prop, order)
            },

            // 类名
            renderClass(target, renderList) {
                let myClass = '', firstRender = false;
                if (!renderList) return;
                renderList.forEach(item => {
                    if (!item.mode && item.myTarget === target) {
                        if (firstRender) {
                            myClass += ' ' + item.myClass
                        } else {
                            myClass += item.myClass;
                            firstRender = true
                        }
                    } else if (item.mode === 'more' && target > item.myTarget) {
                        if (firstRender) {
                            firstRender = true;
                            myClass += ' ' + item.myClass
                        } else {
                            myClass += item.myClass;
                            firstRender = true
                        }
                    } else if (item.mode === 'less' && target < item.myTarget) {
                        if (firstRender) {
                            myClass += ' ' + item.myClass
                        } else {
                            myClass += item.myClass;
                            firstRender = true
                        }
                    }
                })
                return myClass
            },

            // 切换页数
            handlePage(val) {
                const that = this;
                this.togglePage = true;
                that.$emit('handlePage', val);
                // 若开启复选，每次切换页码查找当页是否有已勾选的选项
                if (that.selection) {
                    const selectData = that.selectData;
                    let n = 0;
                    const timer = setInterval(() => {
                        n++;
                        if (that.tableData.length > 0) {
                            if (selectData.length > 0) that.toggleSelection(selectData, val);
                            clearInterval(timer)
                        } else {
                            if (n > 6) clearInterval(timer)
                        }
                    }, 500)
                }
            },

            // 指定切换页数
            handleSizeChange(val) {
                this[CHANGE_SIZE](val);
                this.$emit('handleSizeChange');
            },

            // 勾选，并保存数据
            handleSelect(val) {
                if (this.emptySelectionData) return;
                const that = this, cur = that.page.cur;
                let selectData = that.selectData;
                if (selectData.length === 0) {
                    // 数据为空，直接push
                    selectData.push({
                        page: cur,
                        data: val
                    })
                } else {
                    // 数据不为空，判断当前页是否有数据，有就替换，没有就push
                    let index = 0;
                    const paged = selectData.some((item, idx) => {
                        if (item.page === cur) {
                            index = idx;
                            return true
                        }
                    })
                    if (paged) {
                        if (val.length > 0 || !this.togglePage) selectData[index].data = val
                    } else {
                        selectData.push({
                            page: cur,
                            data: val
                        })
                    }
                }
                that.selectData = selectData;
                this.togglePage = false;
                that.$emit('handleSelect', selectData)
            },

            // 查找当页是否有已勾选的选项, 有就勾选
            toggleSelection(selectData, val) {
                let index = 0;
                const that = this, paged = selectData.some((item, idx) => {
                    if (item.page === val) {
                        index = idx;
                        return true
                    }
                })
                if (paged && selectData[index].data.length > 0) {
                    let useIdx = [];
                    that.tableData.forEach((item, idx) => {
                        selectData[index].data.forEach(it => {
                            if (JSON.stringify(item) === JSON.stringify(it)) useIdx.push(idx)
                        })
                    })
                    useIdx.forEach(item => {
                        that.$refs.tableRef.toggleRowSelection(that.tableData[item])
                    })
                }
            },

            // handleBtn
            handleBtn(type) {
                this.$emit('handleBtn', type)
            }
        }
    }
</script>
