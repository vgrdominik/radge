<template>
    <v-container>
        <CtCard :type="stored_config.branding.style.card" dense title="Configuración inicial">
            <template v-slot:rightTitleContent>
                <CtTooltip left btn btn-type="icon" btn-color="white" :btn-icon="['fas', is_saved_icon]">
                    <span v-if="is_saved">Guardado</span>
                    <span v-else-if="! is_saved && seconds_to_save !== 'saving'">Se guardará en <span v-html="seconds_to_save" /> segundos</span>
                    <span v-else-if="! is_saved">Guardando...</span>
                </CtTooltip>
            </template>
            <v-card-text v-if="stored_config.initialized">
                <v-row dense class="body-2">
                    <v-spacer />
                    <h1 class="body-1 text-uppercase text-center">Identificación fiscal de la empresa</h1>
                    <v-spacer />
                </v-row>
                <v-row dense class="body-2">
                    <v-spacer />
                    Estos datos saldrán en el tíquet.
                    <v-spacer />
                </v-row>

                <!-- Branding -->
                <v-row dense>
                    <v-spacer />
                    <v-col cols="12" sm="10">
                        <Branding :model="model.branding" />
                    </v-col>
                    <v-spacer />
                </v-row>

                <!-- Advanced options -->
                <v-row dense :class="{ 'body-2': true, 'mt-7': $vuetify.breakpoint.smAndDown }">
                    <v-spacer />
                    <v-col cols="12" sm="6" class="body-2 text-center justify-center">
                        <CtBtn :type="stored_config.branding.style.button" color="secondary" class="body-1 text-uppercase text-center" @click="advanced_option = ! advanced_option">Opciones avanzadas</CtBtn> (Click para mostrar/ocultar)
                    </v-col>
                    <v-spacer />
                </v-row>

                <template v-if="advanced_option">
                    <!-- ConfigSmtp -->
                    <v-row dense class="mt-5">
                        <v-spacer />
                        <v-col cols="12" sm="10">
                            <ConfigSmtp :model="model.smtp" />
                        </v-col>
                        <v-spacer />
                    </v-row>

                    <!-- Directories -->
                    <v-row dense class="mt-9">
                        <v-spacer />
                        <v-col cols="12" sm="3">
                            <CtFileInput webkitdirectory v-model="model.data_dir" :ctType="stored_config.branding.style.form" label="Directorio de datos" prepend-icon="mdi-folder" />
                        </v-col>
                        <v-col cols="12" sm="7" :class="{ 'body-2': true }">
                            Directorio donde se guardan los datos de la TPV. Configuraciones, familias, etc. Por defecto: app://./data
                        </v-col>
                        <v-spacer />
                    </v-row>
                    <v-row dense class="mt-6">
                        <v-spacer />
                        <v-col cols="12" sm="3">
                            <CtFileInput webkitdirectory v-model="model.import_dir" :ctType="stored_config.branding.style.form" label="Directorio de importación" prepend-icon="mdi-folder" />
                        </v-col>
                        <v-col cols="12" sm="7" :class="{ 'body-2': true }">
                            Directorio donde se guardan los datos a importar de la TPV. Configuraciones, familias, etc. Por defecto: app://./import_data
                        </v-col>
                        <v-spacer />
                    </v-row>

                    <!-- ConfigImportation -->
                    <v-row dense class="mt-5">
                        <v-spacer />
                        <v-col cols="12" sm="10">
                            <ConfigImportation :model="model.import" />
                        </v-col>
                        <v-spacer />
                    </v-row>
                </template>
            </v-card-text>
            <template v-slot:actions>
                <v-divider />
                <!-- Start TPV -->
                <v-row dense class="body-2">
                    <v-spacer />
                    <v-col cols="6" class="body-2 text-center justify-center">
                        <CtBtn color="primary" :type="stored_config.branding.style.button" class="body-1 text-uppercase text-center" @click="initRadge()">Iniciar Radge</CtBtn>
                    </v-col>
                    <v-spacer />
                </v-row>
            </template>
        </CtCard>
    </v-container>
</template>

<script>
import { ipcRenderer } from 'electron'
import { mapActions } from 'vuex'
import Branding from "../components/Branding";
import ConfigSmtp from "../components/ConfigSmtp";
import ConfigImportation from "../components/ConfigImportation";

