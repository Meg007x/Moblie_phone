<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>เพิ่มรายการ</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form class="expense-form" @submit.prevent="saveData">

        <!-- ชื่อรายการ -->
        <div class="field">
          <label>ชื่อรายการ</label>
          <ion-input v-model="title" placeholder="เช่น ค่าอาหาร"></ion-input>
        </div>

        <!-- จำนวนเงิน -->
        <div class="field">
          <label>จำนวนเงิน (บาท)</label>
          <ion-input v-model="amount" type="number"></ion-input>
        </div>

        <!-- ประเภท -->
        <div class="field">
          <label>ประเภท</label>
          <div class="type-toggle">
            <button
              :class="{ active: type === 'expense' }"
              @click.prevent="type = 'expense'"
            >
              รายจ่าย
            </button>
            <button
              :class="{ active: type === 'income' }"
              @click.prevent="type = 'income'"
            >
              รายรับ
            </button>
          </div>
        </div>

        <!-- หมวดหมู่ -->
        <div class="field">
          <label>หมวดหมู่</label>
          <ion-select v-model="category" placeholder="เลือกหมวดหมู่">
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
          <ion-textarea v-model="note" :rows="3"></ion-textarea>
        </div>

        <ion-button expand="block" type="submit" :disabled="loading">
          บันทึก
        </ion-button>

      </form>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { toastController } from '@ionic/vue'

// 🔹 Import Ionic components (สำคัญสำหรับ <script setup>)
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonButton
} from '@ionic/vue'

const router = useRouter()

const title = ref('')
const amount = ref('')
const type = ref('expense')
const category = ref('')
const note = ref('')
const loading = ref(false)

const saveData = async () => {
  const amt = Number(amount.value)
  if (!title.value.trim() || isNaN(amt) || !category.value) {
    const t = await toastController.create({
      message: '⚠️ กรุณากรอกข้อมูลให้ครบ',
      duration: 2000,
      color: 'medium',
      position: 'top'
    })
    return t.present()
  }

  loading.value = true
  try {
    await addDoc(collection(db, 'expenses'), {
      title: title.value.trim(),
      amount: amt,
      type: type.value,
      category: category.value,
      note: note.value.trim(),
      createdAt: serverTimestamp()
    })

    const t = await toastController.create({
      message: 'บันทึกเรียบร้อย! 🎉',
      duration: 1500,
      color: 'success',
      position: 'top'
    })
    await t.present()

    router.go(-1)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>
<style scoped>
/* --- ใช้ฟอนต์ไม่มีหัว สำหรับหน้า Add --- */
:root {
  --ion-font-family: 'Roboto', 'Segoe UI', 'Helvetica Neue', sans-serif;
}

/* ion-page / ion-content */
ion-page, ion-content {
  font-family: var(--ion-font-family) !important;
}

/* Shadow DOM ของ Input, Textarea, Select */
ion-input::part(native),
ion-textarea::part(native),
ion-select::part(native) {
  font-family: var(--ion-font-family) !important;
  color: #333;
  caret-color: #C62828;
}

/* Labels */
.field label {
  font-family: var(--ion-font-family);
  font-weight: 500;
  color: #555;
}

/* Type Toggle Buttons */
.type-toggle button {
  font-family: var(--ion-font-family);
}

/* Save Button */
ion-button {
  font-family: var(--ion-font-family);
}

/* Select / Textarea / Alert Buttons */
ion-select,
ion-textarea,
ion-alert .alert-button {
  font-family: var(--ion-font-family);
}
</style>



