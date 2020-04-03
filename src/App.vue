import {remote} from "electron";
import {ipcRenderer} from "electron";
import {ipcRenderer} from "electron";
<template>
  <v-app id="inspire">
    <v-navigation-drawer
            v-model="drawer"
            :clipped="$vuetify.breakpoint.lgAndUp"
            app
            mini-variant
    >
      <v-list dense>
        <template v-for="item in items">
          <v-row
                  v-if="item.heading"
                  :key="item.heading"
                  align="center"
          >
            <v-col cols="12">
              <v-subheader v-if="item.heading">
                {{ item.heading }}
              </v-subheader>
            </v-col>
          </v-row>
          <v-list-group
                  v-else-if="item.children"
                  :key="item.text"
                  v-model="item.model"
                  append-icon=""
          >
            <template v-slot:activator>
              <v-list-item-content @click="$router.push({ path: item.path })">
                <v-list-item-title class="primary--text">
                  {{ item.text }}
                </v-list-item-title>
              </v-list-item-content>
            </template>
            <v-list-item
                    v-for="(child, i) in item.children"
                    :key="i"
                    link
            >
              <v-list-item-action v-if="child.icon" @click="$router.push({ path: child.path })">
                <CtIcon :icon="child.icon" class="primary--text" />
              </v-list-item-action>
              <v-list-item-content @click="$router.push({ path: child.path })">
                <v-list-item-title class="primary--text">
                  {{ child.text }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-group>
          <v-list-item
                  v-else
                  :key="item.text"
                  link
          >
            <v-list-item-action @click="goToApp(item)">
              <CtIcon :icon="item.icon" class="primary--text" />
            </v-list-item-action>
            <v-list-item-content @click="goToApp(item)">
              <v-list-item-title class="primary--text">
                {{ item.text }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>

        <!-- TPV -->
        <v-list-item link>
          <v-list-item-action @click="execTpv()">
            <CtIcon :icon="['fas', 'desktop']" class="primary--text" />
          </v-list-item-action>
          <v-list-item-content @click="execTpv()">
            <v-list-item-title class="primary--text">
              TPV
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <!-- Exit -->
        <v-list-item link>
          <v-list-item-action @click="exit()">
            <CtIcon :icon="['fas', 'sign-out-alt']" class="primary--text" />
          </v-list-item-action>
          <v-list-item-content @click="exit()">
            <v-list-item-title class="primary--text">
              Salir
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
            :clipped-left="$vuetify.breakpoint.lgAndUp"
            app
            dark
            :collapse="collapseMenu"
            color="primary"
    >
      <CtBtn type="icon" :icon="['fas', (collapseMenu) ? 'eye' : 'eye-slash']" @click="collapseMenu = ! collapseMenu" class="mr-3" />

      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title
              style="width: 300px"
              class="ml-0 pl-4"
      >
        <CtBtn type="text" color="white" to="/">Radge</CtBtn>
      </v-toolbar-title>
      <v-spacer />

      <CtBtn type="text" :disabled="! is_installed" color="white" to="/jugar">
        Jugar
      </CtBtn>
      |
      <template v-if="user">
        <CtBtn type="text" color="white" @click="logout()">
          Salir
        </CtBtn>
      </template>
      <template v-else>
        <CtBtn type="text" color="white" to="/login">
          Login
        </CtBtn>
        |
        <CtBtn type="text" color="white" to="/registro">
          Registro gratuito
        </CtBtn>
      </template>
      <CtBtn type="icon" :icon="['fas', 'bell']" to="/notificaciones" />
    </v-app-bar>
    <v-content id="maincontent" class="pt-8">
      <router-view v-if="! isContainerNeeded" />
      <v-container
              class="fill-height"
              fluid
              v-else
      >
        <router-view />
      </v-container>
    </v-content>

    <v-footer padless fixed v-if="footerPaths.includes($router.currentRoute.path)">
      <CtCard type="empty" fluid flat tile width="100%" class="primary text-center">
        <v-card-text class="pa-0">
          <v-row dense>
            <v-col cols="12" sm="4" v-if="$vuetify.breakpoint.smAndUp">
              <CtBtn v-for="footerItem in footerItems" :key="footerItem.title" type="icon" target="_blank" :title="footerItem.title" :href="footerItem.href" :icon="footerItem.icon" class="mx-4 white--text" />
            </v-col>
            <v-col cols="12" sm="4" class="white--text pt-3" v-if="$vuetify.breakpoint.smAndUp">
              Recuerda pensar en tu producto y tus clientes!
            </v-col>
            <v-col cols="12" sm="4">
              <CtBtn type="text" color="white">Condiciones</CtBtn>
              <CtBtn type="text" color="white">{{ new Date().getFullYear() }} — Ryu</CtBtn>
            </v-col>
          </v-row>
        </v-card-text>
      </CtCard>
    </v-footer>
  </v-app>
</template>

<script>
import { mapMutations, mapActions } from 'vuex'
import { ipcRenderer, remote } from 'electron'
import _ from "underscore"

export default {
  props: {
    source: String,
  },

  data: () => ({
    // CONFIG SETTINGS
    // Get config event to listen main process state
    get_config_main_event: null,
    // END CONFIG SETTINGS

    // DOMAIN CONTENT
    get_content_main_event: null,
    // END CONTENT

    footerPaths: ['/', '/crm', '/pim', '/subs'],

    running_tpv_event: null,
    is_installed: false,
    check_is_installed_event: null,
    dialog: false,
    drawer: null,
    stateColor: 'primary', // primary = synchronized, secondary = not_synchronized, error = synchronized_error
    state: 'synchronized', // not_synchronized, synchronized_error
    collapseMenu: false,
    items: [
      { icon: ['fas', 'home'], text: 'Inicio', path: '/' },
      { icon: ['fas', 'pastafarianism'], text: 'CRM', path: '/crm' },
      { icon: ['fas', 'file-image'], text: 'PIM', path: '/pim' },
      { icon: ['fas', 'paper-plane'], text: 'Mailing', path: '/subs' },
      { icon: ['fas', 'cogs'], text: 'Configuración', path: '/configuracion' },
    ],
    footerItems: [
      {
        href: 'https://www.facebook.com/iamvalentigamez',
        icon: ['fab', 'facebook'],
        title: 'Página de Facebook',
      },
      {
        href: 'https://twitter.com/iamvalentigamez',
        icon: ['fab', 'twitter'],
        title: 'Pperfil de Twitter',
      },
      {
        href: 'https://www.instagram.com/iamvalentigamez/',
        icon: ['fab', 'instagram'],
        title: 'Perfil de Instagram',
      },
      {
        href: 'https://www.linkedin.com/in/valent%C3%AD-g%C3%A0mez-rojas-5919b073/',
        icon: ['fab', 'linkedin'],
        title: 'Perfil laboral en Linkedin',
      },
      {
        href: 'https://www.youtube.com/vgrdominik',
        icon: ['fab', 'youtube'],
        title: 'Canal de programación',
      },
    ],
  }),

  computed: {
    isContainerNeeded () {
      return this.$store.state.global.is_container_needed
    },

    user () {
      return this.$store.state.user.user
    },

    stored_config () {
      return this.$store.state.global.config
    },
  },

  mounted() {
    // Install events
    this.check_is_installed_event = (event, args) => {
      this.is_installed = args
      console.log('Is installed: ' + args)
    }
    ipcRenderer.on('check_is_installed', this.check_is_installed_event)
    this.checkInstall()
    // End install events

    // TPV Process
    this.running_tpv_event = (event, args) => {
      console.log(args)
    }
    ipcRenderer.on('running_tpv', this.running_tpv_event)
    // End TPV Process

    // Config events

    //console.log(this.stored_config)
    // console.log(JSON.stringify(this.stored_config))
    // Get current config
    this.get_config_main_event = (event, configData) => {
      this.setConfig({ path: 'initialized', value: false })
      this.setConfigComplete(configData)
      this.$vuetify.theme.themes.light.primary = configData.branding.color_palette.primary
      this.$vuetify.theme.themes.light.secondary = configData.branding.color_palette.secondary
      this.$vuetify.theme.themes.light.accent = configData.branding.color_palette.accent
      this.$vuetify.theme.themes.light.success = configData.branding.color_palette.success
      this.$vuetify.theme.themes.light.error = configData.branding.color_palette.error
      this.$vuetify.theme.themes.light.warning = configData.branding.color_palette.warning
      this.$vuetify.theme.themes.light.info = configData.branding.color_palette.info
      this.setConfig({ path: 'initialized', value: true })

      this.synchronization()
    }

    // Get and transform content from domain file to import
    this.get_content_main_event = (event, domain, content) => {
      // Transform domain content to app structure defined at global config
      let contentTransformed = []

      for (let i = 0; i < content.length; i++) {
        let contentTransformedElement = this.domainRowTransformerToAppStructure(domain, content[i])
        contentTransformed.push(contentTransformedElement)
      }

      // Set transformed content to use globally
      /* Currently has not domains
      if (domain === 'product') {
        contentTransformed = this.domainRowProductTransformerToAppStructure(contentTransformed)
        this.setProducts(contentTransformed)
      }
      */
    }

    ipcRenderer.on('get_config', this.get_config_main_event)
    ipcRenderer.on('get_content', this.get_content_main_event)
    ipcRenderer.send('get_config', this.check_is_installed_event)

    setTimeout(() => this.update_time_to_sync(), 1000)
    // End config events

    // In development mode
    document.addEventListener("keydown", function (e) {
      if (e.which === 123) {
        remote.getCurrentWindow().toggleDevTools();
      } else if (e.which === 116) {
        location.reload();
      }
    })
    // End in development mode
  },

  beforeDestroy() {
    // Destroy listener to get_config and get_content event from main process
    ipcRenderer.removeListener('get_config', this.get_config_main_event)
    ipcRenderer.removeListener('get_content', this.get_content_main_event)
    ipcRenderer.removeListener('check_is_installed', this.check_is_installed_event)
    ipcRenderer.removeListener('running_tpv', this.running_tpv_event)
  },

  methods: {
    update_time_to_sync() {
      if (this.$store.state.global.time_to_sync <= 0) {
        // this.synchronization() TODO
        this.setTimeToSync(this.$store.state.global.default_time_to_sync)
      } else {
        this.setTimeToSync(this.$store.state.global.time_to_sync - 1000)
      }

      setTimeout(() => this.update_time_to_sync(), 1000)
    },

    exit() {
      remote.getCurrentWindow().close()
    },

    execTpv() {
      ipcRenderer.send('exec_tpv')
    },

    checkInstall() {
      ipcRenderer.send('check_is_installed')
    },

    afterLogout(){
      this.setToken('')
      this.removeUser()
      setTimeout(() => this.$router.push({ path: '/' }), 2000)
    },

    logout () {
      this.$axios.post('/api/logout', {},{
        headers: { Authorization: 'Bearer ' + this.$store.state.user.token }
      })
              .then(() => this.afterLogout())
    },

    goToApp(app) {
      this.collapseMenu = true
      this.$router.push({ path: app.path })
    },

    synchronization () {
      /*
      Currently has not data to sync
      ipcRenderer.send('get_content', 'product', this.stored_config.import.type)
       */
    },


    // START Import methods

    domainRowTransformerToAppStructure(domain, contentRow) {
      // Convert columns to fields
      let rowContentTransformed = contentRow.map((contentToTransform) => {
        let contentTransformed = {}

        // contentToTransform[z] is { column: 'example', content: 'example' } ====> column = Column/Field of type, csv by default
        // (_.invert(this.stored_config.import.domain[domain].fields_columns))[contentToTransform.column] ====> get key (domain field) from column content (domain column in type, csv by default) ====> gets domain field
        let domainField = (_.invert(this.stored_config.import.domain[domain].fields_columns))[contentToTransform.column]
        if (domainField === undefined) {
          // To columns not defined in global config
          contentTransformed.control = null
          return contentTransformed
        }
        contentTransformed[domainField] = contentToTransform.content

        return contentTransformed
      })

      // Convert array to unique object
      let normalizedContentTransformed = {}
      for (let z = 0; z < rowContentTransformed.length; z++) {
        let contentKey = Object.keys(rowContentTransformed[z])[0]
        // To columns defined in global config
        if (contentKey !== 'control') {
          // Insert content to normalized object with domain key field
          normalizedContentTransformed[contentKey] = rowContentTransformed[z][contentKey]
        }
      }

      return normalizedContentTransformed
    },

    // Example method to specific domain
    domainRowProductTransformerToAppStructure(contentPreTransformed) {
      let contentTransformed = []

      for (let i = 0; i < contentPreTransformed.length; i++) {
        if (contentPreTransformed[i].complement_ids_available) {
          contentPreTransformed[i].complement_ids_available = contentPreTransformed[i].complement_ids_available.split(',')
        }

        contentTransformed.push(contentPreTransformed[i])
      }

      return contentTransformed
    },

    // END Import methods

    ...mapActions({
      setToken: 'user/setToken',
    }),

    ...mapActions('global', [
      'setConfig',
      'setConfigComplete',
      'setTimeToSync',
    ]),

    ...mapMutations({
      removeUser: 'user/removeUser',
    }),
  },
}
</script>
<style>
  body{
    margin: 0;
    padding: 0;
    border: 0;
    overflow: hidden;
    height: 100%;
    max-height: 100%;
  }

  /* SCROLL THEME */

  /* Added to body */
  .ct-scroll_none::-webkit-scrollbar {
    display: none
  }

  ::-webkit-scrollbar {
    width: 12px;
  }

  ::-webkit-scrollbar-track {
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: #6C8894;
  }

  /* END SCROLL THEME */

  #maincontent{
    position: fixed;
    top: 0px; /*Set top value to HeightOfTopFrameDiv*/
    bottom: 50px; /*Set bottom value to HeightOfBottomFrameDiv*/
    overflow: hidden;
    width: 100%;
  }
</style>
