import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
	{
		path:'/',
		redirect:'/home'
	},
	{
		path:'/home',
		component:() => import('@/views/Home')
	},{
		path:'/about',
		component:() => import('@/views/About')
	}
]

export function createRouter() {
	return new VueRouter({
		mode: 'history', //一定要是history模式
		// base: process.env.BASE_URL,
		routes: routes
	})
}
