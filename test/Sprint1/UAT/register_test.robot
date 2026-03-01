*** Settings ***
Library    SeleniumLibrary

*** Variables ***
${BROWSER}        Chrome
${URL}            http://localhost:3001
${URI_Register}   /register
${DELAY}          3s

${EMAIL}          test@gmail.com
${USERNAME}       testUser
${PASSWORD}       123456789
${FIRSTNAME}      Test
${LASTNAME}       User
${PHONE}          0812345678
${GENDER}         male
${NATIONALID}     9351407024077
${EXPIRY}         31/12/2030

${IDCARD_PATH}    /Users/simon/Documents/GitHub/SE2_1_PaiNamNae/test/idcard.jpeg    
${SELFIE_PATH}    /Users/simon/Documents/GitHub/SE2_1_PaiNamNae/test/selfie.jpg


*** Keywords ***
Open Browser To Resource Page
    Open Browser    ${URL}${URI_Register}    ${BROWSER}
    Maximize Browser Window
    Sleep    ${DELAY}

Fill Step 1 - Account Info
    Wait Until Element Is Visible    id=username    timeout=10s
    Input Text    id=username    ${USERNAME}
    Input Text    id=email       ${EMAIL}
    Input Text    id=password    ${PASSWORD}
    Input Text    id=confirmPassword    ${PASSWORD}
    Click Button    id=nextStep1

Fill Step 2 - Personal Info
    Wait Until Element Is Visible    id=firstName    timeout=10s
    Input Text    id=firstName    ${FIRSTNAME}
    Input Text    id=lastName     ${LASTNAME}
    Input Text    id=phoneNumber  ${PHONE}
    Click Element    xpath=//input[@name='gender' and @value='${GENDER}']
    Click Button    id=nextStep2

Fill Step 3 - Verification
    Wait Until Element Is Visible    id=idNumber    timeout=10s
    Choose File    id=idCardFile    ${IDCARD_PATH}

    Input Text     id=idNumber      ${NATIONALID}
    Input Text     id=expiryDate    ${EXPIRY}
    Choose File    id=selfieFile    ${SELFIE_PATH}
    Click Element  xpath=//input[@type='checkbox']
    
Submit Register
    Click Button    id=Prove

Verify Register Success
    Wait Until Location Contains    localhost:3001   timeout=15s


*** Test Cases ***
Register Account Success
    Open Browser To Resource Page
    Fill Step 1 - Account Info
    Fill Step 2 - Personal Info
    Fill Step 3 - Verification
    Submit Register
    Verify Register Success
    Close Browser