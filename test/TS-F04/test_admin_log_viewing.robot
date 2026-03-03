*** Settings ***
Library    SeleniumLibrary
Library    DateTime
Library    String
Library    Collections
Resource   keywords/common_keywords.robot
Resource   keywords/admin_log_keywords.robot

Test Setup       Open Browser And Login As Admin
Test Teardown    Close All Browser Windows

*** Variables ***
${BASE_URL}              http://localhost:3001
${BROWSER}               chrome
${ADMIN_USERNAME}        admin123
${ADMIN_PASSWORD}        123456789
${LOG_PAGE_URL}          ${BASE_URL}/admin/log
${WAIT_TIME}             10s

# Locators
${BTN_EXPORT}            css:button[class*="bg-blue-600"]:has-text("Export")
${BTN_VERIFY_INTEGRITY}  css:button[class*="emerald"]:has-text("Verify")
${FILTER_USERNAME}       css:input[placeholder="ระบุ Username"]
${FILTER_IP_ADDRESS}     css:input[placeholder="เช่น 192.168.1.1"]
${SELECT_RESULT}         css:select:has-text("ผลลัพธ์")
${BTN_ACTION_FILTER}     css:button:has-text("หมวดหมู่ Action")
${BTN_SEARCH}            css:button:has-text("ค้นหา")
${BTN_CLEAR}             css:button:has-text("ล้างตัวกรอง")
${TABLE_LOGS}            css:tbody tr
${MODAL_ACTION}          css:div[class*="fixed"][class*="z-50"]
${BTN_USE_FILTER}        css:button:has-text("ใช้ตัวกรองนี้")
${BTN_CLEAR_ALL}         css:button:has-text("ล้างทั้งหมด")
${TABLE_NO_DATA}         css:tr:has-text("ไม่พบข้อมูล Audit Log")
${EXPORT_MODAL}          css:div[class*="fixed"]:has-text("Export Logs")
${SELECT_EXPORT_FORMAT}  css:select:has-text("Format")
${BTN_CONFIRM_EXPORT}    css:button:has-text("ดาวน์โหลดไฟล์")
${BTN_CLOSE_EXPORT}      css:button[class*="absolute"]


*** Test Cases ***
TS-F04-TC01: Admin Login Successfully
    [Documentation]    Admin logs in successfully with valid credentials
    [Tags]    UST001    critical
    
    # Verify login page is displayed
    Page Should Contain Element    css:input#identifier
    Page Should Contain Element    css:input#password
    
    # Verify login success with redirect to home page
    Location Should Contain    /

TS-F04-TC02: View Admin Log Page And Display All Logs
    [Documentation]    Navigate to log page and verify all logs are displayed
    [Tags]    UST001    critical
    
    # Navigate to log page
    Go To    ${LOG_PAGE_URL}
    
    # Verify page title and elements
    Page Should Contain Element    css:h1:has-text("System Logs")
    Page Should Contain Element    ${BTN_EXPORT}
    Page Should Contain Element    ${BTN_VERIFY_INTEGRITY}
    
    # Verify filter panel exists
    Page Should Contain Element    css:span:has-text("ตัวกรองระบบ")
    
    # Verify table is displayed
    Page Should Contain Element    ${TABLE_LOGS}
    
    # Wait for logs to load
    Wait For Logs To Load

TS-F04-TC03: Filter By Existing Username
    [Documentation]    Filter logs by username that exists in the system
    [Tags]    UST002    filter
    
    Go To    ${LOG_PAGE_URL}
    Wait For Logs To Load
    
    # Input username that exists (admin123)
    Input Text    ${FILTER_USERNAME}    admin123
    
    # Apply filters
    Click Button    ${BTN_SEARCH}
    Wait For Logs To Load
    
    # Verify logs are filtered and displayed
    ${rows_count}=    Get Element Count    ${TABLE_LOGS}
    Should Be True    ${rows_count} >= 1    Logs should be displayed for existing username

TS-F04-TC04: Filter By Non-Existing Username
    [Documentation]    Filter logs by username that does not exist
    [Tags]    UST003    filter

    Go To    ${LOG_PAGE_URL}
    Wait For Logs To Load
    
    # Input non-existing username
    Input Text    ${FILTER_USERNAME}    Unknow
    
    # Apply filters
    Click Button    ${BTN_SEARCH}
    Wait For Logs To Load
    
    # Verify no logs are displayed
    Page Should Contain Element    ${TABLE_NO_DATA}

