*** Settings ***
Library         SeleniumLibrary
Resource        ../variables/test_data.robot
Resource        ../variables/common_locators.robot

*** Keywords ***

# ================= Trip Creation =================
Driver Creates Route Via Web UI
    [Documentation]    Driver สร้างเส้นทางการเดินทาง
    [Arguments]    ${start_loc}    ${end_loc}    ${depart_date}    ${depart_time}    ${seats}    ${price}    ${conditions}
    Wait Until Element Is Visible    ${LINK_CREATE_TRIP}    timeout=10s
    Click Element                    ${LINK_CREATE_TRIP}
    
    Wait Until Element Is Visible    ${INPUT_START_POINT}    timeout=10s
    Input Text                       ${INPUT_START_POINT}    ${start_loc}
    Sleep                            ${DELAY}
    Press Keys                       ${INPUT_START_POINT}    ARROW_DOWN
    Press Keys                       ${INPUT_START_POINT}    ENTER
    Sleep                            0.5s
    
    Wait Until Element Is Visible    ${INPUT_END_POINT}    timeout=10s
    Input Text                       ${INPUT_END_POINT}    ${end_loc}
    Sleep                            ${DELAY}
    Press Keys                       ${INPUT_END_POINT}    ARROW_DOWN
    Press Keys                       ${INPUT_END_POINT}    ENTER
    Sleep                            0.5s
    
    Input Text                       ${INPUT_TRAVEL_DATE}    ${depart_date}
    Input Text                       ${INPUT_TRAVEL_TIME}    ${depart_time}
    Input Text                       ${INPUT_SEAT_COUNT}    ${seats}
    Input Text                       ${INPUT_PRICE_PER_SEAT}    ${price}
    Input Text                       ${INPUT_TERMS}    ${conditions}
    Sleep                            15s
    
    Wait Until Element Is Visible    ${BTN_CREATE_TRIP}    timeout=10s
    Click Button                     ${BTN_CREATE_TRIP}
    Sleep                            3s

# ================= Booking =================
Passenger Books A Seat
    [Documentation]    Passenger จองที่นั่งในเส้นทาง
    Wait Until Element Is Visible    ${LINK_FIND_TRIP}    timeout=10s
    Sleep                            ${DELAY}
    Click Element                    ${LINK_FIND_TRIP}
    
    Wait Until Element Is Visible    ${ROUTE_CARD}    timeout=10s
    Click Element                    ${ROUTE_CARD}
    Sleep                            1s
    
    Wait Until Element Is Visible    ${BTN_BOOK_SEAT}    timeout=10s
    Click Button                     ${BTN_BOOK_SEAT}
    
    Wait Until Element Is Visible    ${PICKUP_LOCATION_INPUT}    timeout=10s
    Input Text                       ${PICKUP_LOCATION_INPUT}    Khon Kaen University
    Press Keys                       ${PICKUP_LOCATION_INPUT}    ARROW_DOWN
    Press Keys                       ${PICKUP_LOCATION_INPUT}    ENTER
    Sleep                            0.5s
    
    Input Text                       ${DROPOFF_LOCATION_INPUT}    Central Khonkaen
    Press Keys                       ${DROPOFF_LOCATION_INPUT}    ARROW_DOWN
    Press Keys                       ${DROPOFF_LOCATION_INPUT}    ENTER
    Sleep                            0.5s
    
    Wait Until Element Is Visible    ${BTN_CONFIRM_BOOKING}    timeout=10s
    Click Button                     ${BTN_CONFIRM_BOOKING}
    Wait Until Page Contains         ส่งคำขอจองสำเร็จ!    timeout=10s

Driver Approves Booking Request
    [Documentation]    Driver อนุมัติคำขอจองที่นั่ง
    [Arguments]    ${passenger_email}
    Wait Until Element Is Visible    ${LINK_MY_TRIPS_ALL}    timeout=10s
    Click Element                    ${LINK_MY_TRIPS_ALL}
    Sleep                            ${DELAY}            
    
    Wait Until Element Is Visible    ${LINK_BOOKING_REQUESTS}    timeout=10s
    Click Element                    ${LINK_BOOKING_REQUESTS}
    Sleep                            ${DELAY}
    
    Wait Until Element Is Visible    ${TRIP_CARD}    timeout=15s
    ${CONFIRM_BTN}=    Set Variable    xpath=//a[contains(text(), '${passenger_email}')]/ancestor::div[contains(@class, 'trip-card')]//button[contains(., 'ยืนยันคำขอ')]
    Wait Until Element Is Visible    ${CONFIRM_BTN}    timeout=10s
    Click Button                     ${CONFIRM_BTN}
    
    Wait Until Element Is Visible    ${BTN_CONFIRM_REQUEST_PRIMARY}    timeout=10s
    Wait Until Element Is Enabled    ${BTN_CONFIRM_REQUEST_PRIMARY}    timeout=10s
    Click Button                     ${BTN_CONFIRM_REQUEST_PRIMARY}
    Sleep                            ${DELAY}
    
    Wait Until Element Is Visible    ${BTN_MY_ROUTES}    timeout=10s
    Click Button                     ${BTN_MY_ROUTES}
    Sleep                            1s
    
    Wait Until Element Is Visible    ${BTN_CONFIRM_TRIP}    timeout=10s
    Click Button                     ${BTN_CONFIRM_TRIP}
    Wait Until Page Contains         สำเร็จ    timeout=10s

# ================= Trip Confirmation =================
Passenger Confirms Arrival
    [Documentation]    Passenger ยืนยันถึงจุดหมาย
    Reload Page
    Wait Until Element Is Visible    ${LINK_MY_TRIP}    timeout=10s
    Click Element                    ${LINK_MY_TRIP}
    
    Wait Until Element Is Visible    ${TAB_ALL}    timeout=10s
    Click Button                     ${TAB_ALL}
    
    Wait Until Element Is Visible    ${BTN_CONFIRM_ARRIVAL}    timeout=10s
    Click Button                     ${BTN_CONFIRM_ARRIVAL}
    Wait Until Page Contains         สำเร็จ    timeout=10s

Driver Confirms Arrival
    [Documentation]    Driver ยืนยันถึงจุดหมาย
    Wait Until Element Is Visible    ${LINK_MY_TRIPS_ALL}    timeout=10s
    Click Element                    ${LINK_MY_TRIPS_ALL}
    Sleep                            ${DELAY}            
    
    Wait Until Element Is Visible    ${LINK_BOOKING_REQUESTS}    timeout=10s
    Click Element                    ${LINK_BOOKING_REQUESTS}
    Sleep                            ${DELAY}    
    
    Reload Page
    Wait Until Element Is Visible    ${TAB_ALL_CLASS}    timeout=15s
    Click Button                     ${TAB_ALL_CLASS}
    Sleep                            ${DELAY}    
    
    Wait Until Element Is Visible    ${BTN_CONFIRM_ARRIVAL}    timeout=10s
    Click Button                     ${BTN_CONFIRM_ARRIVAL}
    Wait Until Page Contains         สำเร็จ    timeout=10s
    Sleep                            ${DELAY}    
    
    Wait Until Element Is Visible    ${BTN_MY_ROUTES}    timeout=10s
    Click Button                     ${BTN_MY_ROUTES}
    Sleep                            ${DELAY}    
    
    Wait Until Element Is Visible    ${BTN_CONFIRM_ARRIVAL_DRIVER}    timeout=10s
    Click Button                     ${BTN_CONFIRM_ARRIVAL_DRIVER}
    Wait Until Page Contains         สำเร็จ    timeout=10s
