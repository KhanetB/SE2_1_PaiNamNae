*** Settings ***
Library         SeleniumLibrary
Library         RequestsLibrary
Library         Collections

Resource        variables/test_data.robot
Resource        variables/common_locators.robot

*** Keywords ***

# ================= Browser Setup =================
Open System Browser
    [Documentation]    เปิด Browser ตัวเดียว
    Open Browser    ${WEB_URL}    ${BROWSER}    options=add_argument("--incognito")
    Maximize Browser Window

Open Passenger And Driver Browsers
    [Documentation]    เปิด Browser 2 หน้าต่างสำหรับ Passenger (ซ้าย) และ Driver (ขวา)
    Open Browser    ${WEB_URL}    ${BROWSER}    alias=passenger_window    options=add_argument("--incognito")
    Set Window Size    960    1080
    Set Window Position    0    0

    Open Browser    ${WEB_URL}    ${BROWSER}    alias=driver_window    options=add_argument("--incognito")
    Set Window Size    960    1080
    Set Window Position    960    0

Close All Browsers Safely
    [Documentation]    ปิด Browser ทั้งหมดอย่างปลอดภัย
    Run Keyword And Ignore Error    Close All Browsers

Create API Session
    [Documentation]    สร้าง session สำหรับ API calls
    Create Session    api_session    ${BASE_API_URL}

Reload And Maximize
    [Documentation]    Reload page และ maximize window
    Reload Page
    Maximize Browser Window
