*** Settings ***
Library           SeleniumLibrary

*** Variables ***
${BROWSER}        Chrome
${URL}            http://localhost:3001
${URI_Login}      /login

${IDENTIFIER}    test@gmail.com
${PASSWORD}    123456789

*** Keywords ***
Open Browser To Login Page
    Open Browser    ${URL}${URI_Login}    ${BROWSER}
    Maximize Browser Window
    Sleep    3s

Fill Login Form
    Wait Until Element Is Visible    id=identifier           timeout=10s
    Clear Element Text    id=identifier
    Input Text    id=identifier       ${IDENTIFIER}
    Sleep    2s

    Clear Element Text    id=password
    Input Text    id=password    ${PASSWORD}
    Sleep    2s

Submit Login
    Click Button    id=loginButton

Verify Login Success
    Wait Until Location Contains    ${URL}    timeout=15s

*** Test Cases ***
Login Account
    Open Browser To Login Page
    Fill Login Form
    Submit Login
    Verify Login Success
    Close Browser