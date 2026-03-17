*** Variables ***

# ================= Authentication =================
${TXT_USERNAME}                        id=identifier
${TXT_PASSWORD}                        id=password
${BTN_LOGIN}                           id=loginButton
${BTN_LOGOUT}                          id=logout_button

# ================= Profile & Account =================
${DROPDOWN_PROFILE}                    xpath=//div[contains(@class,'dropdown-trigger')]
${DROPDOWN_PROFILE_DRIVER}             xpath=(//div[contains(@class, 'dropdown-trigger')])[2]/div
${PROFILE_DROPDOWN_BTN}                id=profileDropdown
${BTN_SETTING}                         xpath=//button[contains(., 'Setting')]
${MENU_ECOM}                           xpath=//div[@id='ecom-menu']//button[contains(., 'Logout')]
${BTN_DELETE_ACCOUNT}                  id=deleteAccountButton
${CHECKBOX_ACCEPT_TERMS}               xpath=//span[contains(text(), 'ยอมรับข้อกำหนดและเงื่อนไข')]/preceding-sibling::input[@type='checkbox']
${BTN_CONFIRM_DELETE}                  xpath=//button[contains(., 'ยืนยันการลบ')]
${INPUT_EMAIL_DELETE}                  xpath=//input[@placeholder='กรอกอีเมลของคุณ']
${INPUT_PASSWORD_DELETE}               xpath=//input[@placeholder="กรอกรหัสผ่านของคุณ"]
${BTN_CONFIRM_DELETE_ACCOUNT}          xpath=//button[span[text()="ยืนยันการลบบัญชี"]]

# ================= Driver Verification =================
${LINK_DRIVER_VERIFICATION}            xpath=//a[@href='/profile/driver-verification']
${INPUT_FIRST_NAME_LICENSE}            id=firstNameOnLicense
${INPUT_LAST_NAME_LICENSE}             id=lastNameOnLicense
${INPUT_LICENSE_NUMBER}                id=licenseNumber
${SELECT_LICENSE_TYPE}                 id=typeOnLicense
${INPUT_LICENSE_ISSUE_DATE}            id=licenseIssueDate
${INPUT_LICENSE_EXPIRY_DATE}           id=licenseExpiryDate
${INPUT_ID_FILE_1}                     xpath=(//input[@type='file'])[1]
${INPUT_ID_FILE_2}                     xpath=(//input[@type='file'])[2]

# ================= Vehicle Management =================
${LINK_MY_VEHICLE}                     xpath=//a[@href='/profile/my-vehicle']
${BTN_MANAGE_VEHICLE}                  xpath=//button[contains(text(), 'เพิ่ม / จัดการข้อมูล')]
${BTN_ADD_NEW_VEHICLE}                 xpath=//button[contains(., 'เพิ่มรถยนต์คันใหม่')]
${INPUT_VEHICLE_NAME}                  xpath=//input[@placeholder='เช่น Toyota Camry']
${INPUT_VEHICLE_PLATE}                 xpath=//input[@placeholder='เช่น กก 1234 ขอนแก่น']
${SELECT_VEHICLE_TYPE}                 xpath=//select[option[text()='Sedan']]
${INPUT_VEHICLE_COLOR}                 xpath=//input[@placeholder='เช่น สีดำ']
${INPUT_VEHICLE_SEATS}                 xpath=//input[@placeholder='เช่น 4']
${INPUT_VEHICLE_AMENITIES}             xpath=//input[@placeholder='เช่น Air Conditioner, Music, Phone Charger']
${CHECKBOX_DEFAULT_VEHICLE}            id=isDefault
${BTN_SAVE_VEHICLE}                    xpath=//button[contains(text(), 'บันทึก')]
${BTN_CONFIRM_VEHICLE}                 xpath=//button[contains(., 'ยืนยัน')]

# ================= Admin Panel =================
${LINK_ADMIN_USERS}                    xpath=//a[@href='/admin/users']
${LINK_ADMIN_DRIVER_VERIFICATIONS}     xpath=//a[@href='/admin/driver-verifications']
${BTN_ADMIN_MENU}                      xpath=//button[.//i[contains(@class, 'fa-bars')]]
${BTN_DRIVER_DETAIL}                   xpath=//tr[contains(., '${DRIVER_EMAIL}')]//button[@title='ดูรายละเอียด']
${BTN_APPROVE_DRIVER}                  xpath=//button[contains(., 'approve')]

# ================= Trip Management =================
${LINK_CREATE_TRIP}                    xpath=//a[@href='/createTrip']
${LINK_FIND_TRIP}                      xpath=//a[@href='/findTrip']
${LINK_MY_TRIP}                        xpath=//a[@href='/myTrip']
${LINK_MY_ROUTES}                      xpath=//a[contains(., 'การเดินทางของฉัน')]
${LINK_MY_TRIPS_ALL}                   xpath=//a[contains(., 'การเดินทางทั้งหมด')]
${LINK_BOOKING_REQUESTS}               xpath=//a[contains(., 'คำขอจองเส้นทางของฉัน')]

# ================= Trip Creation Form =================
${INPUT_START_POINT}                   id=startPoint
${INPUT_END_POINT}                     id=endPoint
${INPUT_TRAVEL_DATE}                   id=travelDate
${INPUT_TRAVEL_TIME}                   id=travelTime
${INPUT_SEAT_COUNT}                    id=seatCount
${INPUT_PRICE_PER_SEAT}                id=pricePerSeat
${INPUT_TERMS}                         id=terms
${BTN_CREATE_TRIP}                     xpath=//button[contains(., 'สร้างการเดินทาง')]

# ================= Booking Flow =================
${BTN_BOOK_SEAT}                       xpath=//button[contains(., 'จองที่นั่ง')]
${BTN_CONFIRM_BOOKING}                 xpath=//button[contains(., 'ยืนยันการจอง')]
${BTN_CONFIRM_REQUEST}                 xpath=//button[contains(., 'ยืนยันคำขอ')]
${BTN_CONFIRM_REQUEST_PRIMARY}         xpath=//button[contains(@class, 'btn-primary') and contains(., 'ยืนยันคำขอ')]
${TAB_ALL}                              xpath=//button[contains(normalize-space(.), 'ทั้งหมด')]
${TAB_ALL_CLASS}                        xpath=//button[contains(@class, 'tab-button') and contains(normalize-space(.), 'ทั้งหมด')]

# ================= Trip Status =================
${BTN_MY_ROUTES}                       xpath=//button[contains(., 'เส้นทางของฉัน')]
${BTN_CONFIRM_TRIP}                    xpath=//button[contains(., 'ยืนยันการเดินทาง')]
${BTN_CONFIRM_ARRIVAL}                 xpath=//button[contains(., 'ยืนยันถึงจุดหมาย')]
${BTN_CONFIRM_ARRIVAL_DRIVER}          xpath=//button[contains(., 'ยืนยันการถึงที่หมาย')]

# ================= Review Flow =================
${BTN_WRITE_REVIEW}                    xpath=//button[contains(.,'เขียนรีวิว')]
${BTN_RATING_STAR}                     xpath=(//div[contains(@class,'flex gap-2 text-4xl')]//button[@type='button'])
${BTN_REVIEW_TAG}                      xpath=//Button[contains(.,'ขับขี่ปลอดภัย')]
${TEXTAREA_REVIEW}                     xpath=//textarea[@placeholder='เล่าประสบการณ์ เช่น ความตรงต่อเวลา ความสะอาด การขับขี่']
${INPUT_REVIEW_IMAGE}                  xpath=//input[@type='file' and contains(@accept,'image')]
${BTN_SUBMIT_REVIEW}                   xpath=//button[contains(.,'ส่งรีวิว')]
${MODAL_CONFIRM_REVIEW}                xpath=//h3[contains(.,'ยืนยันการส่งรีวิว')]
${BTN_CONFIRM_REVIEW_SUBMIT}           xpath=//button[contains(.,'ยืนยันและส่งรีวิว')]

# ================= Registration Form =================
${INPUT_USERNAME}                      id=username
${INPUT_EMAIL}                         id=email
${INPUT_PASSWORD}                      id=password
${INPUT_CONFIRM_PASSWORD}              id=confirmPassword
${BTN_NEXT_STEP_1}                     id=nextStep1
${INPUT_FIRST_NAME}                    id=firstName
${INPUT_LAST_NAME}                     id=lastName
${INPUT_PHONE_NUMBER}                  id=phoneNumber
${BTN_NEXT_STEP_2}                     id=nextStep2
${INPUT_ID_NUMBER}                     id=idNumber
${INPUT_ID_CARD_FILE}                  id=idCardFile
${INPUT_EXPIRY_DATE}                   id=expiryDate
${INPUT_SELFIE_FILE}                   id=selfieFile
${CHECKBOX_REGISTER}                   xpath=//input[@type='checkbox']
${BTN_SUBMIT_REGISTER}                 xpath=//button[@type='submit']

# ================= Route Card =================
${ROUTE_CARD}                          xpath=//div[contains(@class, 'route-card') and contains(., 'Khon Kaen University') and contains(., 'Tops CentralPlaza')]
${PICKUP_LOCATION_INPUT}               xpath=(//input[@placeholder='พิมพ์ชื่อสถานที่...'])[1]
${DROPOFF_LOCATION_INPUT}              xpath=(//input[@placeholder='พิมพ์ชื่อสถานที่...'])[2]

# ================= Main Content =================
${MAIN_CONTENT}                        xpath=//main
${TRIP_CARD}                           xpath=//div[contains(@class, 'trip-card')]
