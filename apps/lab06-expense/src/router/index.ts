import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import AddExpense from '@/views/AddExpense.vue';
import ExpenseList from '@/views/ExpenseList.vue';
import EditExpense from '@/views/EditExpense.vue';


const routes: Array<RouteRecordRaw> = [
  // หน้าแรกของแอป: รายการทั้งหมด
  { path: '/', component: ExpenseList },

  // เพิ่มรายการใหม่
  { path: '/add-expense', component: AddExpense },

  // แก้ไขรายการ
  { path: '/edit-expense/:id', component: EditExpense },

  {
  path: '/edit/:id',
  component: () => import('@/views/EditExpense.vue')
}


];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;
