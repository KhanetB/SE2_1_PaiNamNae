*** Settings ***
Library    SeleniumLibrary
Library    String
Library    sys
Library    selenium.webdriver

*** Variables ***
${BASE_URL}              http://localhost:3001
${LOGIN_PAGE_URL}        ${BASE_URL}/login
${ADMIN_USERNAME}        admin123
${ADMIN_PASSWORD}        123456789
${BROWSER}               chrome
${WAIT_TIME}             10s

# Login Page Locators (Updated based on actual HTML structure)
${INPUT_IDENTIFIER}      css:input#identifier
${INPUT_PASSWORD}        css:input#password
${BTN_LOGIN}             css:button#loginButton


*** Keywords ***
Open Browser And Login As Admin
    [Documentation]    Open browser with Chrome options in guest mode to avoid password change dialog
    
    Log    Configuring Chrome options (Guest mode)    INFO
    ${chrome_options}=    Evaluate    sys.modules['selenium.webdriver'].ChromeOptions()    sys, selenium.webdriver
    ${prefs}=             Create Dictionary    
    ...    credentials_enable_service=${False}    
    ...    profile.password_manager_enabled=${False}
    Call Method    ${chrome_options}    add_experimental_option    prefs    ${prefs}
    
    # Run Chrome in guest mode to prevent password change dialog
    Call Method    ${chrome_options}    add_argument    guest
    
    # Add Chrome switches to disable various popups and features
    Call Method    ${chrome_options}    add_argument    disable-popup-blocking
    Call Method    ${chrome_options}    add_argument    no-default-browser-check
    Call Method    ${chrome_options}    add_argument    disable-translate
    
    Log    Opening browser at ${LOGIN_PAGE_URL}    INFO
    Create WebDriver    Chrome    options=${chrome_options}
    Go To    ${LOGIN_PAGE_URL}
    Maximize Browser Window
    
    # Wait for page to load with timeout
    Log    Waiting for login page to load    INFO
    Wait Until Page Contains    เข้าสู่ระบบ    ${WAIT_TIME}
    
    # Wait for identifier input field
    Log    Waiting for identifier input field    INFO
    Wait Until Element Is Visible    ${INPUT_IDENTIFIER}    ${WAIT_TIME}
    
    # Wait for password input field  
    Log    Waiting for password input field    INFO
    Wait Until Element Is Visible    ${INPUT_PASSWORD}    ${WAIT_TIME}
    
    # Enter credentials
    Log    Entering credentials    INFO
    Input Text    ${INPUT_IDENTIFIER}    ${ADMIN_USERNAME}
    Input Text    ${INPUT_PASSWORD}    ${ADMIN_PASSWORD}
    
    # Click login button
    Log    Clicking login button    INFO
    Click Button    ${BTN_LOGIN}
    
    # Wait for redirect to home page (system redirects to / after login)
    Log    Waiting for home page after login    INFO
    Wait Until Location Contains    /    ${WAIT_TIME}
    
    # Small delay to ensure session is established
    Sleep    1s

Close All Browser Windows
    [Documentation]    Capture screenshot and close all browser windows
    
    Run Keyword And Ignore Error    Capture Page Screenshot
    SeleniumLibrary.Close All Browsers
