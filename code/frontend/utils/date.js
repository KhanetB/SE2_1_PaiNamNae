import dayjs from 'dayjs'
import 'dayjs/locale/th'
import buddhistEra from 'dayjs/plugin/buddhistEra'

dayjs.locale('th')
dayjs.extend(buddhistEra)

/**
 * แสดงวันที่ในรูปแบบ "D MMMM BBBB HH:mm" (ปี พ.ศ.)
 * @param {string|Date} iso
 * @returns {string}
 */
export function formatDate(iso) {
  if (!iso) return '-'
  return dayjs(iso).format('D MMMM BBBB HH:mm')
}

/**
 * แสดงเวลาแบบย่อ เช่น "3 min ago", "2 hr ago", "1 d ago"
 * @param {string|Date|number} ts
 * @returns {string}
 */
export function timeAgo(ts) {
  const ms = Date.now() - new Date(ts).getTime()
  const m = Math.floor(ms / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m} min ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} hr ago`
  const d = Math.floor(h / 24)
  return `${d} d ago`
}

/**
 * ตรวจสอบว่าวันที่ทำรายการเสร็จสิ้นนั้นไม่เกิน 7 วัน
 * @param {string|Date} completedDate 
 * @returns {boolean}
 */
export function within7Days(completedDate) {
  if (!completedDate) return false
  const now = dayjs()
  const completed = dayjs(completedDate)
  return now.isAfter(completed) && now.diff(completed, 'day') < 7
}
