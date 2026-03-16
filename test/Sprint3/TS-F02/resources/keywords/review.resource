*** Settings ***
Library         SeleniumLibrary
Resource        ../variables/test_data.robot
Resource        ../variables/common_locators.robot

*** Keywords ***

# ================= Review Writing =================
Write Review With Rating And Tags
    [Documentation]    เขียนรีวิวพร้อมกับให้คะแนนและเลือก tags
    [Arguments]    ${rating}    @{tags}
    Wait Until Page Contains Element    ${BTN_WRITE_REVIEW}    timeout=10s
    Click Element                       ${BTN_WRITE_REVIEW}
    
    Set Rating    ${rating}
    
    FOR    ${tag}    IN    @{tags}
        Click Button    xpath=//Button[contains(.,'${tag}')]
    END

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
    ...    Click Element    xpath=//div[contains(@class,'flex gap-2 text-4xl')]//button[@type='button'][${full_stars}]
    ...    ELSE
    ...    Click Half Star    ${full_stars}

Click Half Star
    [Documentation]    คลิกครึ่งดาว
    [Arguments]    ${star_index}
    ${next_star}=    Evaluate    ${star_index} + 1
    # ใช้ xpath ที่ correct เพื่อคลิกดาวต่อไป
    Click Element    xpath=//div[contains(@class,'flex gap-2 text-4xl')]//button[@type='button'][${next_star}]

Add Review Text And Image
    [Documentation]    เพิ่มข้อความและรูปภาพรีวิว
    [Arguments]    ${review_text}    ${image_path}=${EMPTY}
    Wait Until Element Is Visible    ${TEXTAREA_REVIEW}    timeout=10s
    Input Text                       ${TEXTAREA_REVIEW}    ${review_text}
    
    Run Keyword If    '${image_path}' != ''
    ...    Choose File    ${INPUT_REVIEW_IMAGE}    ${image_path}

Submit Review
    [Documentation]    ส่งรีวิวและยืนยัน
    Scroll Element Into View    ${BTN_SUBMIT_REVIEW}
    Click Button                ${BTN_SUBMIT_REVIEW}
    Confirm Review Submission

Confirm Review Submission
    [Documentation]    รอ confirmation modal ปรากฏและคลิกปุ่มยืนยัน
    Wait Until Page Contains Element    ${MODAL_CONFIRM_REVIEW}    timeout=10s
    Wait Until Element Is Visible       ${BTN_CONFIRM_REVIEW_SUBMIT}    timeout=10s
    Click Button                        ${BTN_CONFIRM_REVIEW_SUBMIT}
    Sleep    2s

Verify Review Submitted Successfully
    [Documentation]    ตรวจสอบว่าส่งรีวิวสำเร็จ
    Wait Until Page Contains    สำเร็จ    timeout=10s
    Log    ✓ ส่งรีวิวสำเร็จแล้ว

Verify Review Write Button Appears After Delete
    [Documentation]    ตรวจสอบว่าหลังจากลบรีวิวแล้ว ปุ่ม "เขียนรีวิว" จะปรากฏขึ้นมาใหม่
    Wait Until Page Contains Element    ${BTN_WRITE_REVIEW}    timeout=10s
    Page Should Contain Element         ${BTN_WRITE_REVIEW}
    Log    ✓ ตรวจสอบแล้ว: ปุ่ม "เขียนรีวิว" ปรากฏขึ้นมาใหม่หลังจากลบรีวิวสำเร็จ
