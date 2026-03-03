*** Settings ***
Documentation   US1-การ anonymous ฝั่งผู้ใช้ที่เป็น Passenger
Resource        ../common_resource.resource

# 1. เปลี่ยนมาเรียกใช้ Keyword ตัวเดียวให้ดูสะอาดขึ้น
Suite Setup     Prepare Environment
Suite Teardown  Close All Browsers

*** Variables ***

${PASSENGER_EMAIL_REVIEW}      passengerreview@gmail.com
${PASSENGER_USER_REVIEW}       passengerreview
${PASSENGER_PASS_REVIEW}       123456789
${DRIVER_EMAIL_REVIEW}         driverreview@gmail.com
${DRIVER_USER_REVIEW}          driverreview
${DRIVER_PASS_REVIEW}          123456789

*** Keywords ***
Prepare Environment
    # 2. เปิดหน้าต่างเบราว์เซอร์ 2 จอก่อนเลย (UI สำคัญสุดในเคสนี้)
    Open Passenger And Driver Browsers
    
    # 3. ใส่ Ignore Error ไว้ชั่วคราว ถ้า API ยังไม่เปิดเบราว์เซอร์จะได้ไม่พังตาม
    Run Keyword And Ignore Error    Create Session    api_session    ${BASE_API_URL}

*** Test Cases ***

TC01 สร้าง Account Passenger และ Driver ผ่าน Web UI และเข้าหน้า Home
    [Documentation]    สมัครสมาชิกผ่านหน้าเว็บทั้งสอง Role แล้วทดสอบล็อกอิน
    # ================= ฝั่ง Passenger (หน้าต่างซ้าย) =================
    Switch Browser    passenger_window
    Register User Via Web UI
    ...    username=${PASSENGER_USER_REVIEW}    email=${PASSENGER_EMAIL_REVIEW}    password=${PASSENGER_PASS_REVIEW}
    ...    firstname=passenger           lastname=review             phone=0999999999
    ...    gender=male                   national_id=1349912345679   expiry=31/12/2030
    # ทดสอบเข้าสู่ระบบฝั่ง Passenger
    Login To System    ${PASSENGER_USER_REVIEW}    ${PASSENGER_PASS_REVIEW}

    # ================= ฝั่ง Driver (หน้าต่างขวา) =================
    Switch Browser    driver_window
    Register User Via Web UI
    ...    username=${DRIVER_USER_REVIEW}       email=${DRIVER_EMAIL_REVIEW}       password=${DRIVER_PASS_REVIEW}
    ...    firstname=driver              lastname=forreview            phone=0999999999
    ...    gender=male                   national_id=1349912345678   expiry=31/12/2030
    # ทดสอบเข้าสู่ระบบฝั่ง Driver
    Login To System    ${DRIVER_USER_REVIEW}    ${DRIVER_PASS_REVIEW}

TC02 ผู้ใช้ที่เป็น Driver ยืนยัน Driver Verification
    [Documentation]    Driver เข้าสู่ระบบและกรอกข้อมูลใบขับขี่
    set selenium speed    0.5s
    Login To System    ${DRIVER_USER_REVIEW}    ${DRIVER_PASS_REVIEW}
    Driver Fills Verification Form

TC03 ผู้ใช้ที่เป็น Driver สร้าง Vehicle
    [Documentation]    Driver เพิ่มข้อมูลรถยนต์
    Login To System    ${DRIVER_USER_REVIEW}    ${DRIVER_PASS_REVIEW}
    Driver Adds Vehicle
    Logout From System Driver

TC04 Admin Verify Driver
    [Documentation]    Admin ล็อกอินเข้ามาอนุมัติ Driver
    Login To System    ${ADMIN_USER}    ${ADMIN_PASS}
    Admin Approves Driver    ${DRIVER_USER_REVIEW}
    Logout From System Admin

TC05 Driver สร้างเส้นทาง (Routes) ผ่าน Web UI
    [Documentation]    จำลอง Driver สร้างเส้นทางการเดินทางใหม่ผ่านหน้าเว็บ
    Switch Browser    driver_window
    Login To System    ${DRIVER_USER_REVIEW}    ${DRIVER_PASS_REVIEW}
    Driver Creates Route Via Web UI
    ...    start_loc=Khon Kaen University
    ...    end_loc=Central Plaza Khon Kaen
    ...    depart_date=10/15/2030
    ...    depart_time=09:00AM
    ...    seats=3
    ...    price=50
    ...    conditions=ห้ามสูบบุหรี่ในรถ

TC06 - TC09 Flow การจองและเดินทางแบบ Real-time (ซ้าย Passenger / ขวา Driver)
    [Documentation]    ทดสอบ 2 หน้าต่างพร้อมกัน ตั้งแต่จองที่นั่งจนจบการเดินทาง
    # ================= ฝั่ง Passenger (ซ้าย) =================
    Switch Browser    passenger_window
    Login To System   ${PASSENGER_USER_REVIEW}    ${PASSENGER_PASS_REVIEW}
    Passenger Books A Seat    # TC07: ค้นหาเส้นทางและกดจองที่นั่ง

    # ================= ฝั่ง Driver (ขวา) =================
    Switch Browser    driver_window
    Login To System   ${DRIVER_USER_REVIEW}    ${DRIVER_PASS_REVIEW}

    # TC07: Driver เห็นคำขอจอง กดยืนยันคำขอ และกดยืนยันเริ่มเดินทาง
    Driver Approves Booking Request   ${PASSENGER_EMAIL_REVIEW}

    # ================= ฝั่ง Passenger (ซ้าย) =================
    Switch Browser    passenger_window
    Passenger Confirms Arrival
    # TC08: Passenger เห็นว่ารถเริ่มเดินทางแล้ว และกดยืนยันเมื่อถึงจุดหมาย

        # ================= ฝั่ง Driver (ขวา) =================
    Switch Browser    driver_window
    # TC09: Driver เห็น Passenger กดยืนยัน จึงกดยืนยันถึงจุดหมายและจบงาน
    Driver Confirms Arrival