*** Settings ***
Documentation   US1-การ anonymous ฝั่งผู้ใช้ที่เป็น Passenger
Resource        ../common_resource.resource

# 1. เปลี่ยนมาเรียกใช้ Keyword ตัวเดียวให้ดูสะอาดขึ้น
Suite Setup     Prepare Environment
Suite Teardown  Close All Browsers

*** Keywords ***
Prepare Environment
    # 2. เปิดหน้าต่างเบราว์เซอร์ 2 จอก่อนเลย (UI สำคัญสุดในเคสนี้)
    Open System Browser
    
    # 3. ใส่ Ignore Error ไว้ชั่วคราว ถ้า API ยังไม่เปิดเบราว์เซอร์จะได้ไม่พังตาม
    Run Keyword And Ignore Error    Create Session    api_session    ${BASE_API_URL}

*** Test Cases ***


TC10, TC11 Passenger ทำการลบบัญชีผู้ใช้
    [Documentation]    รวบ TC11 (Login) และ TC12 (Delete) เข้าด้วยกันตาม Flow ใช้งานจริง
    Login To System    ${TEST_USER}    ${TEST_PASS}
    Deletes Account Passenger   ${TEST_EMAIL}    ${TEST_PASS}

*** Comments ***

TC01 สร้าง Account Passenger และ Driver ผ่าน Web UI และเข้าหน้า Home
    [Documentation]    สมัครสมาชิกผ่านหน้าเว็บทั้งสอง Role แล้วทดสอบล็อกอิน
    # ================= ฝั่ง Passenger (หน้าต่างซ้าย) =================
    sleep    5s
    Register User Via Web UI
    ...    username=${TEST_USER}    email=${TEST_EMAIL}    password=${TEST_PASS}
    ...    firstname=Test           lastname=User             phone=0812345678
    ...    gender=male                   national_id=9351407024077   expiry=31/12/2030
    # ทดสอบเข้าสู่ระบบฝั่ง Passenger
    Login To System    ${TEST_USER}    ${TEST_PASS}

TC01 สร้าง Account Passenger และ Driver ผ่าน Web UI และเข้าหน้า Home
    [Documentation]    สมัครสมาชิกผ่านหน้าเว็บทั้งสอง Role แล้วทดสอบล็อกอิน
    # ================= ฝั่ง Passenger (หน้าต่างซ้าย) =================
    Switch Browser    passenger_window
    Register User Via Web UI
    ...    username=${PASSENGER_USER}    email=${PASSENGER_EMAIL}    password=${PASSENGER_PASS}
    ...    firstname=passenger           lastname=delete             phone=0999999999
    ...    gender=male                   national_id=1349912345679   expiry=31/12/2030
    # ทดสอบเข้าสู่ระบบฝั่ง Passenger
    Login To System    ${PASSENGER_USER}    ${PASSENGER_PASS}

    # ================= ฝั่ง Driver (หน้าต่างขวา) =================
    Switch Browser    driver_window
    Register User Via Web UI
    ...    username=${DRIVER_USER}       email=${DRIVER_EMAIL}       password=${DRIVER_PASS}
    ...    firstname=driver              lastname=delete             phone=0999999999
    ...    gender=male                   national_id=1349912345678   expiry=31/12/2030
    
    # ทดสอบเข้าสู่ระบบฝั่ง Driver
    Login To System    ${DRIVER_USER}    ${DRIVER_PASS}

TC02 ผู้ใช้ที่เป็น Driver ยืนยัน Driver Verification
    [Documentation]    Driver เข้าสู่ระบบและกรอกข้อมูลใบขับขี่
    Login To System    ${DRIVER_USER}    ${DRIVER_PASS}
    Driver Fills Verification Form

TC03 ผู้ใช้ที่เป็น Driver สร้าง Vehicle
    [Documentation]    Driver เพิ่มข้อมูลรถยนต์
    Login To System    ${DRIVER_USER}    ${DRIVER_PASS}
    Driver Adds Vehicle
    Logout From System Driver

TC04 Admin Verify Driver
    [Documentation]    Admin ล็อกอินเข้ามาอนุมัติ Driver
    Login To System    ${ADMIN_USER}    ${ADMIN_PASS}
    Admin Approves Driver    ${DRIVER_USER}
    Logout From System Admin

TC05 Driver สร้างเส้นทาง (Routes) ผ่าน Web UI
    [Documentation]    จำลอง Driver สร้างเส้นทางการเดินทางใหม่ผ่านหน้าเว็บ
    Switch Browser    driver_window
    Login To System    ${DRIVER_USER}    ${DRIVER_PASS}
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
    Login To System   ${PASSENGER_USER}    ${PASSENGER_PASS}
    Passenger Books A Seat    # TC07: ค้นหาเส้นทางและกดจองที่นั่ง

    # ================= ฝั่ง Driver (ขวา) =================
    Switch Browser    driver_window
    Login To System   ${DRIVER_USER}    ${DRIVER_PASS}
    
    # TC07: Driver เห็นคำขอจอง กดยืนยันคำขอ และกดยืนยันเริ่มเดินทาง
    Driver Approves Booking Request   ${PASSENGER_EMAIL}

    # ================= ฝั่ง Passenger (ซ้าย) =================
    Switch Browser    passenger_window
    Passenger Confirms Arrival
    # TC08: Passenger เห็นว่ารถเริ่มเดินทางแล้ว และกดยืนยันเมื่อถึงจุดหมาย

        # ================= ฝั่ง Driver (ขวา) =================
    Switch Browser    driver_window
    # TC09: Driver เห็น Passenger กดยืนยัน จึงกดยืนยันถึงจุดหมายและจบงาน
    Driver Confirms Arrival

TC10, TC11 Passenger ทำการลบบัญชีผู้ใช้
    [Documentation]    รวบ TC11 (Login) และ TC12 (Delete) เข้าด้วยกันตาม Flow ใช้งานจริง
    Switch Browser    passenger_window
    Login To System    ${PASSENGER_USER}    ${PASSENGER_PASS}
    Deletes Account    ${PASSENGER_EMAIL}

TC12 Driver เห็นข้อมูล Passenger เป็น Anonymous
    Switch Browser    driver_window
    Login To System    ${DRIVER_USER}    ${DRIVER_PASS}
    Wait Until Element Is Visible    xpath=//a[contains(., 'การเดินทางทั้งหมด')]    timeout=10s
    Click Element                    xpath=//a[contains(., 'การเดินทางทั้งหมด')]
    Sleep                            ${DELAY}            
    Wait Until Element Is Visible    xpath=//a[contains(., 'คำขอจองเส้นทางของฉัน')]    timeout=10s
    Click Element                    xpath=//a[contains(., 'คำขอจองเส้นทางของฉัน')]
    Sleep                            ${DELAY}
    Wait Until Element Is Visible    xpath=//button[contains(@class, 'tab-button') and contains(normalize-space(.), 'ทั้งหมด')]    timeout=15s
    Click Button                     xpath=//button[contains(@class, 'tab-button') and contains(normalize-space(.), 'ทั้งหมด')]
    Wait Until Page Contains    Deleted User   timeout=10s