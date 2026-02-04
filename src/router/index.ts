import { createRouter, createWebHashHistory } from 'vue-router'
import { useStore } from '../store'

const routes = [
    {
        path: '/',
        redirect: () => {
            const { isTeacher } = useStore()
            return isTeacher.value ? '/teacher' : '/student'
        }
    },
    {
        path: '/teacher',
        component: () => import('../views/TeacherDashboard.vue'),
        children: [
            {
                path: '',
                name: 'TeacherHome',
                component: () => import('../views/TeacherHome.vue')
            },
            {
                path: 'quizzes',
                name: 'QuizManager',
                component: () => import('../views/QuizManager.vue')
            },
            {
                path: 'roster',
                name: 'RosterManager',
                component: () => import('../views/RosterManager.vue')
            },
            {
                path: 'faculty',
                name: 'TeacherManagement',
                component: () => import('../views/TeacherManagement.vue')
            }
        ]
    },
    {
        path: '/student',
        name: 'StudentView',
        component: () => import('../views/StudentView.vue')
    }
]

export const router = createRouter({
    history: createWebHashHistory(),
    routes
})
