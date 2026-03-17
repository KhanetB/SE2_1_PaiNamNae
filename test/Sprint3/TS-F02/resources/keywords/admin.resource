*** Settings ***
Library         SeleniumLibrary
Resource        ../variables/test_data.robot
Resource        ../variables/common_locators.robot

*** Keywords ***

# ================= Admin Driver Approval =================
Admin Approves Driver
    [Documentation]    Admin อนุมัติการยืนยันตัวตนของ Driver
    [Arguments]    ${driver_email}
    Wait Until Element Is Visible    ${DROPDOWN_PROFILE_DRIVER}    timeout=10s
    Mouse Over                       ${DROPDOWN_PROFILE_DRIVER}
    Sleep                            ${DELAY}
    
    Wait Until Element Is Visible    ${LINK_ADMIN_USERS}    timeout=10s
    Click Element                    ${LINK_ADMIN_USERS}
    
    Wait Until Element Is Visible    ${BTN_ADMIN_MENU}    timeout=10s
    Click Button                     ${BTN_ADMIN_MENU}
    
    Wait Until Element Is Visible    ${LINK_ADMIN_DRIVER_VERIFICATIONS}    timeout=10s
    Click Element                    ${LINK_ADMIN_DRIVER_VERIFICATIONS}
    
    ${DETAIL_BTN}=    Set Variable    xpath=//tr[contains(., '${driver_email}')]//button[@title='ดูรายละเอียด']
    Wait Until Element Is Visible    ${DETAIL_BTN}    timeout=10s
    Click Button                     ${DETAIL_BTN}
    
    Wait Until Element Is Visible    ${BTN_APPROVE_DRIVER}    timeout=10s
    Click Button                     ${BTN_APPROVE_DRIVER}
    
    Wait Until Element Is Visible    ${BTN_ADMIN_MENU}    timeout=10s
    Click Button                     ${BTN_ADMIN_MENU}