export default {

    components: {ConfigImportation, ConfigSmtp, Branding},

    data() {
        return {
            // Save and get config
            is_saved: true,
            is_saved_icon: 'save',
            default_seconds_to_save: 5,
            // Information data about seconds until save
            seconds_to_save: 'saved',
            // Save config event to renderer process actions
            save_config_firing_event: null,
            // Save config event to renderer process actions
            save_config_renderer_event: null,
            // Save config event to listen main process state
            save_config_main_event: null,

            advanced_option: false,

            // Model values are determined by store. It's used to explain and samples.
            model: {
                branding: {
                    color_palette: {
                        primary: '#267699',
                        secondary: '#70B0CC',
                        accent: '#FF877A',
                        success: '#4CAF50',
                        error: '#FF5252',
                        warning: '#FFC107',
                        info: '#D19BA3',
                    },
                    style: {
                        button: 'text',
                        form: 'outlined',
                        card: 'shaped',
                        dialog_card: 'shaped',
                    },
                },
                // SMTP
                smtp: {
                    title: 'SMTP',
                    values: {
                        host: { value: '', type: 'text-field', label: 'Servidor', description: 'Url del servidor de correo' },
                        user: { value: '', type: 'text-field', label: 'Usuario', description: 'Usuario del servidor' },
                        password: { value: '', type: 'password', label: 'Password', description: 'Password del usuario del servidor' },
                        port: { value: '587', type: 'number', label: 'Puerto', description: '' },
                        type_encryption: { value: 'TLS', type: 'select', options: ['TLS', 'SSL', 'STARTTLS'], label: 'Encriptación', description: '' },
                        email_equal_user: { value: true, label: 'Correo igual a usuario', description: 'El correo tiene el mismo usuario que el del servidor.' },
                        email: { value: '', type: 'text-field', label: 'Correo electrónico', description: '' },
                        email_password_equal_user: { value: true, label: 'Password del correo igual al password', description: 'El password del correo es igual que el del servidor.' },
                        email_password: { value: '', type: 'text-field', label: 'Password correo', description: '' },
                    },
                },
                data_dir: { name: 'data', path: 'app://data' }, // default -> { name: 'data', path: 'app://data' }
                import_dir: { name: 'import_data', path: 'app://import_data' }, // default -> { name: 'import_data', path: 'app://import_data' }

                // Import
                import: {
                    type: 'csv', // Currently only support csv. Api support soon.

                    domain: {
                    },
                },
            },
        }
    },

    computed: {
        stored_config () {
            return this.$store.state.global.config
        }
    },

    watch: {
        is_saved (newValue) {
            if (newValue) {
                this.is_saved_icon = 'save'
            } else {
                this.is_saved_icon = 'pencil-alt'
            }
        },

        // Transform directory variables
        'model.data_dir' (newValue) {
            if (newValue instanceof File) {
                this.model.data_dir = {
                    name: this.model.data_dir.name,
                    path: this.model.data_dir.path,
                }
            }
            if (! newValue) {
                this.model.data_dir = { name: 'data', path: 'app://data' }
            }
        },
        'model.import_dir' (newValue) {
            if (newValue instanceof File) {
                this.model.import_dir = {
                    name: this.model.import_dir.name,
                    path: this.model.import_dir.path,
                }
            }
            if (! newValue) {
                this.model.import_dir = { name: 'data', path: 'app://import_data' }
            }
        },

        // Set global config from updates (Transformer output)
        model: {
            deep: true,
            handler() {
                if (! this.stored_config.initialized) {
                    return
                }
                this.is_saved = false

                // Set config values used globally
                this.$vuetify.theme.themes.light.primary = this.model.branding.color_palette.primary
                this.$vuetify.theme.themes.light.secondary = this.model.branding.color_palette.secondary
                this.$vuetify.theme.themes.light.accent = this.model.branding.color_palette.accent
                this.$vuetify.theme.themes.light.success = this.model.branding.color_palette.success
                this.$vuetify.theme.themes.light.error = this.model.branding.color_palette.error
                this.$vuetify.theme.themes.light.warning = this.model.branding.color_palette.warning
                this.$vuetify.theme.themes.light.info = this.model.branding.color_palette.info

                Object.entries(this.model.branding.color_palette).forEach(([key, element]) => this.setConfig({ path: 'branding>color_palette>'+key, value: element }))
                Object.entries(this.model.branding.style).forEach(([key, element]) => this.setConfig({ path: 'branding>style>'+key, value:  element }))
                Object.entries(this.model.smtp.values).forEach(([key, element]) => this.setConfig({ path: 'smtp>'+key, value:  element.value }))
                this.setConfig({ path: 'data_dir', value: this.model.data_dir })
                this.setConfig({ path: 'import_dir', value: this.model.import_dir })

                // Set event to save config to file
                this.$nextTick(() => {
                    this.save_config_renderer_event = setTimeout(
                        () => ipcRenderer.send('save_config', this.$store.state.global.config),
                        this.default_seconds_to_save * 1000
                    )
                    // Every second update time to save until 0
                    this.seconds_to_save = this.default_seconds_to_save
                    let save_config_firing_event_function = () => {
                        if (this.seconds_to_save > 'saved') {
                            return
                        } else if (this.seconds_to_save > 0) {
                            this.seconds_to_save -= 1
                        } else {
                            this.seconds_to_save = 'saving'
                        }

                        this.save_config_firing_event = setTimeout( () => {
                            save_config_firing_event_function()
                        }, 1000)
                    }
                    save_config_firing_event_function()
                })
            },
        },
    },

    mounted() {
        // Set event to capture config file is saved or not from main process
        this.save_config_main_event = (event, is_saved) => {
            this.is_saved = is_saved
        }
        ipcRenderer.on('save_config', this.save_config_main_event)

        this.setIsContainerNeeded(true)
        this.fetchConfig(this.stored_config)
    },

    beforeDestroy() {
        // Destroy listener to save_config event from main process
        ipcRenderer.removeListener('save_config', this.save_config_main_event)
    },

    methods: {
        initRadge() {
            ipcRenderer.send('save_config', this.$store.state.global.config)
            this.$router.push('/')
        },

        // Set global config to local (Transformer input)
        // config_initialized should be false
        fetchConfig (config) {
            // Turn initialized to false to no override model data.
            this.$store.state.global.config.initialized = false
            // Execute at next tick to populate initialized
            this.$nextTick(() => {
                Object.entries(config.branding.color_palette).forEach(([key, element]) => this.model.branding.color_palette[key] = element)
                Object.entries(config.branding.style).forEach(([key, element]) => this.model.branding.style[key] = element)
                Object.entries(config.smtp).forEach(([key, element]) => this.model.smtp.values[key].value = element)
                this.model.data_dir = config.data_dir
                this.model.import_dir = config.import_dir
                this.$store.state.global.config.initialized = true
            })
        },

        ...mapActions('global', [
            'setIsContainerNeeded',
            'setConfig',
            'setConfigComplete',
        ]),
    },
}
</script>
