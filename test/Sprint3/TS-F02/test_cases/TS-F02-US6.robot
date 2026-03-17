*** Settings ***
Documentation   US-6: ผู้ใช้พยายามแนบไฟล์ PDF จะได้รับข้อความแจ้งเตือน
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

TC18 แนบไฟล์ PDF และพยายามส่งรีวิว
    [Documentation]    ทดสอบการแนบไฟล์ PDF ซึ่งไม่รองรับ ควรแสดงข้อความแจ้งเตือน
    # ให้คะแนน 3 ดาว
    Set Rating    3
    
    # เลือก labels
    Click Button    xpath=//Button[contains(.,'ขับขี่ปลอดภัย')]
    Click Button    xpath=//Button[contains(.,'รถสะอาดน่านั่ง')]
    Click Button    xpath=//Button[contains(.,'คนขับอัธยาศัยดี')]
    Click Button    xpath=//Button[contains(.,'ชอบเพลงที่เปิด')]

    # แนบไฟล์ PDF (ที่ไม่รองรับ) ด้วย keyword
    Add Review Text And Image    ${REVIEW_TEXT}    ${PDF}

    # ตรวจสอบ alert ที่แสดง error สำหรับไฟล์ที่ไม่รองรับ
    Alert Should Be Present    ไฟล์ Lab08.pdf ไม่รองรับ (อนุญาตเฉพาะรูปภาพหรือวิดีโอเท่านั้น)    timeout=10s
    
    Log    ✓ ได้รับข้อความแจ้งเตือกเกี่ยวกับไฟล์ที่ไม่รองรับ (PDF ไม่อนุญาต - เฉพาะรูปภาพหรือวิดีโอเท่านั้น)
