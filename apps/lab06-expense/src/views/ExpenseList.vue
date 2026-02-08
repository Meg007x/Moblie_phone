<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="transparent-toolbar">
        <ion-title class="main-title">My Wallet 👛</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true" class="pastel-bg">

      <!-- Summary Card -->
      <div class="summary-card">
        <p class="label">ยอดเงินคงเหลือ</p>
        <h1 class="balance">฿ {{ formatMoney(totalBalance) }}</h1>

        <div class="summary-row">
          <div class="stat-box income">
            <div class="icon-circle"><ion-icon :icon="arrowUp"></ion-icon></div>
            <div>
              <span>รายรับ</span>
              <h3>{{ formatMoney(totalIncome) }}</h3>
            </div>
          </div>

          <div class="stat-box expense">
            <div class="icon-circle"><ion-icon :icon="arrowDown"></ion-icon></div>
            <div>
              <span>รายจ่าย</span>
              <h3>{{ formatMoney(totalExpense) }}</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading Spinner -->
      <div v-if="loading" class="ion-text-center ion-padding">
        <ion-spinner color="primary"></ion-spinner>
      </div>

      <!-- Expense List -->
      <div v-else class="list-container">
        <div class="list-header">
          <h3>รายการล่าสุด</h3>
          <span class="badge">{{ expenses.length }} รายการ</span>
        </div>

        <div v-if="expenses.length === 0" class="empty-state">
          <ion-icon :icon="sparkles" class="empty-icon"></ion-icon>
          <p>ยังไม่มีข้อมูล กดปุ่ม + เพื่อเริ่มจดเลย!</p>
        </div>

        <ion-list class="transparent-list">
          <ion-item-sliding v-for="item in expenses" :key="item.id" class="sliding-item">
            
            <ion-item
              lines="none"
              class="expense-item"
              button
              @click="router.push(`/edit-expense/${item.id}`)"
            >
              <div slot="start" class="category-bubble" :class="item.category">
                <ion-icon :icon="getCategoryIcon(item.category)"></ion-icon>
              </div>

              <ion-label>
                <h2>{{ item.title }}</h2>
                <p>{{ formatDate(item.createdAt) }} • {{ formatCategory(item.category) }}</p>
              </ion-label>

              <div slot="end" class="amount-text" :class="item.type">
                {{ item.type === 'income' ? '+' : '-' }} {{ formatMoney(item.amount) }}
              </div>
            </ion-item>

            <ion-item-options side="end">
              <ion-item-option color="danger" @click="deleteExpense(item.id)" class="delete-btn">
                <ion-icon slot="icon-only" :icon="trashOutline"></ion-icon>
              </ion-item-option>
            </ion-item-options>

          </ion-item-sliding>
        </ion-list>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button class="pastel-fab" @click="router.push('/add-expense')">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonFab, IonFabButton, IonIcon,
  IonSpinner, IonItemSliding, IonItemOptions, IonItemOption,
  alertController
} from '@ionic/vue';
import { add, trashOutline, arrowUp, arrowDown, sparkles, fastFood, bus, cart, cash, receipt, helpCircle } from 'ionicons/icons';

import { collection, query, orderBy, onSnapshot, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

const router = useRouter();
const expenses = ref<any[]>([]);
const loading = ref(true);
let unsubscribe: any = null;

// --- คำนวณสรุป ---
const totalIncome = computed(() => expenses.value.filter(i => i.type === 'income').reduce((s, i) => s + i.amount, 0));
const totalExpense = computed(() => expenses.value.filter(i => i.type === 'expense').reduce((s, i) => s + i.amount, 0));
const totalBalance = computed(() => totalIncome.value - totalExpense.value);

// --- ดึงข้อมูล Realtime ---
onMounted(() => {
  const q = query(collection(db, 'expenses'), orderBy('createdAt', 'desc'));
  unsubscribe = onSnapshot(q, snapshot => {
    expenses.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    loading.value = false;
  }, err => {
    console.error(err);
    loading.value = false;
  });
});

onUnmounted(() => { if (unsubscribe) unsubscribe(); });

// --- ลบรายการ ---
const deleteExpense = async (id: string) => {
  const alert = await alertController.create({
    header: 'ยืนยันการลบ',
    message: 'คุณต้องการลบรายการนี้ใช่ไหม?',
    buttons: [
      { text: 'ยกเลิก', role: 'cancel' },
      { text: 'ลบ', role: 'destructive', handler: async () => {
        await deleteDoc(doc(db, 'expenses', id));
      }}
    ]
  });
  await alert.present();
};

// --- ฟังก์ชันช่วย ---
const formatDate = (ts: Timestamp) => ts ? ts.toDate().toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) : '';
const formatMoney = (val: number) => val.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const getCategoryIcon = (c: string) => ({ food: fastFood, travel: bus, shopping: cart, salary: cash, bills: receipt }[c] || helpCircle);
const formatCategory = (c: string) => {
  const map: any = { food: 'อาหาร/เครื่องดื่ม', travel: 'เดินทาง', shopping: 'ช้อปปิ้ง', salary: 'เงินเดือน', bills: 'บิล/ค่าน้ำไฟ', other: 'อื่นๆ' };
  return map[c] || 'อื่นๆ';
};
</script>

