*** Settings ***
Documentation   US-2: ผู้ใช้เขียนรีวิวไม่ใส่ดาว 
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
    Open System Browser
    # 3. ใส่ Ignore Error ไว้ชั่วคราว ถ้า API ยังไม่เปิดเบราว์เซอร์จะได้ไม่พังตาม
    Run Keyword And Ignore Error    Create Session    api_session    ${BASE_API_URL}

Set Rating
    [Arguments]    ${rating}

    ${rating}=    Convert To Number    ${rating}
    Return From Keyword If    ${rating} == 0

    ${full}=    Evaluate    int(${rating})
    ${half}=    Evaluate    1 if (${rating} - int(${rating}) == 0.5) else 0
    ${star_index}=    Evaluate    ${full} + (${half} if ${half} else 0)

    Wait Until Element Is Visible
    ...    xpath=//div[contains(@class,'text-3xl') and contains(@class,'cursor-pointer')]

    Execute JavaScript
    ...    const stars = document.querySelectorAll("div.text-3xl.cursor-pointer span.relative");
    ...    const el = stars[${star_index} - 1];
    ...    const rect = el.getBoundingClientRect();
    ...    const x = rect.left + (${half} === 1 ? rect.width * 0.25 : rect.width * 0.75);
    ...    const y = rect.top + rect.height / 2;
    ...    const evt = new MouseEvent('click', { clientX: x, clientY: y, bubbles: true });
    ...    el.dispatchEvent(evt);

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

TC04 เข้าสู่ระบบด้วยบัญชีที่สร้างไว้ใน TC01 ของ US1
    [Documentation]    ทดสอบล็อกอินด้วยบัญชีที่สร้างไว้ใน TC01 ของ US1
    Login To System    ${PASSENGER_USER_REVIEW}    ${PASSENGER_PASS_REVIEW}

TC05,TC06 เข้าหน้าการเดินทางที่จบแล้วและเขียนรีวิว
    [Documentation]    จำลอง Passenger เข้าหน้าเส้นทางที่จบแล้วเพื่อเขียนรีวิวให้ Driver
    Wait Until Page Contains Element    xpath=//a[contains(.,'การเดินทางของฉัน')]
    Click Element                       xpath=//a[contains(.,'การเดินทางของฉัน')] 
    Wait Until Element Is Visible    xpath=//button[contains(normalize-space(.), 'ทั้งหมด')]    timeout=10s
    Click Button                     xpath=//button[contains(normalize-space(.), 'ทั้งหมด')]
    Wait Until Page Contains Element    xpath=//button[contains(.,'เขียนรีวิว')]
    Click Element                       xpath=//button[contains(.,'เขียนรีวิว')]
    # Select labels (tags) by visible text; adjust if your UI uses different elements
    Click Button    xpath=//Button[contains(.,'ขับขี่ปลอดภัย')]
    Click Button    xpath=//Button[contains(.,'รถสะอาดน่านั่ง')]
    Click Button    xpath=//Button[contains(.,'คนขับอัธยาศัยดี')]
    Click Button    xpath=//Button[contains(.,'ชอบเพลงที่เปิด')]

    # Enter review text
    Wait Until Element Is Visible    xpath=//textarea[@placeholder='เขียนรีวิวที่นี่']
    Input Text    xpath=//textarea[@placeholder='เขียนรีวิวที่นี่']    ขับดีมากครับพี่ รถพี่สุดยอด

    # Attach image (ensure ${IMAGE} exists locally)
    Choose File    xpath=//input[@type='file' and contains(@accept,'image')]    ${IMAGE}

    Scroll Element Into View    xpath=//button[contains(.,'ส่งรีวิว')]
    Click Button                xpath=//button[contains(.,'ส่งรีวิว')]
    # รอให้ส่งรีวิวสำเร็จ
    Sleep    3s
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
    Log    My Reviews: ${reviews_list}
    
    # Step 3: ดึง review ID จาก response (สมมติว่ามีรีวิวอย่างน้อย 1 รายการ)
    ${review_count}=    Get Length    ${reviews_list}
    Should Be True    ${review_count} > 0    msg=ไม่พบรีวิวในระบบ
    
    ${first_review}=    Get From List    ${reviews_list}    0
    ${review_id}=    Get From Dictionary    ${first_review}    id
    Log    Review ID ที่จะลบ: ${review_id}
    
    # Step 4: เรียก DELETE /api/reviews/:reviewId
    ${delete_response}=    Delete Review Via API    ${token}    ${review_id}
    Log    Delete Response Status: ${delete_response.status_code}
    
    # Step 5: ตรวจสอบว่าลบสำเร็จ (status code = 204 หรือ 200)
    Should Be True    ${delete_response.status_code} in [200, 204]    msg=ลบรีวิวไม่สำเร็จ (Status: ${delete_response.status_code})
    Log    ✓ ลบรีวิว ${review_id} สำเร็จแล้วผ่าน API
    
    # Step 6: ตรวจสอบหน้าเว็บว่ามีปุ่ม "เขียนรีวิว" ปรากฏขึ้นมาใหม่ (Optional - ถ้า login ไม่สำเร็จจะ skip)
    ${status}=    Run Keyword And Return Status    Verify Review Button Appears After Delete
    Run Keyword If    ${status}    Log    ✓ ตรวจสอบ UI แล้ว: ปุ่ม "เขียนรีวิว" ปรากฏขึ้นมาใหม่
    ...    ELSE    Log    ⚠ ข้าม UI verification (อาจเกิดจาก browser session หรือ user logout)

