*** Settings ***
Documentation   User Acceptance Testing for US1 - Passenger and Driver Flow
Resource        common_resource.resource

Suite Setup     Run Keywords
...             Create Session    api_session    ${BASE_API_URL}    AND
...             Open System Browser
Suite Teardown  Close All Browsers

*** Test Cases ***

TC01 สร้าง Account Passenger และ Driver ผ่าน API และเข้าหน้า Home ได้
    [Documentation]    สร้าง User 2 Role ผ่าน API และทดสอบว่าล็อกอินเข้าสู่หน้าแรกได้
    Create User Via API    ${PASSENGER_EMAIL}    ${PASSENGER_USER}    ${PASSENGER_PASS}    passenger    1349912345679
    Create User Via API    ${DRIVER_EMAIL}       ${DRIVER_USER}       ${DRIVER_PASS}       driver       1349912345678
    Login To System        ${PASSENGER_USER}     ${PASSENGER_PASS}
    Logout From System

TC02 ผู้ใช้ที่เป็น Driver ยืนยัน Driver Verification
    [Documentation]    Driver เข้าสู่ระบบและกรอกข้อมูลใบขับขี่
    Login To System    ${DRIVER_USER}    ${DRIVER_PASS}
    Driver Fills Verification Form

TC03 ผู้ใช้ที่เป็น Driver สร้าง Vehicle
    [Documentation]    Driver เพิ่มข้อมูลรถยนต์
    Driver Adds Vehicle
    Logout From System

TC04 Admin Verify Driver
    [Documentation]    Admin ล็อกอินเข้ามาอนุมัติ Driver
    Login To System    ${ADMIN_USER}    ${ADMIN_PASS}
    Admin Approves Driver    ${DRIVER_USER}
    Logout From System

TC05 Driver สร้างเส้นทาง(Routes) ผ่าน API
    [Documentation]    นำ Token ของ Driver ไปยิง POST /api/routes
    ${driver_token}=    Get API Auth Token    ${DRIVER_USER}    ${DRIVER_PASS}
    ${headers}=         Create Dictionary     Authorization=Bearer ${driver_token}
    
    ${start_loc}=    Create Dictionary    lat=16.4772    lng=102.8141    name=Khon Kaen University    address=123 ถนนมิตรภาพ
    ${end_loc}=      Create Dictionary    lat=16.445     lng=102.834     name=Central Plaza Khon Kaen    address=ถ. ศรีจันทร์
    ${waypoints}=    Create List          ${{ {'lat': 16.46, 'lng': 102.82, 'name': 'ตลาดต้นตาล'} }}

    ${route_payload}=    Create Dictionary
    ...    vehicleId=${VEHICLE_ID}    startLocation=${start_loc}    endLocation=${end_loc}
    ...    departureTime=2030-10-15T09:00:00Z    availableSeats=${3}    pricePerSeat=${50}
    ...    conditions=ห้ามสูบบุหรี่ในรถ    waypoints=${waypoints}    optimizeWaypoints=${True}

    ${res_route}=    POST On Session    api_session    /api/routes    json=${route_payload}    headers=${headers}
    Status Should Be    201    ${res_route}

TC07 - TC10 Flow การจองและเดินทางแบบ Real-time (ซ้าย Passenger / ขวา Driver)
    [Documentation]    ทดสอบ 2 หน้าต่างพร้อมกัน ตั้งแต่จองที่นั่งจนจบการเดินทาง
    
    # ================= ฝั่ง Passenger (ซ้าย) =================
    Switch Browser    passenger_window
    Login To System   ${PASSENGER_USER}    ${PASSENGER_PASS}
    Passenger Books A Seat    # TC07: ค้นหาเส้นทางและกดจองที่นั่ง

    # ================= ฝั่ง Driver (ขวา) =================
    Switch Browser    driver_window
    Login To System   ${DRIVER_USER}    ${DRIVER_PASS}
    
    # TC08: Driver เห็นคำขอจอง กดยืนยันคำขอ และกดยืนยันเริ่มเดินทาง
    Click Element     id=my_booking_requests_menu
    Wait Until Element Is Visible    xpath=//button[text()='ยืนยันคำขอ']
    Click Button      xpath=//button[text()='ยืนยันคำขอ']
    Wait Until Element Is Visible    xpath=//button[text()='ยืนยันการเดินทาง']
    Click Button      xpath=//button[text()='ยืนยันการเดินทาง']

    # ================= ฝั่ง Passenger (ซ้าย) =================
    Switch Browser    passenger_window
    # TC09: Passenger เห็นว่ารถเริ่มเดินทางแล้ว และกดยืนยันเมื่อถึงจุดหมาย
    Click Element     id=my_trips_menu
    Wait Until Element Is Visible    xpath=//button[text()='ถึงจุดหมาย']
    Click Button      xpath=//button[text()='ถึงจุดหมาย']

    # ================= ฝั่ง Driver (ขวา) =================
    Switch Browser    driver_window
    # TC10: Driver เห็น Passenger กดยืนยัน จึงกดยืนยันถึงจุดหมายและจบงาน
    Wait Until Element Is Visible    xpath=//button[text()='ยืนยันถึงจุดหมาย']
    Click Button      xpath=//button[text()='ยืนยันถึงจุดหมาย']
    Wait Until Element Is Visible    xpath=//button[text()='ยืนยันการถึงที่หมาย']
    Click Button      xpath=//button[text()='ยืนยันการถึงที่หมาย']

TC11, TC12 Passenger ทำการลบบัญชีผู้ใช้
    [Documentation]    รวบ TC11 (Login) และ TC12 (Delete) เข้าด้วยกันตาม Flow ใช้งานจริง
    Login To System    ${PASSENGER_USER}    ${PASSENGER_PASS}
    Passenger Deletes Account

TC13 Driver เห็นข้อมูล Passenger เป็น Anonymous
    Login To System    ${DRIVER_USER}    ${DRIVER_PASS}
    Click Element    id=my_booking_requests_menu
    Wait Until Page Contains    Anonymous