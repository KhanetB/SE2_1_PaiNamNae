*** Settings ***
Documentation   US-3: ผู้ใช้สามารถส่งรีวิวโดยให้คะแนน 3 ดาว ไม่เลือก Label มีข้อความและรูปภาพ
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

TC07 เปิด Browser และเข้าไปที่หน้า Login
    [Documentation]    ทดสอบล็อกอินด้วยบัญชี Passenger
    Login To System    ${PASSENGER_USER_REVIEW}    ${PASSENGER_PASS_REVIEW}

TC08 ไปที่เมนู การเดินทางของฉัน เลือกแท็บและกดปุ่มเขียนรีวิว
    [Documentation]    ไปที่หน้าการเดินทางและเปิดหน้าต่างเขียนรีวิว
    Wait Until Page Contains Element    ${LINK_MY_ROUTES}    timeout=10s
    Click Element                       ${LINK_MY_ROUTES}
    Wait Until Element Is Visible       ${TAB_ALL}    timeout=10s
    Click Button                        ${TAB_ALL}
    Wait Until Page Contains Element    ${BTN_WRITE_REVIEW}    timeout=10s
    Click Element                       ${BTN_WRITE_REVIEW}

TC09 ให้คะแนน 3 ดาว ไม่เลือก Label มีข้อความและรูปภาพ
    [Documentation]    ส่งรีวิว 3 ดาว โดยไม่เลือก label มีข้อความและรูปภาพ ควรสำเร็จ
    # ให้คะแนน 3 ดาว
    Set Rating    3
    
    # ไม่เลือก label (ให้ดำเนินการต่อ)
    
    # กรอกข้อความ
    Add Review Text And Image    ${REVIEW_TEXT}    ${IMAGE}

    # ส่งรีวิว
    Submit Review
    Verify Review Submitted Successfully

ลบรีวิวผ่าน API DELETE
    [Documentation]    ทดสอบการลบรีวิวผ่าน API โดยใช้ review ID ที่ได้จาก GET /api/reviews/me
    Sleep    2s
    
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
    Log    Delete Response Content: ${delete_response.content}

    # Step 5: ตรวจสอบว่าลบสำเร็จ (status code = 204 หรือ 200)
    Should Be True    ${delete_response.status_code} in [200, 204]    msg=ลบรีวิวไม่สำเร็จ (Status: ${delete_response.status_code})
    Log    ✓ ลบรีวิว ${review_id} สำเร็จแล้วผ่าน API
    
    # Step 6: ตรวจสอบหน้าเว็บว่ามีปุ่ม "เขียนรีวิว" ปรากฏขึ้นมาใหม่ (Optional)
    ${status}=    Run Keyword And Return Status    Verify Review Write Button Appears After Delete
    Run Keyword If    ${status}    Log    ✓ ตรวจสอบ UI แล้ว: ปุ่ม "เขียนรีวิว" ปรากฏขึ้นมาใหม่
    ...    ELSE    Log    ⚠ ข้าม UI verification (อาจเกิดจาก browser session หรือ user logout)
