*** Settings ***
Library           SeleniumLibrary

*** Variables ***
${URL}            http://localhost:3001
${URI_Login}      /login

${IDENTIFIER}    test@gmail.com
${PASSWORD}    123456789
${DELAY}    0s

*** Keywords ***
Open Browser To Login Page
    Open Browser    ${URL}${URI_Login}    Chrome 
   
    Maximize Browser Window
    Sleep   0s   

Fill Login Form
    Wait Until Element Is Visible    id=identifier           timeout=10s
    Clear Element Text    id=identifier
    Input Text    id=identifier       ${IDENTIFIER}
    Sleep    0s

    Clear Element Text    id=password
    Input Text    id=password    ${PASSWORD}
    Sleep    0s
Submit Login
    Click Button    id=loginButton
    
    

Go To Profile Page
    Wait Until Element Is Visible    xpath=//div[contains(@class,'dropdown-trigger')]    timeout=10s
    Mouse Over    xpath=//div[contains(@class,'dropdown-trigger')]
    Wait Until Element Is Visible    id=profileDropdown    timeout=10s
    Click Element    id=profileDropdown
    Wait Until Location Contains     /profile    timeout=10s

Click Delete Account
    Wait Until Element Is Visible    id=deleteAccountButton    timeout=10s
    Click Element    id=deleteAccountButton

Accept Policy 
    Click Element    id=acceptPolicyCheckbox
    Sleep   10s
    Click Element    id=confirmDeleteButton

Input confirmed email
    Wait Until Element Is Visible    id=confirmEmailInput    timeout=10s
    Clear Element Text    id=confirmEmailInput
    Input Text    id=confirmEmailInput    ${IDENTIFIER}
    Sleep    10s
    Click Element    id=confirmEmailButton

Submit Successful Delete Account
    Click Element    id=closeButton
    Sleep    10s

Verify Account Deleted
    Wait Until Location Contains        ${URL}    timeout=15s
    Sleep    10s

*** Test Cases ***
Login And Delete Account
    Open Browser To Login Page
    Fill Login Form
    Submit Login

    Wait Until Location Does Not Contain    /login    timeout=10s

    Go To Profile Page
    Wait Until Location Contains    /profile    timeout=10s

    Click Delete Account
    Accept Policy 
    Input confirmed email
    Submit Successful Delete Account
    Verify Account Deleted
