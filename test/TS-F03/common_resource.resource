*** Settings ***
Library         SeleniumLibrary
Library         RequestsLibrary
Library         Collections

*** Variables ***
# ================= Configuration =================
${BASE_API_URL}    http://localhost:3000    # แก้เป็น API URL จริง
${WEB_URL}         http://localhost:3001    # แก้เป็น Web URL จริง
${BROWSER}         chrome
${DELAY}           1s

# ================= Test Data =================
${PASSENGER_EMAIL}      passengerdel@gmail.com
${PASSENGER_USER}       passengerdel
${PASSENGER_PASS}       123456789
${DRIVER_EMAIL}         driverdel@gmail.com
${DRIVER_USER}          driverdel
${DRIVER_PASS}          123456789
${ADMIN_USER}           admin123
${ADMIN_PASS}           123456789
${IDCARD_PATH}          ${CURDIR}/idcard.jpeg
${SELFIE_PATH}          ${CURDIR}/selfie.jpg

# ================= Locators (สมมติ) =================
${TXT_USERNAME}         id=identifier
${TXT_PASSWORD}         id=password
${BTN_LOGIN}            id=loginButton
${BTN_LOGOUT}           id=logout_button

*** Keywords ***
# ================= System Keywords =================
Open System Browser
    Open Browser    ${WEB_URL}    ${BROWSER}   options=add_argument("--incognito")
    Maximize Browser Window

# ================= Web UI Registration =================
Register User Via Web UI
    [Arguments]    ${username}    ${email}    ${password}    ${firstname}    ${lastname}    ${phone}    ${gender}    ${national_id}    ${expiry}
    Go To    ${WEB_URL}/register
    Sleep    ${DELAY}
    
    # Step 1 - Account Info
    Wait Until Element Is Visible     id=username    timeout=10s
    Input Text                        id=username    ${username}
    Input Text                        id=email       ${email}
    Input Text                        id=password    ${password}
    Input Text                        id=confirmPassword    ${password}
    Click Button                      id=nextStep1

    # Step 2 - Personal Info
    Wait Until Element Is Visible     id=firstName    timeout=10s
    Input Text                        id=firstName     ${firstname}
    Input Text                        id=lastName      ${lastname}
    Input Text                        id=phoneNumber   ${phone}
    Click Element                     xpath=//input[@name='gender' and @value='${gender}']
    Click Button                      id=nextStep2

    # Step 3 - Verification
    Wait Until Element Is Visible     id=idNumber    timeout=10s
    Choose File                       id=idCardFile    ${IDCARD_PATH}
    Input Text                        id=idNumber      ${national_id}
    Input Text                        id=expiryDate    ${expiry}
    Choose File                       id=selfieFile    ${SELFIE_PATH}
    Click Element                     xpath=//input[@type='checkbox']
    Click Button                      xpath=//button[@type='submit']

    # Verify Register Success
    Wait Until Page Contains          สมัครสมาชิกเรียบร้อยแล้ว!    timeout=20s
    Sleep                             ${DELAY}

Login To System
    [Arguments]    ${username}    ${password}
    Go To                               ${WEB_URL}/login
    Wait Until Element Is Visible       ${TXT_USERNAME}
    Input Text                          ${TXT_USERNAME}    ${username}
    Input Text                          ${TXT_PASSWORD}    ${password}
    Click Button                        ${BTN_LOGIN}
    Wait Until Page Contains Element    xpath=//main    timeout=10s


Logout From System
    Wait Until Element Is Visible        xpath=//div[contains(@class,'dropdown-trigger')]    timeout=10s
    Mouse Over                           xpath=//div[contains(@class,'dropdown-trigger')]
    Sleep                                ${DELAY}
    Wait Until Element Is Visible    xpath=//button[contains(., 'Logout')]    timeout=10s
    Click Button                     xpath=//button[contains(., 'Logout')]

