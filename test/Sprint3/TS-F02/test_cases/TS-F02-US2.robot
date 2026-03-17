*** Settings ***
Documentation   US-2: ผู้ใช้ไม่เลือกดาวจะไม่สามารถส่งรีวิวได้
Resource        ../resources/common.resource
Resource        ../resources/keywords/auth.resource
Resource        ../resources/keywords/booking.resource
Resource        ../resources/keywords/review.resource

Suite Setup     Prepare Environment
Suite Teardown  Close All Browsers Safely

*** Keywords ***
Prepare Environment
    Open System Browser

*** Test Cases ***

TC04 เปิด Browser และเข้าไปที่หน้า Login
    [Documentation]    ทดสอบล็อกอินด้วยบัญชี Passenger
    Login To System    ${PASSENGER_USER_REVIEW}    ${PASSENGER_PASS_REVIEW}

TC05 ไปที่เมนู การเดินทางของฉัน เลือกแท็บและกดปุ่มเขียนรีวิว
    [Documentation]    ไปที่หน้าการเดินทางและเปิดหน้าต่างเขียนรีวิว
    Wait Until Page Contains Element    ${LINK_MY_ROUTES}    timeout=10s
    Click Element                       ${LINK_MY_ROUTES}
    Wait Until Element Is Visible       ${TAB_ALL}    timeout=10s
    Click Button                        ${TAB_ALL}
    Wait Until Page Contains Element    ${BTN_WRITE_REVIEW}    timeout=10s
    Click Element                       ${BTN_WRITE_REVIEW}

TC06 ไม่เลือกดาว (0 ดาว) และกดปุ่มส่งรีวิว
    [Documentation]    ทดสอบการส่งรีวิวโดยไม่เลือกดาว ควรแสดงข้อความแจ้งเตือน
    # ไม่เรียก Set Rating เพื่อให้ยังไม่เลือกดาว
    
    # เลือก labels
    Click Button    xpath=//Button[contains(.,'ขับขี่ปลอดภัย')]
    Click Button    xpath=//Button[contains(.,'รถสะอาดน่านั่ง')]
    Click Button    xpath=//Button[contains(.,'คนขับอัธยาศัยดี')]
    Click Button    xpath=//Button[contains(.,'ชอบเพลงที่เปิด')]

    # กรอกข้อความ
    Add Review Text And Image    ${REVIEW_TEXT}    ${IMAGE}

    # กดปุ่มส่งรีวิว - ควรโชว์ error
    Scroll Element Into View    ${BTN_SUBMIT_REVIEW}
    Click Button                ${BTN_SUBMIT_REVIEW}
    
    # ตรวจสอบว่า modal ยืนยันปรากฏหรือแสดงข้อความแจ้งเตือก
    Wait Until Page Contains    กรุณาเลือกจำนวนดาวก่อนส่งรีวิว    timeout=10s
    Log    ✓ ข้อความแจ้งเตือนปรากฏ: ยังไม่ให้คะแนนกรุณาเลือกจำนวนดาวก่อนส่งรีวิว
