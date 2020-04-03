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
import Configuracion from '../pages/configuracion'

// Apps
import SUBS from '../pages/subs'
import PIM from '../pages/pim'
import CRM from '../pages/crm'

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
    { path: '/configuracion', component: Configuracion },

    // Apps
    { path: '/subs', component: SUBS },
    { path: '/pim', component: PIM },
    { path: '/crm', component: CRM },
]

export default routes
