import DiaADia from '../pages/dia-a-dia'
import Index from '../pages/index'
import Login from '../pages/login'
import Notificaciones from '../pages/notificaciones'
import Play from '../pages/jugar'
import RecordarPassword from '../pages/recordar-password'
import RecordarPasswordFin from '../pages/recordar-password-fin'
import RecordarPasswordFormulario from '../pages/recordar-password-formulario'
import Registro from '../pages/registro'
import SalaDeEspera from '../pages/sala-de-espera'

let routes = [
    { path: '/dia-a-dia', component: DiaADia },
    { path: '/', component: Index },
    { path: '/login', component: Login },
    { path: '/notificaciones', component: Notificaciones },
    { path: '/jugar', component: Play },
    { path: '/recordar-password', component: RecordarPassword },
    { path: '/recordar-password-fin', component: RecordarPasswordFin },
    { path: '/recordar-password-formulario', component: RecordarPasswordFormulario },
    { path: '/registro', component: Registro },
    { path: '/sala-de-espera', component: SalaDeEspera },
]

export default routes
