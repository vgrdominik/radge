<template>
    <v-container>
        <v-row dense>
          <v-spacer />
          <CtBtn @click="install()" class="mx-auto">
            Instalar
          </CtBtn>
          <v-spacer />
        </v-row>
        <v-row dense>
          <v-spacer />
          <CtBtn @click="installManager()" class="mx-auto">
            Instalar manager
          </CtBtn>
          <v-spacer />
        </v-row>
        <v-row dense>
          <v-spacer />
          <CtBtn @click="checkInstall()" class="mx-auto">
            Comprobar instalación
          </CtBtn>
          <v-spacer />
        </v-row>
        <v-row dense>
          <v-spacer />
          <CtBtn to="/jugar" :disabled="! is_installed" class="mx-auto">
            Jugar
          </CtBtn>
          <v-spacer />
        </v-row>
    </v-container>
</template>

<script>
import { ipcRenderer } from 'electron'
export default {

    data() {
        return {
            is_installed: false,
            running_install_event: null,
            check_is_installed_event: null,
            running_install_manager_event: null,
        }
    },

    mounted() {
        this.running_install_event = (event, args) => {
            console.log(args)
        }
        this.running_install_manager_event = (event, args) => {
            console.log(args)
        }
        this.check_is_installed_event = (event, args) => {
            this.is_installed = args
            console.log('Is installed: ' + args)
        }
        ipcRenderer.on('running_install', this.running_install_event)
        ipcRenderer.on('running_install_manager', this.running_install_manager_event)
        ipcRenderer.on('check_is_installed', this.check_is_installed_event)
        this.checkInstall()
    },

    beforeDestroy() {
        ipcRenderer.removeListener('running_install', this.running_install_event)
        ipcRenderer.removeListener('check_is_installed', this.check_is_installed_event)
    },

    methods: {
        install() {
            ipcRenderer.send('install')
        },
        installManager() {
            ipcRenderer.send('install_manager')
        },
        checkInstall() {
            ipcRenderer.send('check_is_installed')
        },
    },
}
</script>
