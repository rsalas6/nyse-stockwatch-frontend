import { createRouter, createWebHistory } from 'vue-router';
import IndexView from '../views/IndexView.vue';
import CompanyView from '../views/CompanyView.vue';
import AboutView from '../views/AboutView.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'IndexView',
            component: IndexView
        },
        {
            path: '/company/:uuid',
            name: 'CompanyView',
            component: CompanyView
        },
        {
            path: '/about',
            name: 'AboutView',
            component: AboutView
        }
    ]
});

export default router;
