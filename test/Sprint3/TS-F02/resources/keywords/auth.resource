*** Settings ***
Library         SeleniumLibrary
Resource        ../variables/test_data.robot
Resource        ../variables/common_locators.robot

*** Keywords ***

# ================= Login =================
Login To System
    [Documentation]    ล็อกอินเข้าสู่ระบบ
    [Arguments]    ${username}    ${password}
    Go To                               ${WEB_URL}/login
    Wait Until Element Is Visible       ${TXT_USERNAME}    timeout=10s
    Input Text                          ${TXT_USERNAME}    ${username}
    Input Text                          ${TXT_PASSWORD}    ${password}
    Click Button                        ${BTN_LOGIN}
    Wait Until Page Contains Element    ${MAIN_CONTENT}    timeout=10s

Register User Via Web UI
    [Documentation]    สมัครสมาชิกผ่าน UI
    [Arguments]    ${username}    ${email}    ${password}    ${firstname}    ${lastname}    ${phone}    ${gender}    ${national_id}    ${expiry}
    Go To    ${WEB_URL}/register
    Sleep    ${DELAY}
    
    # Step 1 - Account Info
    Wait Until Element Is Visible     ${INPUT_USERNAME}    timeout=10s
    Input Text                        ${INPUT_USERNAME}    ${username}
    Input Text                        ${INPUT_EMAIL}       ${email}
    Input Text                        ${INPUT_PASSWORD}    ${password}
    Input Text                        ${INPUT_CONFIRM_PASSWORD}    ${password}
    Click Button                      ${BTN_NEXT_STEP_1}

    # Step 2 - Personal Info
    Wait Until Element Is Visible     ${INPUT_FIRST_NAME}    timeout=10s
    Input Text                        ${INPUT_FIRST_NAME}     ${firstname}
    Input Text                        ${INPUT_LAST_NAME}      ${lastname}
    Input Text                        ${INPUT_PHONE_NUMBER}   ${phone}
    Click Element                     xpath=//input[@name='gender' and @value='${gender}']
    Click Button                      ${BTN_NEXT_STEP_2}

    # Step 3 - Verification
    Wait Until Element Is Visible     ${INPUT_ID_NUMBER}    timeout=10s
    Choose File                       ${INPUT_ID_CARD_FILE}    ${IDCARD_PATH}
    Input Text                        ${INPUT_ID_NUMBER}      ${national_id}
    Input Text                        ${INPUT_EXPIRY_DATE}    ${expiry}
    Choose File                       ${INPUT_SELFIE_FILE}    ${SELFIE_PATH}
    Click Element                     ${CHECKBOX_REGISTER}
    Click Button                      ${BTN_SUBMIT_REGISTER}

    # Verify Register Success
    Wait Until Page Contains          สมัครสมาชิกเรียบร้อยแล้ว!    timeout=20s
    Sleep                             ${DELAY}

# ================= Logout =================
Logout From System
    [Documentation]    ออกจากระบบ (Passenger)
    Wait Until Element Is Visible        ${DROPDOWN_PROFILE}    timeout=10s
    Mouse Over                           ${DROPDOWN_PROFILE}
    Sleep                                ${DELAY}
    Wait Until Element Is Visible        xpath=//button[contains(., 'Logout')]    timeout=10s
    Click Button                         xpath=//button[contains(., 'Logout')]

Logout From System Driver
    [Documentation]    ออกจากระบบ (Driver)
    Wait Until Element Is Visible    ${DROPDOWN_PROFILE_DRIVER}    timeout=10s
    Mouse Over                       ${DROPDOWN_PROFILE_DRIVER}
    Sleep                            ${DELAY}
    Wait Until Element Is Visible    xpath=//button[contains(., 'Logout')]    timeout=10s
    Click Button                     xpath=//button[contains(., 'Logout')]

Logout From System Admin
    [Documentation]    ออกจากระบบ (Admin)
    Wait Until Element Is Visible    ${BTN_SETTING}    timeout=10s
    Click Button                     ${BTN_SETTING}
    Sleep                            1s    
    Wait Until Element Is Visible    ${MENU_ECOM}    timeout=10s
    Click Button                     ${MENU_ECOM}

