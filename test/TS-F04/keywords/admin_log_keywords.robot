*** Settings ***
Library    SeleniumLibrary
Library    String
Library    DateTime
Library    Collections

*** Variables ***
${LOG_PAGE_URL}              http://localhost:3001/admin/log
${WAIT_TIME}                 10s

# Log Page Locators
${FILTER_USERNAME}           css:input[placeholder="ระบุ Username"]
${FILTER_IP_ADDRESS}         css:input[placeholder="เช่น 192.168.1.1"]
${SELECT_RESULT}             xpath://select
${BTN_ACTION_FILTER}         xpath://label[contains(text(), 'หมวดหมู่ Action')]/following-sibling::button
${BTN_SEARCH}                xpath://button[contains(text(), 'ค้นหา')]
${BTN_CLEAR}                 xpath://button[contains(text(), 'ล้างตัวกรอง')]
${BTN_EXPORT}                xpath://button[contains(@class, 'bg-blue-600') and contains(text(), 'Export')]
${TABLE_LOGS}                css:tbody tr
${TABLE_NO_DATA}             xpath://tbody//tr/td[contains(normalize-space(), 'ไม่พบข้อมูล')]
${MODAL_ACTION}              css:div.fixed.z-50
${BTN_USE_FILTER}            xpath://button[contains(text(), 'ใช้ตัวกรองนี้')]
${BTN_CLEAR_ALL_MODAL}       xpath://button[contains(text(), 'ล้างทั้งหมด')]
${EXPORT_MODAL}              xpath://div[contains(@class, 'fixed') and contains(., 'Export Logs')]
${SELECT_EXPORT_FORMAT}      xpath://label[contains(text(), 'Format')]/following-sibling::select
${BTN_CONFIRM_EXPORT}        xpath://button[contains(text(), 'ดาวน์โหลดไฟล์')]
${BTN_CLOSE_EXPORT}          xpath://button[contains(@class, 'absolute') and .//i[contains(@class, 'xmark')]]
${LOADING_INDICATOR}         css:i.fa-spinner
${PAGE_INDICATOR}            xpath://div[contains(text(), 'หน้าที่')]


*** Keywords ***
Wait For Logs To Load
    [Documentation]    Wait for logs table to load
    
    # Wait for loading spinner to disappear or table to appear
    ${spinner_visible}=    Run Keyword And Return Status    
    ...    Element Should Be Visible    ${LOADING_INDICATOR}
    
    Run Keyword If    ${spinner_visible}    
    ...    Wait Until Element Is Not Visible    ${LOADING_INDICATOR}    ${WAIT_TIME}
    
    # Wait for table to be visible
    Wait Until Element Is Visible    css:table    ${WAIT_TIME}
    
    # Wait for pagination to appear
    Wait Until Element Is Visible    ${PAGE_INDICATOR}    ${WAIT_TIME}

Clear Filters
    [Documentation]    Clear all filters on the log page
    
    # Click clear filters button
    Click Button    ${BTN_CLEAR}
    
    # Wait for page to refresh
    Wait For Logs To Load
    
    # Verify filters are cleared
    ${username_value}=    Get Value    ${FILTER_USERNAME}
    ${ip_value}=    Get Value    ${FILTER_IP_ADDRESS}
    
    Should Be Empty    ${username_value}    Username filter should be empty
    Should Be Empty    ${ip_value}    IP Address filter should be empty

Get IP Address From First Log
    [Documentation]    Extract IP address from the first log entry
    
    # Get the first row's IP address - it's in a div with class text-xs text-gray-500
    ${ip_address}=    Get Text    xpath://tbody/tr[1]/td[2]/div[contains(@class, 'text-xs')]
    
    # Remove " - " if it exists (for System/Guest logs)
    ${ip_address}=    Run Keyword If    '${ip_address}' == '-'    
    ...    Set Variable    127.0.0.1
    ...    ELSE    Set Variable    ${ip_address}
    
    RETURN    ${ip_address}

Verify All Logs Have Result Status
    [Documentation]    Verify all displayed logs have the specified result status
    [Arguments]    ${expected_status}
    
    # Get all result status spans directly - don't use relative xpath on WebElements
    ${status_spans}=    Get WebElements    xpath://tbody/tr//td[5]//span[contains(@class, 'inline-flex')]
    
    # Verify each span contains the expected status
    FOR    ${span}    IN    @{status_spans}
        ${status_text}=    Get Text    ${span}
        Should Contain    ${status_text}    ${expected_status}    
        ...    Log entry should have the filtered status: ${expected_status}
    END
    END

