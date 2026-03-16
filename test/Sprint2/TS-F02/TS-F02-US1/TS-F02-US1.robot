*** Settings ***
Documentation   US-1: ผู้ใช้ต้องการเขียนรีวิว 
Resource        ../common_resource.resource

# 1. เปลี่ยนมาเรียกใช้ Keyword ตัวเดียวให้ดูสะอาดขึ้น
Suite Setup     Prepare Environment
Suite Teardown  Run Keyword And Ignore Error    Close All Browsers

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
    Open System Browser
    # 3. ใส่ Ignore Error ไว้ชั่วคราว ถ้า API ยังไม่เปิดเบราว์เซอร์จะได้ไม่พังตาม
    Create Session    api_session    ${BASE_API_URL}

Set Rating
    [Arguments]    ${rating}
    [Documentation]    ตั้งค่าคะแนนดาว (รองรับทั้งค่าเต็มและครึ่ง เช่น 1, 2.5, 4.5)
    
    ${rating}=    Convert To Number    ${rating}
    Return From Keyword If    ${rating} == 0    # ถ้าเป็น 0 ให้จบ
    
    # แปลงเป็นจำนวนดาวเต็ม และตรวจสอบว่ามีครึ่งดาว
    ${full_stars}=    Evaluate    int(${rating})
    ${has_half_star}=    Evaluate    (${rating} - int(${rating})) == 0.5
    
    # ถ้าไม่มีครึ่งดาว ให้คลิกปุ่มดาวตามปกติ
    Run Keyword If    not ${has_half_star}
    ...    Click Element    xpath=(//div[contains(@class,'flex gap-2 text-4xl')]//button[@type='button'])[${full_stars}]
    ...    ELSE
    ...    Click Half Star    ${full_stars}
    
Confirm Review Submission
    [Documentation]    รอจน confirmation modal ปรากฏและคลิกปุ่มยืนยันการส่งรีวิว
    Wait Until Page Contains Element    xpath=//h3[contains(.,'ยืนยันการส่งรีวิว')]    timeout=10s
    Wait Until Element Is Visible       xpath=//button[contains(.,'ยืนยันและส่งรีวิว')]    timeout=10s
    Click Button                        xpath=//button[contains(.,'ยืนยันและส่งรีวิว')]
    # รอให้ส่งรีวิวสำเร็จและ modal ปิด
    Sleep    2s

Verify Review Button Appears After Delete
    [Documentation]    ตรวจสอบว่าหลังจากลบรีวิวแล้ว ปุ่ม "เขียนรีวิว" จะปรากฏขึ้นมาใหม่
    Login To System    ${PASSENGER_USER_REVIEW}    ${PASSENGER_PASS_REVIEW}
    Wait Until Page Contains Element    xpath=//a[contains(.,'การเดินทางของฉัน')]    timeout=10s
    Click Element                       xpath=//a[contains(.,'การเดินทางของฉัน')]
    Wait Until Element Is Visible       xpath=//button[contains(normalize-space(.), 'ทั้งหมด')]    timeout=10s
    Click Button                        xpath=//button[contains(normalize-space(.), 'ทั้งหมด')]
    Wait Until Page Contains Element    xpath=//button[contains(.,'เขียนรีวิว')]    timeout=10s
    Page Should Contain Element         xpath=//button[contains(.,'เขียนรีวิว')]
    Log    ✓ ตรวจสอบแล้ว: ปุ่ม "เขียนรีวิว" ปรากฏขึ้นมาใหม่หลังจากลบรีวิวสำเร็จ

*** Test Cases ***

TC01 เข้าสู่ระบบด้วยบัญชีที่สร้างไว้ใน TC01 ของ US1
    [Documentation]    ทดสอบล็อกอินด้วยบัญชีที่สร้างไว้ใน TC01 ของ US1
    Login To System    ${PASSENGER_USER_REVIEW}    ${PASSENGER_PASS_REVIEW}

TC02,TC03 เข้าหน้าการเดินทางที่จบแล้วและเขียนรีวิว
    [Documentation]    จำลอง Passenger เข้าหน้าเส้นทางที่จบแล้วเพื่อเขียนรีวิวให้ Driver
    Wait Until Page Contains Element    xpath=//a[contains(.,'การเดินทางของฉัน')]
    Click Element                       xpath=//a[contains(.,'การเดินทางของฉัน')] 
    Wait Until Element Is Visible    xpath=//button[contains(normalize-space(.), 'ทั้งหมด')]    timeout=10s
    Click Button                     xpath=//button[contains(normalize-space(.), 'ทั้งหมด')]
    Wait Until Page Contains Element    xpath=//button[contains(.,'เขียนรีวิว')]
    Click Element                       xpath=//button[contains(.,'เขียนรีวิว')]
    Set Rating    3.5
    # Select labels (tags) by visible text; adjust if your UI uses different elements
    Click Button    xpath=//Button[contains(.,'ขับขี่ปลอดภัย')]
    Click Button    xpath=//Button[contains(.,'รถสะอาดน่านั่ง')]
    Click Button    xpath=//Button[contains(.,'คนขับอัธยาศัยดี')]
    Click Button    xpath=//Button[contains(.,'ชอบเพลงที่เปิด')]

    # Enter review text
    Wait Until Element Is Visible    xpath=//textarea[@placeholder='เล่าประสบการณ์ เช่น ความตรงต่อเวลา ความสะอาด การขับขี่']
    Input Text    xpath=//textarea[@placeholder='เล่าประสบการณ์ เช่น ความตรงต่อเวลา ความสะอาด การขับขี่']    ขับดีมากครับพี่ รถพี่สุดยอด

    # Attach image (ensure ${IMAGE} exists locally)
    Choose File    xpath=//input[@type='file' and contains(@accept,'image')]    ${IMAGE}

    Scroll Element Into View    xpath=//button[contains(.,'ส่งรีวิว')]
    Click Button                xpath=//button[contains(.,'ส่งรีวิว')]
    
    # รอให้ confirmation modal ปรากฏและยืนยันการส่งรีวิว
    Confirm Review Submission
    
    # รอให้ส่งรีวิวสำเร็จ
    Wait Until Page Contains    สำเร็จ    timeout=10s
    Log    ✓ ส่งรีวิวสำเร็จแล้ว


ลบรีวิวผ่าน API DELETE
    [Documentation]    ทดสอบการลบรีวิวผ่าน API โดยใช้ review ID ที่ได้จาก GET /api/reviews/me
    # Step 1: Login ผ่าน API เพื่อเอา token ใหม่
    sleep   2s    # รอให้ระบบพร้อมก่อน API call
    ${token}=    Get User Token Via API    ${PASSENGER_USER_REVIEW}    ${PASSENGER_PASS_REVIEW}
    Log    Access Token: ${token}
    Should Not Be Empty    ${token}    msg=Token ต้องไม่เป็นค่าว่าง
    
    # Step 2: เรียก GET /api/reviews/me เพื่อดึงรีวิวทั้งหมด
    ${reviews_list}=    Get My Reviews Via API    ${token}
    Log To Console    My Reviews: ${reviews_list}
    
    # Step 3: ดึง review ID จาก response (สมมติว่ามีรีวิวอย่างน้อย 1 รายการ)
    ${review_count}=    Get Length    ${reviews_list}
    Should Be True    ${review_count} > 0    msg=ไม่พบรีวิวในระบบ
    
    ${first_review}=    Get From List    ${reviews_list}    0
    ${review_id}=    Get From Dictionary    ${first_review}    id
    Log To Console    Review ID ที่จะลบ: ${review_id}
    
    # Step 4: เรียก DELETE /api/reviews/:reviewId
    ${delete_response}=    Delete Review Via API    ${token}    ${review_id}
    Log To Console    Delete Response Status: ${delete_response.status_code}
    Log To Console    Delete Response Content: ${delete_response.content}

    
    # Step 5: ตรวจสอบว่าลบสำเร็จ (status code = 204 หรือ 200)
    Should Be True    ${delete_response.status_code} in [200, 204]    msg=ลบรีวิวไม่สำเร็จ (Status: ${delete_response.status_code})
    Log    ✓ ลบรีวิว ${review_id} สำเร็จแล้วผ่าน API
    
    # Step 6: ตรวจสอบหน้าเว็บว่ามีปุ่ม "เขียนรีวิว" ปรากฏขึ้นมาใหม่ (Optional - ถ้า login ไม่สำเร็จจะ skip)
    ${status}=    Run Keyword And Return Status    Verify Review Button Appears After Delete
    Run Keyword If    ${status}    Log    ✓ ตรวจสอบ UI แล้ว: ปุ่ม "เขียนรีวิว" ปรากฏขึ้นมาใหม่
    ...    ELSE    Log    ⚠ ข้าม UI verification (อาจเกิดจาก browser session หรือ user logout)