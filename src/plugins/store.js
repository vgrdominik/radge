import Vue from 'vue'
import Vuex from 'vuex'
import { state as serverMessageState, actions as serverMessageActions, mutations as serverMessageMutations } from '../stores/serverMessage'
import { state as userState, actions as userActions, mutations as userMutations } from '../stores/user'

Vue.use(Vuex)

export default new Vuex.Store({
    modules: {
        serverMessage: {
            namespaced: true,
            state: serverMessageState,
            actions: serverMessageActions,
            mutations: serverMessageMutations,
        },
        user: {
            namespaced: true,
            state: userState,
            actions: userActions,
            mutations: userMutations,
        },
    },
})
