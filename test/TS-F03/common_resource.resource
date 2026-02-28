*** Settings ***
Library         SeleniumLibrary
Library         RequestsLibrary
Library         Collections

*** Variables ***
# ================= Configuration =================
${BASE_API_URL}    http://localhost:8080    # แก้เป็น API URL จริง
${WEB_URL}         http://localhost:3000    # แก้เป็น Web URL จริง
${BROWSER}         chrome

# ================= Test Data =================
${PASSENGER_EMAIL}      passengerdel@gmail.com
${PASSENGER_USER}       passengerdel
${PASSENGER_PASS}       123456789
${DRIVER_EMAIL}         driverdel@gmail.com
${DRIVER_USER}          driverdel
${DRIVER_PASS}          123456789
${ADMIN_USER}           admin123
${ADMIN_PASS}           123456789

# ================= Locators (สมมติ) =================
${TXT_USERNAME}         id=username_input
${TXT_PASSWORD}         id=password_input
${BTN_LOGIN}            id=login_button
${BTN_LOGOUT}           id=logout_button

*** Keywords ***
# ================= System Keywords =================
Open System Browser
    Open Browser    ${WEB_URL}    ${BROWSER}
    Maximize Browser Window

Login To System
    [Arguments]    ${username}    ${password}
    Go To    ${WEB_URL}/login
    Wait Until Element Is Visible    ${TXT_USERNAME}
    Input Text       ${TXT_USERNAME}    ${username}
    Input Text       ${TXT_PASSWORD}    ${password}
    Click Button     ${BTN_LOGIN}
    Wait Until Page Contains Element    id=home_page_container    timeout=10s

Logout From System
    Click Button    ${BTN_LOGOUT}
    Wait Until Element Is Visible    ${TXT_USERNAME}

# ================= API Keywords =================
Create User Via API
    [Arguments]    ${email}    ${username}    ${password}    ${role_type}    ${national_id}
    ${payload}=    Create Dictionary
    ...    email=${email}    username=${username}    password=${password}
    ...    firstName=${role_type}    lastName=delete    phoneNumber=0999999999
    ...    gender=MALE    nationalIdNumber=${national_id}    nationalidExpiryDate=2030-12-31T00:00:00.000Z
    
    ${response}=    POST On Session    api_session    /api/users    json=${payload}
    Status Should Be    201    ${response}

Get API Auth Token
    [Arguments]    ${username}    ${password}
    ${body}=    Create Dictionary    username=${username}    password=${password}
    ${response}=    POST On Session    api_session    /api/login    json=${body}
    RETURN    ${response.json()}[token]

# ================= UI Action Keywords =================
Driver Fills Verification Form
    Click Element    id=driver_verification_menu
    Wait Until Element Is Visible    id=firstName
    Input Text    id=firstName    driver
    Input Text    id=lastName     delete
    Input Text    id=licenseNumber    12345678
    Input Text    id=licenseIssueDate    2026-12-31
    Input Text    id=licenseExpiryDate   2031-12-31
    Select From List By Value    id=typeOnLicense    PRIVATE_CAR
    Click Button  id=submit_verification

Driver Adds Vehicle
    Click Element    id=add_vehicle_menu
    Wait Until Element Is Visible    id=vehicleModel
    Input Text    id=vehicleModel    Honda City
    Input Text    id=licensePlate    1234ขอนแก่น
    Select From List By Value    id=vehicleType    Sedan
    Input Text    id=color    ขาว
    Input Text    id=seatCapacity    3
    Input Text    id=amenities    แอร์
    Click Button  id=submit_vehicle
    ${vehicle_id}=    Get Text    id=vehicle_id_label
    Set Suite Variable    ${VEHICLE_ID}    ${vehicle_id}

Admin Approves Driver
    [Arguments]    ${target_driver_user}
    Click Element    id=driver_approval_menu
    ${approve_btn}=    Set Variable    xpath=//td[text()='${target_driver_user}']/..//button[text()='Approve']
    Wait Until Element Is Visible    ${approve_btn}
    Click Button    ${approve_btn}

Passenger Books A Seat
    Click Element    id=search_route_menu
    Input Text    id=pickupLocation    Khon Kaen University
    Input Text    id=dropoffLocation   Central Khonkaen
    Click Button  id=search_button
    Wait Until Element Is Visible    xpath=//button[text()='จองที่นั่ง']
    Click Button  xpath=//button[text()='จองที่นั่ง']
    Input Text    id=numberOfSeats    1
    Click Button  id=confirm_booking

Passenger Deletes Account
    Click Element    id=profile_menu
    Click Element    id=my_account_tab
    Click Button     id=delete_account_button
    Wait Until Element Is Visible    id=policy_modal
    Select Checkbox  id=accept_policy_checkbox
    Input Text       id=confirm_email_input    ${PASSENGER_EMAIL}
    Click Button     id=confirm_delete_button
    Wait Until Page Contains    ลบบัญชีผู้ใช้สำเร็จ
    
# ================= Dual Window Setup =================
Open Passenger And Driver Browsers
    # 1. เปิดหน้าต่าง Passenger (อยู่ซ้าย)
    Open Browser    ${WEB_URL}    ${BROWSER}    alias=passenger_window
    Set Window Size    960    1080
    Set Window Position    0    0

    # 2. เปิดหน้าต่าง Driver (อยู่ขวา)
    Open Browser    ${WEB_URL}    ${BROWSER}    alias=driver_window
    Set Window Size    960    1080
    Set Window Position    960    0
