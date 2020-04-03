<template>
    <div>
      <iframe src="http://subs.valentigamez.com" :height="getCurrentHeight" :width="getCurrentWidth" />
    </div>
</template>

<script>
import {mapActions} from "vuex";

export default {
    computed: {
        getCurrentHeight() {
            return window.innerHeight
        },
        getCurrentWidth() {
            return window.innerWidth - 70
        },
    },

    mounted() {
        this.setIsContainerNeeded(false)
    },

    methods: {
        ...mapActions('global', [
            'setIsContainerNeeded',
        ]),
    }
}
</script>