# ================= Account Management =================
Delete Account Passenger
    [Documentation]    ลบบัญชี Passenger
    [Arguments]    ${email}    ${password}
    Wait Until Element Is Visible        ${DROPDOWN_PROFILE}    timeout=10s
    Mouse Over                           ${DROPDOWN_PROFILE}
    Sleep                                ${DELAY}
    Wait Until Element Is Visible        ${PROFILE_DROPDOWN_BTN}    timeout=10s
    Click Element                        ${PROFILE_DROPDOWN_BTN}
    Wait Until Location Contains         /profile    timeout=10s
    Sleep                                ${DELAY}
    Click Element                        ${BTN_DELETE_ACCOUNT}
    
    Wait Until Element Is Visible        ${CHECKBOX_ACCEPT_TERMS}    timeout=10s
    Select Checkbox                      ${CHECKBOX_ACCEPT_TERMS}
    Sleep                                1s
    
    Wait Until Element Is Enabled        ${BTN_CONFIRM_DELETE}    timeout=10s
    Click Button                         ${BTN_CONFIRM_DELETE}
    
    Wait Until Element Is Visible        ${INPUT_EMAIL_DELETE}    timeout=10s
    Input Text                           ${INPUT_EMAIL_DELETE}    ${email}
    
    Wait Until Element Is Enabled        xpath=//button[contains(., 'ยืนยันการลบบัญชี')]    timeout=10s
    Click Button                         xpath=//button[contains(., 'ยืนยันการลบบัญชี')]
    
    Wait Until Element Is Visible        ${INPUT_PASSWORD_DELETE}    timeout=10s
    Input Password                       ${INPUT_PASSWORD_DELETE}    ${password}
    
    Wait Until Element Is Enabled        ${BTN_CONFIRM_DELETE_ACCOUNT}    timeout=10s
    Click Element                        ${BTN_CONFIRM_DELETE_ACCOUNT}
    
    Wait Until Element Is Enabled        ${BTN_CONFIRM_DELETE_ACCOUNT}    timeout=10s
    Click Element                        ${BTN_CONFIRM_DELETE_ACCOUNT}
    
    Wait Until Page Contains             ลบบัญชีสำเร็จแล้ว    timeout=10s

Delete Account Driver
    [Documentation]    ลบบัญชี Driver
    [Arguments]    ${email}    ${password}
    Wait Until Element Is Visible        ${DROPDOWN_PROFILE_DRIVER}    timeout=10s
    Mouse Over                           ${DROPDOWN_PROFILE_DRIVER}
    Sleep                                ${DELAY}
    Wait Until Element Is Visible        ${PROFILE_DROPDOWN_BTN}    timeout=10s
    Click Element                        ${PROFILE_DROPDOWN_BTN}
    Wait Until Location Contains         /profile    timeout=10s
    Sleep                                ${DELAY}
    Click Element                        ${BTN_DELETE_ACCOUNT}
    
    Wait Until Element Is Visible        ${CHECKBOX_ACCEPT_TERMS}    timeout=10s
    Select Checkbox                      ${CHECKBOX_ACCEPT_TERMS}
    Sleep                                1s
    
    Wait Until Element Is Enabled        ${BTN_CONFIRM_DELETE}    timeout=10s
    Click Button                         ${BTN_CONFIRM_DELETE}
    
    Wait Until Element Is Visible        ${INPUT_EMAIL_DELETE}    timeout=10s
    Input Text                           ${INPUT_EMAIL_DELETE}    ${email}
    
    Wait Until Element Is Enabled        xpath=//button[contains(., 'ยืนยันการลบบัญชี')]    timeout=10s
    Click Button                         xpath=//button[contains(., 'ยืนยันการลบบัญชี')]
    
    Wait Until Element Is Visible        ${INPUT_PASSWORD_DELETE}    timeout=10s
    Input Password                       ${INPUT_PASSWORD_DELETE}    ${password}
    
    Wait Until Element Is Enabled        ${BTN_CONFIRM_DELETE_ACCOUNT}    timeout=10s
    Click Element                        ${BTN_CONFIRM_DELETE_ACCOUNT}
    
    Wait Until Element Is Enabled        ${BTN_CONFIRM_DELETE_ACCOUNT}    timeout=10s
    Click Element                        ${BTN_CONFIRM_DELETE_ACCOUNT}
    
    Wait Until Page Contains             ลบบัญชีสำเร็จแล้ว    timeout=10s