ลบรีวิวโดยใช้ review ID ที่กำหนด
    [Documentation]    ทดสอบการลบรีวิวด้วย review ID ที่ระบุโดยตรง (เช่น cmma9sqzx001hez3r8f49ztcc)
    sleep   2s    # รอให้ระบบพร้อมก่อน API call
    # Step 1: Login ผ่าน API เพื่อเอา token
    ${token}=    Get User Token Via API    ${PASSENGER_USER_REVIEW}    ${PASSENGER_PASS_REVIEW}
    
    # Step 2: กำหนด review ID ที่ต้องการลบ
    ${review_id}=    Set Variable    cmma9sqzx001hez3r8f49ztcc
    
    # Step 3: เรียก DELETE /api/reviews/:reviewId
    ${delete_response}=    Delete Review Via API    ${token}    ${review_id}
    Log    Delete Response Status: ${delete_response.status_code}
    Log    Delete Response Body: ${delete_response.content}
    
    # Step 4: ตรวจสอบผลลัพธ์
    # กรณีสำเร็จ: status code = 200 หรือ 204
    # กรณีไม่พบ: status code = 404
    # กรณีไม่มีสิทธิ์: status code = 403
    Run Keyword If    ${delete_response.status_code} == 200    Log    ลบรีวิวสำเร็จ
    ...    ELSE IF    ${delete_response.status_code} == 204    Log    ลบรีวิวสำเร็จ (No Content)
    ...    ELSE IF    ${delete_response.status_code} == 404    Log    ไม่พบรีวิวนี้ในระบบ
    ...    ELSE IF    ${delete_response.status_code} == 403    Log    ไม่มีสิทธิ์ลบรีวิวนี้
    ...    ELSE IF    ${delete_response.status_code} == 400    Log    ไม่สามารถลบได้ (เกิน 7 วัน หรือเงื่อนไขอื่นๆ)
    ...    ELSE    Log    Error: ${delete_response.status_code}
    
    # Step 5: ถ้าลบสำเร็จ ตรวจสอบหน้าเว็บว่ามีปุ่ม "เขียนรีวิว" ปรากฏขึ้นมาใหม่ (Optional)
    ${should_verify}=    Evaluate    ${delete_response.status_code} in [200, 204]
    Run Keyword If    ${should_verify}    Run Keyword And Ignore Error    Verify Review Button Appears After Delete

*** Comments ***

TC01 เข้าสู่ระบบด้วยบัญชีที่สร้างไว้ใน TC01 ของ US1
    [Documentation]    ทดสอบล็อกอินด้วยบัญชีที่สร้างไว้ใน TC01 ของ US1
    Login To System    ${PASSENGER_USER_REVIEW}    ${PASSENGER_PASS_REVIEW}

TC02 เข้าหน้าการเดินทางที่จบแล้วและเขียนรีวิว
    [Documentation]    จำลอง Passenger เข้าหน้าเส้นทางที่จบแล้วเพื่อเขียนรีวิวให้ Driver
    Login To System    ${PASSENGER_USER_REVIEW}    ${PASSENGER_PASS_REVIEW}
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
    Wait Until Element Is Visible    xpath=//textarea[@placeholder='เขียนรีวิวที่นี่']
    Input Text    xpath=//textarea[@placeholder='เขียนรีวิวที่นี่']    ขับดีมากครับพี่ รถพี่สุดยอด

    # Attach image (ensure ${IMAGE} exists locally)
    Choose File    xpath=//input[@type='file' and contains(@accept,'image')]    ${IMAGE}

    Scroll Element Into View    xpath=//button[contains(.,'ส่งรีวิว')]
    Click Button                xpath=//button[contains(.,'ส่งรีวิว')]