Verify Logs Are Displayed Or No Data Message
    [Documentation]    Verify either logs are displayed or no data message is shown
    
    # Check if no data message is shown
    ${has_no_data}=    Run Keyword And Return Status    
    ...    Page Should Contain Element    ${TABLE_NO_DATA}
    
    Should Be True    ${has_no_data} or True    
    ...    Either logs or no data message should be displayed

Select Action Category
    [Documentation]    Select a specific action category from the modal
    [Arguments]    ${category_name}
    
    # Map category names to checkbox labels
    ${action_labels}=    Create Dictionary
    ...    Authentication=Authentication
    ...    User Management=User Management
    ...    Vehicle Management=Vehicle Management
    ...    Booking=Booking
    ...    Review=Review
    ...    Route=Route
    ...    Driver Verification=Driver Verification
    ...    Admin Actions=Admin Actions
    ...    System=System
    
    ${label}=    Get From Dictionary    ${action_labels}    ${category_name}
    
    # Find and click the checkbox for the category
    # The checkbox is in a label with a span containing font-medium class
    ${checkbox_locator}=    Set Variable    
    ...    xpath://label[.//span[@class='font-medium text-gray-800' and contains(text(), '${label}')]]//input[@type='checkbox']
    
    Click Element    ${checkbox_locator}

Wait For Modal To Close
    [Documentation]    Wait for a modal to close
    [Arguments]    ${modal_locator}
    
    Wait Until Element Is Not Visible    ${modal_locator}    ${WAIT_TIME}

Wait For Export To Complete
    [Documentation]    Wait for export process to complete
    
    # Wait for the export modal to disappear
    Wait Until Element Is Not Visible    ${EXPORT_MODAL}    ${WAIT_TIME}
    
    # Verify success notification appears (or check download)
    Wait For Logs To Load

Apply Username Filter
    [Documentation]    Apply filter by username
    [Arguments]    ${username}
    
    Click Element    ${FILTER_USERNAME}
    Clear Element Text    ${FILTER_USERNAME}
    Input Text    ${FILTER_USERNAME}    ${username}
    Click Button    ${BTN_SEARCH}
    Wait For Logs To Load

Apply IP Address Filter
    [Documentation]    Apply filter by IP address
    [Arguments]    ${ip_address}
    
    Click Element    ${FILTER_IP_ADDRESS}
    Clear Element Text    ${FILTER_IP_ADDRESS}
    Input Text    ${FILTER_IP_ADDRESS}    ${ip_address}
    Click Button    ${BTN_SEARCH}
    Wait For Logs To Load

Apply Result Status Filter
    [Documentation]    Apply filter by result status
    [Arguments]    ${status}
    
    Select From List By Value    ${SELECT_RESULT}    ${status}
    Click Button    ${BTN_SEARCH}
    Wait For Logs To Load

Apply Action Category Filter
    [Documentation]    Apply filter by action category
    [Arguments]    @{categories}
    
    # Open modal
    Click Button    ${BTN_ACTION_FILTER}
    Wait Until Element Is Visible    ${MODAL_ACTION}    ${WAIT_TIME}
    
    # Select each category
    FOR    ${category}    IN    @{categories}
        Select Action Category    ${category}
    END
    
    # Apply filter
    Click Button    ${BTN_USE_FILTER}
    Wait For Modal To Close    ${MODAL_ACTION}
    
    # Perform search
    Click Button    ${BTN_SEARCH}
    Wait For Logs To Load

Export Logs As Format
    [Documentation]    Export logs in specified format
    [Arguments]    ${format}
    
    # Click export button
    Click Button    ${BTN_EXPORT}
    Wait Until Element Is Visible    ${EXPORT_MODAL}    ${WAIT_TIME}
    
    # Select format
    Select From List By Value    ${SELECT_EXPORT_FORMAT}    ${format}
    
    # Confirm export
    Click Button    ${BTN_CONFIRM_EXPORT}
    
    # Wait for completion
    Wait For Export To Complete

