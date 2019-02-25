<template>
    <div id="Titles" :class="{'has-child' : childName}">
        <p v-if="!childName">{{name}}</p>
        <p v-else><span @click="backPrev()"><i class="el-icon-arrow-left icons-left"></i> {{name}}</span> / {{childName}}</p>
    </div>
</template>

<script>
	export default {
		name: "Titles",
		props: {
			childName: {
		    	type: String,
                default: ''
            }
        },
        data(){
			return{
				name: this.$route.name
            }
        },
        watch: {
			'$route.name'(val){
				this.name = val
            }
        },
        methods: {
			backPrev(){
				this.$emit('backPrev')
            }
        }
	}
</script>