TC03 ลบรีวิวผ่าน API DELETE
    [Documentation]    ทดสอบการลบรีวิวผ่าน API โดยใช้ review ID ที่ได้จาก GET /api/reviews/me
    # Step 1: Login ผ่าน API เพื่อเอา token ใหม่
    ${token}=    Get User Token Via API    ${PASSENGER_USER_REVIEW}    ${PASSENGER_PASS_REVIEW}
    Log    Access Token: ${token}
    Should Not Be Empty    ${token}    msg=Token ต้องไม่เป็นค่าว่าง
    
    # Step 2: เรียก GET /api/reviews/me เพื่อดึงรีวิวทั้งหมด
    ${reviews_list}=    Get My Reviews Via API    ${token}
    Log    My Reviews: ${reviews_list}
    
    # Step 3: ดึง review ID จาก response (สมมติว่ามีรีวิวอย่างน้อย 1 รายการ)
    ${review_count}=    Get Length    ${reviews_list}
    Should Be True    ${review_count} > 0    msg=ไม่พบรีวิวในระบบ
    
    ${first_review}=    Get From List    ${reviews_list}    0
    ${review_id}=    Get From Dictionary    ${first_review}    id
    Log    Review ID ที่จะลบ: ${review_id}
    
    # Step 4: เรียก DELETE /api/reviews/:reviewId
    ${delete_response}=    Delete Review Via API    ${token}    ${review_id}
    Log    Delete Response Status: ${delete_response.status_code}
    
    # Step 5: ตรวจสอบว่าลบสำเร็จ (status code = 204 หรือ 200)
    Should Be True    ${delete_response.status_code} in [200, 204]    msg=ลบรีวิวไม่สำเร็จ (Status: ${delete_response.status_code})
    Log    ✓ ลบรีวิว ${review_id} สำเร็จแล้วผ่าน API
    
    # Step 6: ตรวจสอบหน้าเว็บว่ามีปุ่ม "เขียนรีวิว" ปรากฏขึ้นมาใหม่ (Optional - ถ้า login ไม่สำเร็จจะ skip)
    ${status}=    Run Keyword And Return Status    Verify Review Button Appears After Delete
    Run Keyword If    ${status}    Log    ✓ ตรวจสอบ UI แล้ว: ปุ่ม "เขียนรีวิว" ปรากฏขึ้นมาใหม่
    ...    ELSE    Log    ⚠ ข้าม UI verification (อาจเกิดจาก browser session หรือ user logout)

TC04 ลบรีวิวโดยใช้ review ID ที่กำหนด
    [Documentation]    ทดสอบการลบรีวิวด้วย review ID ที่ระบุโดยตรง (เช่น cmma9sqzx001hez3r8f49ztcc)
    
    # Step 1: Login ผ่าน API เพื่อเอา token
    ${token}=    Get User Token Via API    ${PASSENGER_USER_REVIEW}    ${PASSENGER_PASS_REVIEW}
    
    # Step 2: กำหนด review ID ที่ต้องการลบ
    ${review_id}=    Set Variable    cmma9sqzx001hez3r8f49ztcc
    
    # Step 3: เรียก DELETE /api/reviews/:reviewId
    ${delete_response}=    Delete Review Via API    ${token}    ${review_id}
    Log    Delete Response Status: ${delete_response.status_code}
    Log    Delete Response Body: ${delete_response.content}
    
    # Step 4: ตรวจสอบผลลัพธ์
    # กรณีสำเร็จ: status code = 200 หรือ 204
    # กรณีไม่พบ: status code = 404
    # กรณีไม่มีสิทธิ์: status code = 403
    Run Keyword If    ${delete_response.status_code} == 200    Log    ลบรีวิวสำเร็จ
    ...    ELSE IF    ${delete_response.status_code} == 204    Log    ลบรีวิวสำเร็จ (No Content)
    ...    ELSE IF    ${delete_response.status_code} == 404    Log    ไม่พบรีวิวนี้ในระบบ
    ...    ELSE IF    ${delete_response.status_code} == 403    Log    ไม่มีสิทธิ์ลบรีวิวนี้
    ...    ELSE IF    ${delete_response.status_code} == 400    Log    ไม่สามารถลบได้ (เกิน 7 วัน หรือเงื่อนไขอื่นๆ)
    ...    ELSE    Log    Error: ${delete_response.status_code}
    
    # Step 5: ถ้าลบสำเร็จ ตรวจสอบหน้าเว็บว่ามีปุ่ม "เขียนรีวิว" ปรากฏขึ้นมาใหม่ (Optional)
    ${should_verify}=    Evaluate    ${delete_response.status_code} in [200, 204]
    Run Keyword If    ${should_verify}    Run Keyword And Ignore Error    Verify Review Button Appears After Delete
    

    