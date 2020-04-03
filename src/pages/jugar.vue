<template>
    <v-container>
        Test
    </v-container>
</template>

<script>
import { ipcRenderer } from 'electron'
export default {

    data() {
        return {
            running_play_event: null,
        }
    },

    mounted() {

        this.running_play_event = (event, args) => {
            console.log(args)
        }
        ipcRenderer.on('running_play', this.running_play_event)
        this.play()
    },

    beforeDestroy() {
        ipcRenderer.removeListener('running_play', this.running_play_event)
    },

    methods: {
        play() {
            ipcRenderer.send('play')
        },
    },
}
</script>