TS-F04-TC05: Filter By Existing IP Address
    [Documentation]    Filter logs by IP address that exists
    [Tags]    UST004    filter
    
    Go To    ${LOG_PAGE_URL}
    Wait For Logs To Load
    
    # Get first IP address from logs (preparation)
    ${ip_address}=    Get IP Address From First Log
    
    # Clear any existing filters
    Click Button    ${BTN_CLEAR}
    
    # Input IP address
    Input Text    ${FILTER_IP_ADDRESS}    ${ip_address}
    
    # Apply filters
    Click Button    ${BTN_SEARCH}
    Wait For Logs To Load
    
    # Verify logs are filtered
    ${rows_count}=    Get Element Count    ${TABLE_LOGS}
    Should Be True    ${rows_count} >= 1    Logs should be displayed for existing IP address

TS-F04-TC06: Filter By Non-Existing IP Address
    [Documentation]    Filter logs by IP address that does not exist
    [Tags]    UST005    filter
    
    Go To    ${LOG_PAGE_URL}
    Wait For Logs To Load
    
    # Input non-existing IP address
    Input Text    ${FILTER_IP_ADDRESS}    123.0.0.1
    
    # Apply filters
    Click Button    ${BTN_SEARCH}
    Wait For Logs To Load
    
    # Verify no logs are displayed
    Page Should Contain Element    ${TABLE_NO_DATA}

TS-F04-TC07: Filter By SUCCESS Result
    [Documentation]    Filter logs by SUCCESS result status
    [Tags]    UST006    filter
    
    Go To    ${LOG_PAGE_URL}
    Wait For Logs To Load
    
    # Clear previous filters
    Click Button    ${BTN_CLEAR}
    
    # Select SUCCESS from result filter
    Select From List By Value    ${SELECT_RESULT}    SUCCESS
    
    # Apply filters
    Click Button    ${BTN_SEARCH}
    Wait For Logs To Load
    
    # Verify logs with SUCCESS status or no data message
    ${has_data}=    Run Keyword And Return Status    Page Should Not Contain Element    ${TABLE_NO_DATA}
    
    # If data exists, verify all have SUCCESS status
    Run Keyword If    ${has_data}    Verify All Logs Have Result Status    SUCCESS

TS-F04-TC08: Filter By DENIED Result
    [Documentation]    Filter logs by DENIED result status
    [Tags]    UST007    filter
    
    Go To    ${LOG_PAGE_URL}
    Wait For Logs To Load
    
    # Clear previous filters
    Click Button    ${BTN_CLEAR}
    
    # Select DENIED from result filter
    Select From List By Value    ${SELECT_RESULT}    DENIED
    
    # Apply filters
    Click Button    ${BTN_SEARCH}
    Wait For Logs To Load
    
    # Verify logs with DENIED status or no data message
    ${has_data}=    Run Keyword And Return Status    Page Should Not Contain Element    ${TABLE_NO_DATA}
    
    # If data exists, verify all have DENIED status
    Run Keyword If    ${has_data}    Verify All Logs Have Result Status    DENIED

TS-F04-TC09: Filter By ERROR Result
    [Documentation]    Filter logs by ERROR result status
    [Tags]    UST008    filter
    
    Go To    ${LOG_PAGE_URL}
    Wait For Logs To Load
    
    # Clear previous filters
    Click Button    ${BTN_CLEAR}
    
    # Select ERROR from result filter
    Select From List By Value    ${SELECT_RESULT}    ERROR
    
    # Apply filters
    Click Button    ${BTN_SEARCH}
    Wait For Logs To Load
    
    # Verify logs with ERROR status or no data message
    ${has_data}=    Run Keyword And Return Status    Page Should Not Contain Element    ${TABLE_NO_DATA}
    
    # If data exists, verify all have ERROR status
    Run Keyword If    ${has_data}    Verify All Logs Have Result Status    ERROR