<style scoped> 
/* พื้นหลังหลัก */
.pastel-bg {
  --background: #F8F8F8; /* สีขาวสะอาด */
  padding-bottom: 80px;
  font-family: 'Segoe UI', Roboto, sans-serif;
}

/* Toolbar */
.transparent-toolbar {
  background: transparent;
  --box-shadow: none;
}

.main-title {
  font-weight: 700;
  font-size: 24px;
  color: #1A1A1A; /* สีดำคลีน */
  letter-spacing: 0.5px;
}

/* Summary Card */
.summary-card {
  background: linear-gradient(135deg, #FFFFFF 0%, #F0F0F0 100%);
  margin: 20px;
  padding: 20px;
  border-radius: 20px;
  color: #1A1A1A;
  box-shadow: 0 8px 16px rgba(0,0,0,0.08);
}

.summary-card .label {
  margin: 0;
  font-size: 14px;
  opacity: 0.7;
}

.summary-card .balance {
  margin: 5px 0 20px 0;
  font-size: 32px;
  font-weight: 700;
  color: #1A1A1A;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  background: #FFFFFF;
  border-radius: 16px;
  padding: 15px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

/* Stat Boxes */
.stat-box {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-box span {
  font-size: 12px;
  opacity: 0.8;
}

.stat-box h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.icon-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.stat-box.income .icon-circle {
  background: #E0F7FA; /* ฟ้าอ่อน */
  color: #00796B;
}

.stat-box.expense .icon-circle {
  background: #FFEBEE; /* แดงอ่อน */
  color: #C62828;
}

/* List Header */
.list-container {
  padding: 0 20px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.list-header h3 {
  color: #555;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.badge {
  background: #E0E0E0;
  color: #444;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
}

/* Empty State */
.empty-state {
  text-align: center;
  margin-top: 50px;
  opacity: 0.5;
  color: #AAA;
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 10px;
  color: #CCC;
}

/* Expense List */
.transparent-list {
  background: transparent;
  padding: 0;
}

.sliding-item {
  margin-bottom: 12px;
  border-radius: 16px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  background: transparent;
}

.expense-item {
  --background: #FFFFFF;
  border-radius: 16px;
  --padding-start: 12px;
  --inner-padding-end: 12px;
  transition: all 0.2s ease-in-out;
}

.expense-item:hover {
  box-shadow: 0 6px 18px rgba(0,0,0,0.08);
}

.category-bubble {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  margin-right: 15px;
}

.category-bubble.food { background: #FF7043; }       /* ส้มเข้ม */
.category-bubble.travel { background: #29B6F6; }    /* ฟ้า */
.category-bubble.shopping { background: #AB47BC; }  /* ม่วง */
.category-bubble.bills { background: #26A69A; }     /* เขียวเทอร์คอยซ์ */
.category-bubble.salary { background: #FFCA28; }    /* เหลืองทอง */
.category-bubble.other { background: #B0BEC5; }     /* เทา */

.amount-text {
  font-weight: 700;
  font-size: 16px;
  white-space: nowrap;
}

.amount-text.income { color: #00796B; }   /* ฟ้าเขียวเข้ม */
.amount-text.expense { color: #C62828; }  /* แดงเข้ม */

/* FAB Button */
.pastel-fab {
  --background: #C62828;
  --color: #FFF;
  box-shadow: 0 4px 12px rgba(198,40,40,0.4);
  transition: all 0.2s ease-in-out;
}

.pastel-fab:hover {
  --background: #B71C1C;
  box-shadow: 0 6px 15px rgba(183,28,28,0.5);
}

/* Delete button */
.delete-btn {
  border-radius: 16px;
}
.pastel-fab {
  --background: #C62828;
  --color: #FFF;
  border-radius: 50%;      /* ให้เป็นวงกลมจริงๆ */
  box-shadow: 0 4px 12px rgba(198,40,40,0.3);
}
.pastel-fab:hover {
  --background: #B71C1C;
  box-shadow: 0 6px 15px rgba(183,28,28,0.5);
}
</style>