Logout From System Driver
    Wait Until Element Is Visible    xpath=(//div[contains(@class, 'dropdown-trigger')])[2]/div    timeout=10s
    Mouse Over                       xpath=(//div[contains(@class, 'dropdown-trigger')])[2]/div
    Sleep                                ${DELAY}
    Wait Until Element Is Visible    xpath=//button[contains(., 'Logout')]    timeout=10s
    Click Button                     xpath=//button[contains(., 'Logout')]

Logout From System Admin
    Wait Until Element Is Visible    xpath=//button[contains(., 'Setting')]    timeout=10s
    Click Button                     xpath=//button[contains(., 'Setting')]
    Sleep                            1s    
    Wait Until Element Is Visible    xpath=//div[@id='ecom-menu']//button[contains(., 'Logout')]    timeout=10s
    Click Button                     xpath=//div[@id='ecom-menu']//button[contains(., 'Logout')]

# ================= UI Action Keywords =================
Driver Fills Verification Form
    Wait Until Element Is Visible        xpath=//div[contains(@class,'dropdown-trigger')]    timeout=10s
    Mouse Over                           xpath=//div[contains(@class,'dropdown-trigger')]
    Sleep                                ${DELAY}
    Wait Until Element Is Visible        id=profileDropdown    timeout=10s
    Click Element                        id=profileDropdown
    Wait Until Location Contains         /profile    timeout=10s
    Sleep                                ${DELAY}
    Wait Until Element Is Visible        xpath=//a[@href='/profile/driver-verification']    timeout=10s
    Click Element                        xpath=//a[@href='/profile/driver-verification']
    Sleep                                ${DELAY}
    Wait Until Page Contains Element     xpath=(//input[@type='file'])[1]    timeout=10s
    Choose File                          xpath=(//input[@type='file'])[1]    ${IDCARD_PATH}   
    Sleep                                0.5s
    Choose File                          xpath=(//input[@type='file'])[2]    ${SELFIE_PATH}
    Sleep                                0.5s
    Input Text                           id=firstNameOnLicense    driver
    Input Text                           id=lastNameOnLicense     delete
    Input Text                           id=licenseNumber    12345678
    Select From List By Value            id=typeOnLicense    PRIVATE_CAR
    Input Text                           id=licenseIssueDate    12/31/2026
    Input Text                           id=licenseExpiryDate   12/31/2031
    Sleep                                ${DELAY}
    Click Button                         xpath=//button[@type='submit']
    Sleep                                3s

Driver Adds Vehicle
    Wait Until Element Is Visible    xpath=//div[contains(@class,'dropdown-trigger')]    timeout=10s
    Mouse Over                       xpath=//div[contains(@class,'dropdown-trigger')]
    Sleep                            ${DELAY}
    Wait Until Element Is Visible    id=profileDropdown    timeout=10s
    Click Element                    id=profileDropdown
    Wait Until Location Contains     /profile    timeout=10s
    Sleep                            ${DELAY}
    Wait Until Element Is Visible    xpath=//a[@href='/profile/my-vehicle']    timeout=10s
    Click Element                    xpath=//a[@href='/profile/my-vehicle']
    Sleep                            ${DELAY}
    Wait Until Element Is Visible    xpath=//button[contains(text(), 'เพิ่ม / จัดการข้อมูล')]    timeout=10s
    Click Button                     xpath=//button[contains(text(), 'เพิ่ม / จัดการข้อมูล')]
    Wait Until Element Is Visible    xpath=//button[contains(., 'เพิ่มรถยนต์คันใหม่')]    timeout=10s
    Click Button                     xpath=//button[contains(., 'เพิ่มรถยนต์คันใหม่')]
    Input Text                       xpath=//input[@placeholder='เช่น Toyota Camry']    Honda City
    Input Text                       xpath=//input[@placeholder='เช่น กก 1234 ขอนแก่น']    1234ขอนแก่น
    Select From List By Label        xpath=//select[option[text()='Sedan']]    Sedan
    Input Text                       xpath=//input[@placeholder='เช่น สีดำ']    ขาว
    Input Text                       xpath=//input[@placeholder='เช่น 4']    3
    Input Text                       xpath=//input[@placeholder='เช่น Air Conditioner, Music, Phone Charger']    แอร์
    Click Element                    id=isDefault
    Wait Until Element Is Visible    xpath=//button[contains(text(), 'บันทึก')]    timeout=10s
    Click Button                     xpath=//button[contains(text(), 'บันทึก')]
    Wait Until Element Is Visible    xpath=//button[contains(., 'ยืนยัน')]    timeout=10s
    Sleep                            ${DELAY}
    Click Button                     xpath=//button[contains(., 'ยืนยัน')]

Admin Approves Driver
    [Arguments]    ${DRIVER_EMAIL}
    Wait Until Element Is Visible    xpath=(//div[contains(@class, 'dropdown-trigger')])[2]/div    timeout=10s
    Mouse Over                       xpath=(//div[contains(@class, 'dropdown-trigger')])[2]/div
    Sleep                            ${DELAY}
    Wait Until Element Is Visible    xpath=//a[@href='/admin/users']    timeout=10s
    Click Element                    xpath=//a[@href='/admin/users']
    Wait Until Element Is Visible    xpath=//button[.//i[contains(@class, 'fa-bars')]]    timeout=10s
    Click Button                     xpath=//button[.//i[contains(@class, 'fa-bars')]]
    Wait Until Element Is Visible        xpath=//a[@href='/admin/driver-verifications']    timeout=10s
    Click Element                        xpath=//a[@href='/admin/driver-verifications']
    Wait Until Element Is Visible    xpath=//tr[contains(., '${DRIVER_EMAIL}')]//button[@title='ดูรายละเอียด']    timeout=10s
    Click Button                     xpath=//tr[contains(., '${DRIVER_EMAIL}')]//button[@title='ดูรายละเอียด']
    Wait Until Element Is Visible    xpath=//button[contains(., 'approve')]    timeout=10s
    Click Button                     xpath=//button[contains(., 'approve')]
    Wait Until Element Is Visible    xpath=//button[.//i[contains(@class, 'fa-bars')]]    timeout=10s
    Click Button                     xpath=//button[.//i[contains(@class, 'fa-bars')]]


Driver Creates Route Via Web UI
    [Arguments]    ${start_loc}    ${end_loc}    ${depart_date}    ${depart_time}    ${seats}    ${price}    ${conditions}
    Wait Until Element Is Visible    xpath=//a[@href='/createTrip']    timeout=10s
    Click Element                    xpath=//a[@href='/createTrip']
    Wait Until Element Is Visible    id=startPoint    timeout=10s
    Input Text                       id=startPoint    ${start_loc}
    Sleep                            ${DELAY}
    Press Keys                       id=startPoint    ARROW_DOWN
    Press Keys                       id=startPoint    ENTER
    Sleep                            0.5s
    Wait Until Element Is Visible    id=endPoint      timeout=10s
    Input Text                       id=endPoint      ${end_loc}
    Sleep                             ${DELAY}
    Press Keys                       id=endPoint      ARROW_DOWN
    Press Keys                       id=endPoint      ENTER
    Sleep                            0.5s
    Input Text                       id=travelDate    ${depart_date}
    Input Text                       id=travelTime    ${depart_time}
    Input Text                       id=seatCount    ${seats}
    Input Text                       id=pricePerSeat    ${price}
    Input Text                       id=terms    ${conditions}
    Sleep                            15s
    Wait Until Element Is Visible    xpath=//button[contains(., 'สร้างการเดินทาง')]    timeout=10s
    Click Button                     xpath=//button[contains(., 'สร้างการเดินทาง')]
    Sleep                            3s


Passenger Books A Seat
    Wait Until Element Is Visible    xpath=//a[@href='/findTrip']    timeout=10s
    Sleep                            ${DELAY}
    Click Element                    xpath=//a[@href='/findTrip']
    ${ROUTE_CARD}    Set Variable    xpath=//div[contains(@class, 'route-card') and contains(., 'Khon Kaen University') and contains(., 'Tops CentralPlaza')]
    Wait Until Element Is Visible    ${ROUTE_CARD}    timeout=10s
    Click Element                    ${ROUTE_CARD}
    Sleep    1s
    Wait Until Element Is Visible    xpath=//button[contains(., 'จองที่นั่ง')]    timeout=10s
    Click Button                     xpath=//button[contains(., 'จองที่นั่ง')]
    Wait Until Element Is Visible    xpath=(//input[@placeholder='พิมพ์ชื่อสถานที่...'])[1]    timeout=10s
    Input Text                       xpath=(//input[@placeholder='พิมพ์ชื่อสถานที่...'])[1]    Khon Kaen University
    Press Keys                       xpath=(//input[@placeholder='พิมพ์ชื่อสถานที่...'])[1]    ARROW_DOWN
    Press Keys                       xpath=(//input[@placeholder='พิมพ์ชื่อสถานที่...'])[1]    ENTER
    Sleep                            0.5s
    Input Text                       xpath=(//input[@placeholder='พิมพ์ชื่อสถานที่...'])[2]    Central Khonkaen
    Press Keys                       xpath=(//input[@placeholder='พิมพ์ชื่อสถานที่...'])[2]    ARROW_DOWN
    Press Keys                       xpath=(//input[@placeholder='พิมพ์ชื่อสถานที่...'])[2]    ENTER
    Sleep                            0.5s
    Wait Until Element Is Visible    xpath=//button[contains(., 'ยืนยันการจอง')]    timeout=10s
    Click Button                     xpath=//button[contains(., 'ยืนยันการจอง')]
    Wait Until Page Contains         ส่งคำขอจองสำเร็จ!    timeout=10s

Driver Approves Booking Request
    [Arguments]        ${PASSENGER_EMAIL}
    Wait Until Element Is Visible    xpath=//a[contains(., 'การเดินทางทั้งหมด')]    timeout=10s
    Click Element                    xpath=//a[contains(., 'การเดินทางทั้งหมด')]
    Sleep                            ${DELAY}            
    Wait Until Element Is Visible    xpath=//a[contains(., 'คำขอจองเส้นทางของฉัน')]    timeout=10s
    Click Element                    xpath=//a[contains(., 'คำขอจองเส้นทางของฉัน')]
    Sleep                            ${DELAY}
    Wait Until Element Is Visible    xpath=//div[contains(@class, 'trip-card')]    timeout=15s
    ${CONFIRM_BTN}=    Set Variable    xpath=//a[contains(text(), '${PASSENGER_EMAIL}')]/ancestor::div[contains(@class, 'trip-card')]//button[contains(., 'ยืนยันคำขอ')]
    Wait Until Element Is Visible    ${CONFIRM_BTN}    timeout=10s
    Click Button                     ${CONFIRM_BTN}
    Wait Until Element Is Visible    xpath=//button[contains(@class, 'btn-primary') and contains(., 'ยืนยันคำขอ')]    timeout=10s
    Wait Until Element Is Enabled    xpath=//button[contains(@class, 'btn-primary') and contains(., 'ยืนยันคำขอ')]    timeout=10s
    Click Button                     xpath=//button[contains(@class, 'btn-primary') and contains(., 'ยืนยันคำขอ')]
    Sleep                            ${DELAY}
    Wait Until Element Is Visible    xpath=//button[contains(., 'เส้นทางของฉัน')]    timeout=10s
    Click Button                     xpath=//button[contains(., 'เส้นทางของฉัน')]
    Sleep    1s
    Wait Until Element Is Visible    xpath=//button[contains(., 'ยืนยันการเดินทาง')]    timeout=10s
    Click Button                     xpath=//button[contains(., 'ยืนยันการเดินทาง')]
    Wait Until Page Contains         สำเร็จ    timeout=10s

Passenger Confirms Arrival
    Reload Page
    Wait Until Element Is Visible    xpath=//a[@href='/myTrip']    timeout=10s
    Click Element                    xpath=//a[@href='/myTrip']
    Wait Until Element Is Visible    xpath=//button[contains(normalize-space(.), 'ทั้งหมด')]    timeout=10s
    Click Button                     xpath=//button[contains(normalize-space(.), 'ทั้งหมด')]
    Wait Until Element Is Visible    xpath=//button[contains(., 'ยืนยันถึงจุดหมาย')]    timeout=10s
    Click Button                     xpath=//button[contains(., 'ยืนยันถึงจุดหมาย')]
    Wait Until Page Contains         สำเร็จ    timeout=10s

Driver Confirms Arrival
    Wait Until Element Is Visible    xpath=//a[contains(., 'การเดินทางทั้งหมด')]    timeout=10s
    Click Element                    xpath=//a[contains(., 'การเดินทางทั้งหมด')]
    Sleep                            ${DELAY}            
    Wait Until Element Is Visible    xpath=//a[contains(., 'คำขอจองเส้นทางของฉัน')]    timeout=10s
    Click Element                    xpath=//a[contains(., 'คำขอจองเส้นทางของฉัน')]
    Sleep                            ${DELAY}    
    Reload Page
    Wait Until Element Is Visible    xpath=//button[contains(@class, 'tab-button') and contains(normalize-space(.), 'ทั้งหมด')]    timeout=15s
    Click Button                     xpath=//button[contains(@class, 'tab-button') and contains(normalize-space(.), 'ทั้งหมด')]
    Sleep                            ${DELAY}    
    Wait Until Element Is Visible    xpath=//button[contains(., 'ยืนยันถึงจุดหมาย')]    timeout=10s
    Click Button                     xpath=//button[contains(., 'ยืนยันถึงจุดหมาย')]
    Wait Until Page Contains         สำเร็จ    timeout=10s
    Sleep                            ${DELAY}    
    Wait Until Element Is Visible    xpath=//button[contains(normalize-space(.), 'เส้นทางของฉัน')]    timeout=10s
    Click Button                     xpath=//button[contains(normalize-space(.), 'เส้นทางของฉัน')]
    Sleep                            ${DELAY}    
    Wait Until Element Is Visible    xpath=//button[contains(., 'ยืนยันการถึงที่หมาย')]    timeout=10s
    Click Button                     xpath=//button[contains(., 'ยืนยันการถึงที่หมาย')]
    Wait Until Page Contains         สำเร็จ    timeout=10s

Deletes Account Passenger
    [Arguments]   ${EMAIL}
    Wait Until Element Is Visible        xpath=//div[contains(@class,'dropdown-trigger')]    timeout=10s
    Mouse Over                           xpath=//div[contains(@class,'dropdown-trigger')]
    Sleep                                ${DELAY}
    Wait Until Element Is Visible        id=profileDropdown    timeout=10s
    Click Element                        id=profileDropdown
    Wait Until Location Contains         /profile    timeout=10s
    Sleep                                ${DELAY}
    Click Element    id=deleteAccountButton
    ${CHECKBOX}    Set Variable    xpath=//span[contains(text(), 'ยอมรับข้อกำหนดและเงื่อนไข')]/preceding-sibling::input[@type='checkbox']
    Wait Until Element Is Visible    ${CHECKBOX}    timeout=10s
    Select Checkbox                  ${CHECKBOX}
    Sleep    1s
    ${DELETE_BTN}  Set Variable    xpath=//button[contains(., 'ยืนยันการลบ')]
    Wait Until Element Is Enabled    ${DELETE_BTN}    timeout=10s
    Click Button                     ${DELETE_BTN}
    Wait Until Element Is Visible    xpath=//input[@placeholder='กรอกอีเมลของคุณ']    timeout=10s
    Input Text                       xpath=//input[@placeholder='กรอกอีเมลของคุณ']    ${EMAIL}
    Wait Until Element Is Enabled    xpath=//button[contains(., 'ยืนยันการลบบัญชี')]    timeout=10s
    Click Button                     xpath=//button[contains(., 'ยืนยันการลบบัญชี')]
    Wait Until Page Contains    ลบบัญชีสำเร็จแล้ว   timeout=10s

Deletes Account driver
    [Arguments]   ${EMAIL}
    Wait Until Element Is Visible    xpath=(//div[contains(@class, 'dropdown-trigger')])[2]/div    timeout=10s
    Mouse Over                       xpath=(//div[contains(@class, 'dropdown-trigger')])[2]/div
    Sleep                                ${DELAY}
    Wait Until Element Is Visible        id=profileDropdown    timeout=10s
    Click Element                        id=profileDropdown
    Wait Until Location Contains         /profile    timeout=10s
    Sleep                                ${DELAY}
    Click Element    id=deleteAccountButton
    ${CHECKBOX}    Set Variable    xpath=//span[contains(text(), 'ยอมรับข้อกำหนดและเงื่อนไข')]/preceding-sibling::input[@type='checkbox']
    Wait Until Element Is Visible    ${CHECKBOX}    timeout=10s
    Select Checkbox                  ${CHECKBOX}
    Sleep    1s
    ${DELETE_BTN}  Set Variable    xpath=//button[contains(., 'ยืนยันการลบ')]
    Wait Until Element Is Enabled    ${DELETE_BTN}    timeout=10s
    Click Button                     ${DELETE_BTN}
    Wait Until Element Is Visible    xpath=//input[@placeholder='กรอกอีเมลของคุณ']    timeout=10s
    Input Text                       xpath=//input[@placeholder='กรอกอีเมลของคุณ']    ${EMAIL}
    Wait Until Element Is Enabled    xpath=//button[contains(., 'ยืนยันการลบบัญชี')]    timeout=10s
    Click Button                     xpath=//button[contains(., 'ยืนยันการลบบัญชี')]
    Wait Until Page Contains    ลบบัญชีสำเร็จแล้ว   timeout=10s 
    
# ================= Dual Window Setup =================
Open Passenger And Driver Browsers
    # 1. เปิดหน้าต่าง Passenger (อยู่ซ้าย)
    Open Browser    ${WEB_URL}    ${BROWSER}    alias=passenger_window  options=add_argument("--incognito")
    Set Window Size    960    1080
    Set Window Position    0    0

    # 2. เปิดหน้าต่าง Driver (อยู่ขวา)
    Open Browser    ${WEB_URL}    ${BROWSER}    alias=driver_window  options=add_argument("--incognito")
    Set Window Size    960    1080
    Set Window Position    960    0