TS-F04-TC10: Filter By Authentication Action Category
    [Documentation]    Filter logs by Authentication action category
    [Tags]    UST009    filter
    
    Go To    ${LOG_PAGE_URL}
    Wait For Logs To Load
    Clear Filters
    
    # Open action category modal
    Click Button    ${BTN_ACTION_FILTER}
    Wait Until Element Is Visible    ${MODAL_ACTION}    ${WAIT_TIME}
    
    # Select Authentication checkbox
    Select Action Category    Authentication
    
    # Apply action filter
    Click Button    ${BTN_USE_FILTER}
    Wait For Modal To Close    ${MODAL_ACTION}
    
    # Apply filters
    Click Button    ${BTN_SEARCH}
    Wait For Logs To Load
    
    # Verify logs are displayed
    Verify Logs Are Displayed Or No Data Message

TS-F04-TC11: Filter By User Management Action Category
    [Documentation]    Filter logs by User Management action category
    [Tags]    UST010    filter
    
    Go To    ${LOG_PAGE_URL}
    Wait For Logs To Load
    Clear Filters
    
    # Open action category modal
    Click Button    ${BTN_ACTION_FILTER}
    Wait Until Element Is Visible    ${MODAL_ACTION}    ${WAIT_TIME}
    
    # Select User Management checkbox
    Select Action Category    User Management
    
    # Apply action filter
    Click Button    ${BTN_USE_FILTER}
    Wait For Modal To Close    ${MODAL_ACTION}
    
    # Apply filters
    Click Button    ${BTN_SEARCH}
    Wait For Logs To Load
    
    # Verify logs are displayed
    Verify Logs Are Displayed Or No Data Message

TS-F04-TC12: Filter By Vehicle Management Action Category
    [Documentation]    Filter logs by Vehicle Management action category
    [Tags]    UST011    filter
    
    Go To    ${LOG_PAGE_URL}
    Wait For Logs To Load
    Clear Filters
    
    # Open action category modal
    Click Button    ${BTN_ACTION_FILTER}
    Wait Until Element Is Visible    ${MODAL_ACTION}    ${WAIT_TIME}
    
    # Select Vehicle Management checkbox
    Select Action Category    Vehicle Management
    
    # Apply action filter
    Click Button    ${BTN_USE_FILTER}
    Wait For Modal To Close    ${MODAL_ACTION}
    
    # Apply filters
    Click Button    ${BTN_SEARCH}
    Wait For Logs To Load
    
    # Verify logs are displayed
    Verify Logs Are Displayed Or No Data Message

TS-F04-TC13: Filter By Booking Action Category
    [Documentation]    Filter logs by Booking action category
    [Tags]    UST012    filter
    
    Go To    ${LOG_PAGE_URL}
    Wait For Logs To Load
    Clear Filters
    
    # Open action category modal
    Click Button    ${BTN_ACTION_FILTER}
    Wait Until Element Is Visible    ${MODAL_ACTION}    ${WAIT_TIME}
    
    # Select Booking checkbox
    Select Action Category    Booking
    
    # Apply action filter
    Click Button    ${BTN_USE_FILTER}
    Wait For Modal To Close    ${MODAL_ACTION}
    
    # Apply filters
    Click Button    ${BTN_SEARCH}
    Wait For Logs To Load
    
    # Verify logs are displayed
    Verify Logs Are Displayed Or No Data Message

TS-F04-TC14: Filter By Review Action Category
    [Documentation]    Filter logs by Review action category
    [Tags]    UST013    filter
    
    Go To    ${LOG_PAGE_URL}
    Wait For Logs To Load
    Clear Filters
    
    # Open action category modal
    Click Button    ${BTN_ACTION_FILTER}
    Wait Until Element Is Visible    ${MODAL_ACTION}    ${WAIT_TIME}
    
    # Select Review checkbox
    Select Action Category    Review
    
    # Apply action filter
    Click Button    ${BTN_USE_FILTER}
    Wait For Modal To Close    ${MODAL_ACTION}
    
    # Apply filters
    Click Button    ${BTN_SEARCH}
    Wait For Logs To Load
    
    # Verify logs are displayed
    Verify Logs Are Displayed Or No Data Message

TS-F04-TC15: Filter By Driver Verification Action Category
    [Documentation]    Filter logs by Driver Verification action category
    [Tags]    UST014    filter
    
    Go To    ${LOG_PAGE_URL}
    Wait For Logs To Load
    Clear Filters
    
    # Open action category modal
    Click Button    ${BTN_ACTION_FILTER}
    Wait Until Element Is Visible    ${MODAL_ACTION}    ${WAIT_TIME}
    
    # Select Driver Verification checkbox
    Select Action Category    Driver Verification
    
    # Apply action filter
    Click Button    ${BTN_USE_FILTER}
    Wait For Modal To Close    ${MODAL_ACTION}
    
    # Apply filters
    Click Button    ${BTN_SEARCH}
    Wait For Logs To Load
    
    # Verify logs are displayed
    Verify Logs Are Displayed Or No Data Message

