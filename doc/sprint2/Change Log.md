# **บันทึกการเปลี่ยนแปลง (Change Log)**

**ชื่อโครงการ:** PaiNamNae  \#15, \#16,\#1  Sprint\#2

**อัปเดตล่าสุด**: 3 มีนาคม 2026

## **เวอร์ชัน 1.2.2 (3 มีนาคม 2026\) Focus \#1**

\#1 As an admin, I want a log that complies to the related law.

**สิ่งที่เพิ่มเข้ามา (Added)**  
	**\-**Test UAT  
**สิ่งที่เปลี่ยนแปลง (Changed)**  
	\-แก้ไขหมวดของ ActionType

**การแก้ไขบั๊ก (Fixed)**  
	  
**ฟีเจอร์ที่ถูกถอดออก (Remove)**

## \#15 As a passenger, I want to give a review for each ride that I took to support the community.

**สิ่งที่เพิ่มเข้ามา (Added)**

**สิ่งที่เปลี่ยนแปลง (Changed)**  
\- ปรับหน้าจอเล็กน้อย  
**การแก้ไขบั๊ก (Fixed)**  
	  
**ฟีเจอร์ที่ถูกถอดออก (Remove)**

## **เวอร์ชัน 1.2.1 (2 มีนาคม 2026\) Focus \#1**

\#1 As an admin, I want a log that complies to the related law.

**สิ่งที่เพิ่มเข้ามา (Added)**

- เพิ่มระบบ Log

**สิ่งที่เปลี่ยนแปลง (Changed)**

**การแก้ไขบั๊ก (Fixed)**  
แก้ไชบั๊กในส่วนที่เกี่ยวข้อง  
**ฟีเจอร์ที่ถูกถอดออก (Remove)**

## \#15 As a passenger, I want to give a review for each ride that I took to support the community.

**สิ่งที่เพิ่มเข้ามา (Added)**  
**สิ่งที่เปลี่ยนแปลง (Changed)**

- แก้ไข Interface การเสร็จสิ้นการรีวิว

**การแก้ไขบั๊ก (Fixed)**  
	  
**ฟีเจอร์ที่ถูกถอดออก (Remove)**

## **เวอร์ชัน 1.2.0 (1 มีนาคม 2026\) Focus \#1**

## \#15 As a passenger, I want to give a review for each ride that I took to support the community.

**สิ่งที่เพิ่มเข้ามา (Added)**

**สิ่งที่เปลี่ยนแปลง (Changed)**  
\-ปรับปรุง Middleware ให้สามารถส่งค่า null แบบไม่กระทบ Frontend  
\- เพิ่มระบบ Maksing เพื่อให้ Soft Delete	  
**ฟีเจอร์ที่ถูกถอดออก (Remove)**

\#1 As an admin, I want a log that complies to the related law.

**สิ่งที่เพิ่มเข้ามา (Added)**  
	\-ทำการ Implement Frontend ปุ่ม export โดยมี checkbox เลือกส่งข้อมูลเพิ่มเติมต่างๆ  
\- เชื่อม api ฝั่ง frontend (70%)  
\- เพิ่มข้อมูล user ลงใน log table และ masking ข้อมูลสำคัญตาม PDPA  
\- ทำ route export csv/json สำหรับ log  
**สิ่งที่เปลี่ยนแปลง (Changed)**

**การแก้ไขบั๊ก (Fixed)**  
	  
**ฟีเจอร์ที่ถูกถอดออก (Remove)**

## **เวอร์ชัน 1.1.2 (28 กุมภาพันธ์ 2026\) Focus \#1**

## \#15 As a passenger, I want to give a review for each ride that I took to support the community.

**สิ่งที่เพิ่มเข้ามา (Added)**

**สิ่งที่เปลี่ยนแปลง (Changed)**  
\-ทำระบบ Softdelete Annonymous ทุกส่วนที่เป็น sensitive data และลอง hard delete   
\- เพื่อให้ FE ไม่กระทบมาก เพิ่ม Task ของการเขียน Middleware เพื่อให้ข้อมูลที่เป็น Null ส่งออกไป FE แบบถูกต้อง  
**การแก้ไขบั๊ก (Fixed)**  
	  
**ฟีเจอร์ที่ถูกถอดออก (Remove)**

\#1 As an admin, I want a log that complies to the related law.

**สิ่งที่เพิ่มเข้ามา (Added)**  
	\-ทำการ Implement Frontend ปุ่มการเข้า Log และหน้าจอส่วนฟิลเตอร์คร่าวๆ  
**สิ่งที่เปลี่ยนแปลง (Changed)**  
	**\-**ปรับปรุงหลังบ้านให้รองรับ Soft delete ตามกฏหมาย PDPA ที่ Database จะต้อง Annonymous ด้วย  
**การแก้ไขบั๊ก (Fixed)**  
	  
**ฟีเจอร์ที่ถูกถอดออก (Remove)**

## **เวอร์ชัน 1.1.1 (27 กุมภาพันธ์ 2026\) Focus \#15, \#16**

## \#15 As a passenger, I want to give a review for each ride that I took to support the community.

