*** Settings ***
Documentation   US-7: ผู้ใช้ไม่เลือกดาว ไม่เลือก Label ไม่กรอกข้อความ จะไม่สามารถส่งรีวิวได้
Resource        ../resources/common.resource
Resource        ../resources/keywords/auth.resource
Resource        ../resources/keywords/booking.resource
Resource        ../resources/keywords/review.resource
Resource        ../resources/keywords/driver.resource
Resource        ../resources/keywords/admin.resource
Resource        ../resources/keywords/api.resource

Suite Setup     Prepare Environment
Suite Teardown  Close All Browsers Safely

*** Keywords ***
Prepare Environment
    Open System Browser
    Create API Session

*** Test Cases ***

TC16 เปิด Browser และเข้าไปที่หน้า Login
    [Documentation]    ทดสอบล็อกอินด้วยบัญชี Passenger
    Login To System    ${PASSENGER_USER_REVIEW}    ${PASSENGER_PASS_REVIEW}

TC17 ไปที่เมนู การเดินทางของฉัน เลือกแท็บและกดปุ่มเขียนรีวิว
    [Documentation]    ไปที่หน้าการเดินทางและเปิดหน้าต่างเขียนรีวิว
    Wait Until Page Contains Element    ${LINK_MY_ROUTES}    timeout=10s
    Click Element                       ${LINK_MY_ROUTES}
    Wait Until Element Is Visible       ${TAB_ALL}    timeout=10s
    Click Button                        ${TAB_ALL}
    Wait Until Page Contains Element    ${BTN_WRITE_REVIEW}    timeout=10s
    Click Element                       ${BTN_WRITE_REVIEW}

TC18 ไม่เลือกดาว ไม่เลือก Label ไม่กรอกข้อความ และพยายามส่งรีวิว
    [Documentation]    ส่งรีวิวโดยไม่ให้คะแนน ไม่มี label ไม่มีข้อความ ควรแสดงข้อความแจ้งเตือก
    # ไม่เรียก Set Rating เพื่อให้ยังไม่เลือกดาว
    
    # ไม่เลือก label (ให้ดำเนินการต่อ)
    
    # ไม่กรอกข้อความ เพียงกดส่ง
    
    # กดปุ่มส่งรีวิว - ควรโชว์ error เพราะไม่ได้ให้คะแนน
    Scroll Element Into View    ${BTN_SUBMIT_REVIEW}
    Click Button                ${BTN_SUBMIT_REVIEW}
    
    # ตรวจสอบว่า modal ยืนยันปรากฏหรือแสดงข้อความแจ้งเตือก
    Wait Until Page Contains    กรุณาเลือกจำนวนดาวก่อนส่งรีวิว    timeout=10s
    Log    ✓ ข้อความแจ้งเตือนปรากฏ: ยังไม่ให้คะแนนกรุณาเลือกจำนวนดาวก่อนส่งรีวิว
