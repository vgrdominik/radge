export const state = () => ({
  is_container_needed: '',
  date_format: new Intl.DateTimeFormat('en', { year: 'numeric', month: '2-digit', day: '2-digit' }),

  // miliseconds
  time_to_sync: 8000,
  default_time_to_sync: 8000,

  config: {
    initialized: false,

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
        host: '',
        user: '',
        password: '',
        port: '587',
        type_encryption: 'TLS',
        email_equal_user: true,
        email: '',
        email_password_equal_user: true,
        email_password: '',
    },

    // Directories
    data_dir: { name: 'data', path: 'app://data' }, // default -> { name: 'data', path: 'app://./data' }
    import_dir: { name: 'import_data', path: 'app://import_data' }, // default -> { name: 'import_data', path: 'app://./import_data' }
  },
})

export const actions = {
  setIsContainerNeeded(state, is_container_needed) {
    state.commit('updateIsContainerNeeded', is_container_needed)
  },
  setConfig(state, payload) {
    state.commit('updateConfigValue', payload)
  },
  setConfigComplete(state, payload) {
    state.commit('updateConfigComplete', payload)
  },
  setTimeToSync(state, payload) {
    state.commit('updateTimeToSync', payload)
  },
}

export const mutations = {
  updateIsContainerNeeded (state, is_container_needed) {
    state.is_container_needed = is_container_needed
  },
  updateConfigComplete (state, config) {
    state.config = config
  },
  updateTimeToSync (state, time_to_sync) {
    state.time_to_sync = time_to_sync
  },

  updateConfigValue (state, { path, value }) {
    let pathStack = path.split('>')
    let stateConfig = state.config

    while (pathStack.length>1) {
      stateConfig = stateConfig[pathStack.shift()]
    }

    let elementToUpdate = pathStack.shift()
    stateConfig[elementToUpdate] = value
  },
}