**สิ่งที่เพิ่มเข้ามา (Added)**  
\- ออกแบบ Test Scenario (Docs) ในกรณีตรวจสอบว่าผู้ใช้ได้มีการ Annonymous จริง  
**สิ่งที่เปลี่ยนแปลง (Changed)**  
\- แก้ไขเมื่อเขียนรีวิวเสร็จแล้วสถานะปุ่มไม่เปลี่ยน  
\- แก้ไขเมื่อยืนยันถึงที่หมายของ passenger ไม่ refresh ทำให้ปุ่มค้าง  
\- แก้ไขเมื่อยืนยันคำขอ driver ที่ว่า passenger ถึงที่หมาย  ไม่ refresh ทำให้ปุ่มค้าง  
\- แก้ api docs ของ delete / review  
\- ปรับ schemas ให้เป็น on deleted set null ในบางจุด   
\- ปรับให้รองรับวิดีโอ ไฟล์รูปวิดีโอไม่เกิน 3 ไฟล์ ขนาดไม่เกิน 10 mb  
**การแก้ไขบั๊ก (Fixed)**  
	  
**ฟีเจอร์ที่ถูกถอดออก (Remove)**

\#16 As a user, I want my account and information to be removed from the system when I am no longer want to be apart of this community.

**สิ่งที่เพิ่มเข้ามา (Added)**  
\- เชื่อม api ส่วนของการ verify ตอนลบบัญชี  
\- แก้ api docs  
**สิ่งที่เปลี่ยนแปลง (Changed)**

**การแก้ไขบั๊ก (Fixed)**

\#1 As an admin, I want a log that complies to the related law.

**สิ่งที่เพิ่มเข้ามา (Added)**  
\-ออกแบบ database schema ให้รองรับ log   
\-ปรับปรุงระบบการค้นหาของการกระทำต่างๆของผู้ใช้  
\-DataBase สำหรับ Log  
**สิ่งที่เปลี่ยนแปลง (Changed)**

**การแก้ไขบั๊ก (Fixed)**  
	

**ฟีเจอร์ที่ถูกถอดออก (Remove)**

**เวอร์ชัน 1.1.0 (26 กุมภาพันธ์ 2026\) Focus \#15, \#16,\#1**

## \#15 As a passenger, I want to give a review for each ride that I took to support the community.

**สิ่งที่เพิ่มเข้ามา (Added)**

- การทำ Verify

**สิ่งที่เปลี่ยนแปลง (Changed)**

**การแก้ไขบั๊ก (Fixed)**  
	  
**ฟีเจอร์ที่ถูกถอดออก (Remove)**

\#16 As a user, I want my account and information to be removed from the system when I am no longer want to be apart of this community.

**สิ่งที่เพิ่มเข้ามา (Added)**  
\-การทำ Verify ก่อนลบ Account  
**สิ่งที่เปลี่ยนแปลง (Changed)**  
\- ปรับปรุงให้จบ Booking แล้วจึงจะสามารถรีวิวได้ (ของเดิมจะจบที่ Routes)  
\- ปรับปรุง Prisma Schemas เพื่อรองรับการลบแบบ on\_delete \= null เพื่อรองรับการลบโดยข้อมูลที่มาจากระบบไม่สูญหาย  
\- ปรับปรุง Routes ให้สามารถอัพโหลดวิดีโอได้  
เรียบร้อย แต่ว่าขอใช้เวลาเขียน Pull Req ดีๆ ก่อน เพราะว่าเผื่อได้แก้ Test ตัวเก่า พอดีมีแก้ Schemas / ชื่อ / body ด้วย จะได้แก้ง่ายขึ้นว่าเปลี่ยนส่วนไหนบ้าง   
**การแก้ไขบั๊ก (Fixed)**  
	  
**ฟีเจอร์ที่ถูกถอดออก (Remove)**  
\#1 As an admin, I want a log that complies to the related law.

**สิ่งที่เพิ่มเข้ามา (Added)**  
	**\-**ทำการสร้างหน้าจอ UI เวอร์ชั่นแรกของหน้าจอ Log  
**สิ่งที่เปลี่ยนแปลง (Changed)**

**การแก้ไขบั๊ก (Fixed)**  
	  
**ฟีเจอร์ที่ถูกถอดออก (Remove)**

## **เวอร์ชัน 1.0.0 (25 กุมภาพันธ์ 2026\) Focus \#15, \#16**

## \#15 As a passenger, I want to give a review for each ride that I took to support the community.

**สิ่งที่เพิ่มเข้ามา (Added)**

**สิ่งที่เปลี่ยนแปลง (Changed)**  
refactor code  
**การแก้ไขบั๊ก (Fixed)**  
	  
**ฟีเจอร์ที่ถูกถอดออก (Remove)**

\#16 As a user, I want my account and information to be removed from the system when I am no longer want to be apart of this community.

**สิ่งที่เพิ่มเข้ามา (Added)**

**สิ่งที่เปลี่ยนแปลง (Changed)**  
refactor code  
**การแก้ไขบั๊ก (Fixed)**  
	  
**ฟีเจอร์ที่ถูกถอดออก (Remove)**

