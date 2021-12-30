import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

import { BASE_URL } from '@/configs';

const RootLayout = () => import(/* webpackChunkName: "root-layout" */ '@/views/RootLayout.vue');

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Root',
    component: RootLayout,
  },
];

const router = createRouter({
  history: createWebHistory(BASE_URL),
  routes,
});

export default router;
