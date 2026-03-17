*** Settings ***
Library         SeleniumLibrary
Resource        ../variables/test_data.robot
Resource        ../variables/common_locators.robot

*** Keywords ***

# ================= Driver Verification =================
Driver Fills Verification Form
    [Documentation]    Driver กรอกแบบฟอร์มยืนยันตัวตน
    Wait Until Element Is Visible        ${DROPDOWN_PROFILE}    timeout=10s
    Mouse Over                           ${DROPDOWN_PROFILE}
    Sleep                                ${DELAY}
    
    Wait Until Element Is Visible        ${PROFILE_DROPDOWN_BTN}    timeout=10s
    Click Element                        ${PROFILE_DROPDOWN_BTN}
    Wait Until Location Contains         /profile    timeout=10s
    Sleep                                ${DELAY}
    
    Wait Until Element Is Visible        ${LINK_DRIVER_VERIFICATION}    timeout=10s
    Click Element                        ${LINK_DRIVER_VERIFICATION}
    Sleep                                ${DELAY}
    
    Wait Until Page Contains Element     ${INPUT_ID_FILE_1}    timeout=10s
    Choose File                          ${INPUT_ID_FILE_1}    ${IDCARD_PATH}   
    Sleep                                0.5s
    Choose File                          ${INPUT_ID_FILE_2}    ${SELFIE_PATH}
    Sleep                                0.5s
    
    Input Text                           ${INPUT_FIRST_NAME_LICENSE}    driver
    Input Text                           ${INPUT_LAST_NAME_LICENSE}     forreview
    Input Text                           ${INPUT_LICENSE_NUMBER}    12345678
    Select From List By Value            ${SELECT_LICENSE_TYPE}    PRIVATE_CAR
    Input Text                           ${INPUT_LICENSE_ISSUE_DATE}    12/31/2026
    Input Text                           ${INPUT_LICENSE_EXPIRY_DATE}   12/31/2031
    Sleep                                ${DELAY}
    
    Click Button                         xpath=//button[@type='submit']
    Sleep                                3s

Driver Adds Vehicle
    [Documentation]    Driver เพิ่มข้อมูลรถยนต์
    Wait Until Element Is Visible    ${DROPDOWN_PROFILE}    timeout=10s
    Mouse Over                       ${DROPDOWN_PROFILE}
    Sleep                            ${DELAY}
    
    Wait Until Element Is Visible    ${PROFILE_DROPDOWN_BTN}    timeout=10s
    Click Element                    ${PROFILE_DROPDOWN_BTN}
    Wait Until Location Contains     /profile    timeout=10s
    Sleep                            ${DELAY}
    
    Wait Until Element Is Visible    ${LINK_MY_VEHICLE}    timeout=10s
    Click Element                    ${LINK_MY_VEHICLE}
    Sleep                            ${DELAY}
    
    Wait Until Element Is Visible    ${BTN_MANAGE_VEHICLE}    timeout=10s
    Click Button                     ${BTN_MANAGE_VEHICLE}
    
    Wait Until Element Is Visible    ${BTN_ADD_NEW_VEHICLE}    timeout=10s
    Click Button                     ${BTN_ADD_NEW_VEHICLE}
    
    Input Text                       ${INPUT_VEHICLE_NAME}    Honda City
    Input Text                       ${INPUT_VEHICLE_PLATE}    1234ขอนแก่น
    Select From List By Label        ${SELECT_VEHICLE_TYPE}    Sedan
    Input Text                       ${INPUT_VEHICLE_COLOR}    ขาว
    Input Text                       ${INPUT_VEHICLE_SEATS}    3
    Input Text                       ${INPUT_VEHICLE_AMENITIES}    แอร์
    Click Element                    ${CHECKBOX_DEFAULT_VEHICLE}
    
    Wait Until Element Is Visible    ${BTN_SAVE_VEHICLE}    timeout=10s
    Click Button                     ${BTN_SAVE_VEHICLE}
    
    Wait Until Element Is Visible    ${BTN_CONFIRM_VEHICLE}    timeout=10s
    Sleep                            ${DELAY}
    Click Button                     ${BTN_CONFIRM_VEHICLE}