TS-F04-TC16: Filter By Route Action Category
    [Documentation]    Filter logs by Route action category
    [Tags]    UST015    filter
    
    Go To    ${LOG_PAGE_URL}
    Wait For Logs To Load
    Clear Filters
    
    # Open action category modal
    Click Button    ${BTN_ACTION_FILTER}
    Wait Until Element Is Visible    ${MODAL_ACTION}    ${WAIT_TIME}
    
    # Select Route checkbox
    Select Action Category    Route
    
    # Apply action filter
    Click Button    ${BTN_USE_FILTER}
    Wait For Modal To Close    ${MODAL_ACTION}
    
    # Apply filters
    Click Button    ${BTN_SEARCH}
    Wait For Logs To Load
    
    # Verify logs are displayed
    Verify Logs Are Displayed Or No Data Message

TS-F04-TC17: Filter By Admin Actions Action Category
    [Documentation]    Filter logs by Admin Actions action category
    [Tags]    UST016    filter
    
    Go To    ${LOG_PAGE_URL}
    Wait For Logs To Load
    Clear Filters
    
    # Open action category modal
    Click Button    ${BTN_ACTION_FILTER}
    Wait Until Element Is Visible    ${MODAL_ACTION}    ${WAIT_TIME}
    
    # Select Admin Actions checkbox
    Select Action Category    Admin Actions
    
    # Apply action filter
    Click Button    ${BTN_USE_FILTER}
    Wait For Modal To Close    ${MODAL_ACTION}
    
    # Apply filters
    Click Button    ${BTN_SEARCH}
    Wait For Logs To Load
    
    # Verify logs are displayed
    Verify Logs Are Displayed Or No Data Message

TS-F04-TC18: Filter By System Action Category
    [Documentation]    Filter logs by System action category
    [Tags]    UST017    filter
    
    Go To    ${LOG_PAGE_URL}
    Wait For Logs To Load
    Clear Filters
    
    # Open action category modal
    Click Button    ${BTN_ACTION_FILTER}
    Wait Until Element Is Visible    ${MODAL_ACTION}    ${WAIT_TIME}
    
    # Select System checkbox
    Select Action Category    System
    
    # Apply action filter
    Click Button    ${BTN_USE_FILTER}
    Wait For Modal To Close    ${MODAL_ACTION}
    
    # Apply filters
    Click Button    ${BTN_SEARCH}
    Wait For Logs To Load
    
    # Verify logs are displayed
    Verify Logs Are Displayed Or No Data Message

TS-F04-TC19: Export Logs As CSV Format
    [Documentation]    Export logs as CSV file format with all filters empty
    [Tags]    UST018    export
    
    Go To    ${LOG_PAGE_URL}
    Wait For Logs To Load
    
    # Clear all filters to export all data
    Clear Filters
    
    # Click Export button
    Click Button    ${BTN_EXPORT}
    Wait Until Element Is Visible    ${EXPORT_MODAL}    ${WAIT_TIME}
    
    # Select CSV format
    Select From List By Value    ${SELECT_EXPORT_FORMAT}    csv
    
    # Confirm export
    Click Button    ${BTN_CONFIRM_EXPORT}
    
    # Wait for export to complete
    Wait For Export To Complete

TS-F04-TC20: Export Logs As JSON Format
    [Documentation]    Export logs as JSON file format with all filters empty
    [Tags]    UST019    export
    
    Go To    ${LOG_PAGE_URL}
    Wait For Logs To Load
    
    # Clear all filters to export all data
    Clear Filters
    
    # Click Export button
    Click Button    ${BTN_EXPORT}
    Wait Until Element Is Visible    ${EXPORT_MODAL}    ${WAIT_TIME}
    
    # Select JSON format
    Select From List By Value    ${SELECT_EXPORT_FORMAT}    json
    
    # Confirm export
    Click Button    ${BTN_CONFIRM_EXPORT}
    
    # Wait for export to complete
    Wait For Export To Complete