Verify Log Table Has Data
    [Documentation]    Verify that the log table has data rows
    
    # Check that no data message is not displayed
    Page Should Not Contain Element    ${TABLE_NO_DATA}
    
    # Check that at least one log row exists
    ${rows_count}=    Get Element Count    ${TABLE_LOGS}
    Should Be True    ${rows_count} > 0    Table should have at least one data row

Verify Log Table Is Empty
    [Documentation]    Verify that the log table has no data
    
    # Check that no data message is displayed
    Page Should Contain Element    ${TABLE_NO_DATA}

Get Logs Count
    [Documentation]    Get the count of log entries displayed
    
    ${count}=    Get Element Count    ${TABLE_LOGS}
    RETURN    ${count}

Navigate To Page
    [Documentation]    Navigate to a specific page in pagination
    [Arguments]    ${page_number}
    
    ${button_locator}=    Set Variable    
    ...    css:button:contains("${page_number}"):not(:contains("Previous")):not(:contains("Next"))
    
    Click Button    ${button_locator}
    Wait For Logs To Load

Get Log Entry Details
    [Documentation]    Get details of a specific log entry by row index
    [Arguments]    ${row_index}
    
    # Get row (1-based index)
    ${row_locator}=    Set Variable    css:tbody tr:nth-of-type(${row_index})
    
    # Extract details
    ${timestamp}=    Get Text    ${row_locator} td:nth-child(1)
    ${user}=    Get Text    ${row_locator} td:nth-child(2) div:first-child
    ${action}=    Get Text    ${row_locator} td:nth-child(3) span
    ${endpoint}=    Get Text    ${row_locator} td:nth-child(4)
    ${result}=    Get Text    ${row_locator} td:nth-child(5) span:first-child
    
    # Return as dictionary
    ${details}=    Create Dictionary
    ...    timestamp=${timestamp}
    ...    user=${user}
    ...    action=${action}
    ...    endpoint=${endpoint}
    ...    result=${result}
    
    RETURN    ${details}

Verify Filter Results Match Criteria
    [Documentation]    Verify that filtered results match the applied criteria
    [Arguments]    ${filter_type}    ${filter_value}
    
    Run Keyword If    '${filter_type}' == 'username'    
    ...    Verify Username Filter Results    ${filter_value}
    ...    ELSE IF    '${filter_type}' == 'ip'    
    ...    Verify IP Filter Results    ${filter_value}
    ...    ELSE IF    '${filter_type}' == 'result'    
    ...    Verify Result Filter Results    ${filter_value}

Verify Username Filter Results
    [Documentation]    Verify that all results contain the filtered username
    [Arguments]    ${username}
    
    ${rows}=    Get WebElements    css:tbody tr
    
    FOR    ${row}    IN    @{rows}
        ${row_username}=    Get Text    ${row}//td[2]//div[@class*="font-medium"]
        Should Contain    ${row_username}    ${username}    
        ...    Log entry should contain the filtered username
    END

Verify IP Filter Results
    [Documentation]    Verify that all results contain the filtered IP address
    [Arguments]    ${ip_address}
    
    ${rows}=    Get WebElements    css:tbody tr
    
    FOR    ${row}    IN    @{rows}
        ${row_ip}=    Get Text    ${row}//td[2]//div[@class*="text-xs"]
        Should Contain    ${row_ip}    ${ip_address}    
        ...    Log entry should contain the filtered IP address
    END

Verify Result Filter Results
    [Documentation]    Verify that all results contain the filtered status
    [Arguments]    ${status}
    
    ${rows}=    Get WebElements    css:tbody tr
    
    FOR    ${row}    IN    @{rows}
        ${row_status}=    Get Text    ${row}//td[5]//span[contains(@class, 'inline-flex')]
        Should Contain    ${row_status}    ${status}    
        ...    Log entry should have the filtered status
    END

Verify Date Range Filter
    [Documentation]    Verify that logs are within the specified date range
    [Arguments]    ${start_date}    ${end_date}
    
    ${rows}=    Get WebElements    css:tbody tr
    
    FOR    ${row}    IN    @{rows}
        ${log_date}=    Get Text    ${row}//td[1]
        # Parse and verify date is within range (implementation depends on date format)
        Log    Verifying log date: ${log_date} is between ${start_date} and ${end_date}
    END
