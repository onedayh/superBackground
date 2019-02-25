<template>
    <div id="Index">
        <Sidebars />
        <div class="wrap">
            <Headers />
            <router-view />
        </div>
    </div>
</template>

<script>
    import Headers from '@/components/Headers';
    import Sidebars from '@/components/Sidebars';
    import * as types from '@/store/mutation_types';
	export default {
		name: "Index",
        components: {
			Headers,
			Sidebars
        },
        data(){
		    return {
		    	timer: null
            }
        },
        mounted(){
			this.timer = setTimeout(() => {
				this.$store.commit(types.CHANGE_LOGIN_STATE, 1)
            }, 3000)
        },

        destroyed(){
			clearTimeout(this.timer)
        }
	}
</script>