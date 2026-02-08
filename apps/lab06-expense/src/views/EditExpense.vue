<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/home"></ion-back-button>
        </ion-buttons>
        <ion-title>แก้ไขรายการ</ion-title>

        <ion-buttons slot="end">
          <ion-button color="danger" @click="confirmDelete">
            ลบ
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">

      <div v-if="loadingData" class="ion-text-center ion-padding">
        <ion-spinner color="primary"></ion-spinner>
        <p>กำลังโหลดข้อมูล...</p>
      </div>

      <form v-else class="expense-form">

        <!-- ชื่อรายการ -->
        <div class="field">
          <label>ชื่อรายการ</label>
          <ion-input v-model="item.title"></ion-input>
        </div>

        <!-- จำนวนเงิน -->
        <div class="field">
          <label>จำนวนเงิน (บาท)</label>
          <ion-input v-model="item.amount" type="number"></ion-input>
        </div>

        <!-- ประเภท -->
        <div class="field">
          <label>ประเภท</label>
          <div class="type-toggle">
            <button
              :class="{ active: item.type === 'expense' }"
              @click.prevent="item.type = 'expense'"
            >
              รายจ่าย
            </button>
            <button
              :class="{ active: item.type === 'income' }"
              @click.prevent="item.type = 'income'"
            >
              รายรับ
            </button>
          </div>
        </div>

        <!-- หมวดหมู่ -->
        <div class="field">
          <label>หมวดหมู่</label>
          <ion-select v-model="item.category" placeholder="เลือกหมวดหมู่">
            <ion-select-option value="food">อาหาร</ion-select-option>
            <ion-select-option value="travel">เดินทาง</ion-select-option>
            <ion-select-option value="shopping">ช้อปปิ้ง</ion-select-option>
            <ion-select-option value="salary">เงินเดือน</ion-select-option>
            <ion-select-option value="other">อื่น ๆ</ion-select-option>
          </ion-select>
        </div>

        <!-- หมายเหตุ -->
        <div class="field">
          <label>หมายเหตุ</label>
          <ion-textarea v-model="item.note" rows="3"></ion-textarea>
        </div>

        <ion-button expand="block" @click="updateData" :disabled="isSaving">
          บันทึกการแก้ไข
        </ion-button>

      </form>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import {
  toastController,
  alertController,
  onIonViewWillEnter
} from '@ionic/vue'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonButton,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonSpinner
} from '@ionic/vue'


const route = useRoute()
const router = useRouter()
const expenseId = route.params.id as string

const loadingData = ref(true)
const isSaving = ref(false)

const item = ref({
  title: '',
  amount: '',
  type: 'expense',
  category: '',
  note: ''
})

/* ======================
   โหลดข้อมูลเดิม (สำคัญ)
====================== */
const loadExpense = async () => {
  loadingData.value = true
  try {
    const docRef = doc(db, 'expenses', expenseId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      router.replace('/home')
      return
    }

    const data = docSnap.data()

    item.value = {
      title: data.title ?? '',
      amount: data.amount?.toString() ?? '',
      type: data.type ?? 'expense',
      category: data.category ?? '',
      note: data.note ?? ''
    }
  } catch (e) {
    console.error(e)
  } finally {
    loadingData.value = false
  }
}

/* Ionic lifecycle (แทน onMounted) */
onIonViewWillEnter(() => {
  loadExpense()
})

/* ======================
   อัปเดตข้อมูล
====================== */
const updateData = async () => {
  if (!item.value.title || !item.value.amount || !item.value.category) {
    const t = await toastController.create({
      message: 'กรุณากรอกข้อมูลให้ครบ',
      duration: 2000,
      position: 'top'
    })
    return t.present()
  }

  isSaving.value = true
  try {
    await updateDoc(doc(db, 'expenses', expenseId), {
      title: item.value.title,
      amount: Number(item.value.amount),
      type: item.value.type,
      category: item.value.category,
      note: item.value.note,
      updatedAt: serverTimestamp()
    })

    const t = await toastController.create({
      message: 'อัปเดตข้อมูลเรียบร้อย',
      duration: 1500,
      color: 'success',
      position: 'top'
    })
    await t.present()

    router.back() // 🔙 กลับหน้ารายการ
  } catch (e) {
    console.error(e)
  } finally {
    isSaving.value = false
  }
}

/* ======================
   ลบข้อมูล
====================== */
const confirmDelete = async () => {
  const alert = await alertController.create({
    header: 'ยืนยันการลบ',
    message: 'คุณต้องการลบรายการนี้ใช่ไหม?',
    buttons: [
      { text: 'ยกเลิก', role: 'cancel' },
      {
        text: 'ลบ',
        role: 'destructive',
        handler: async () => {
          await deleteDoc(doc(db, 'expenses', expenseId))
          router.back()
        }
      }
    ]
  })
  await alert.present()
}
</script>


<style scoped>
.expense-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field label {
  font-size: 14px;
  margin-bottom: 4px;
  display: block;
}

.type-toggle {
  display: flex;
  gap: 10px;
}

.type-toggle button {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  background: white;
}

.type-toggle button.active {
  background: #3880ff;
  color: white;
}
</style>
