*** Settings ***
Library    SeleniumLibrary
Library    OperatingSystem

*** Variables ***
${BROWSER}        Chrome
${URL}    https://csse1669.cpkku.com
${IMAGE}    ${CURDIR}/picfortest.jpg
${URI_Login}      /login
${IDENTIFIER}    pasit01
${PASSWORD}    12345678

*** Keywords ***
Open Browser To Login Page
    Open Browser    ${URL}${URI_Login}    ${BROWSER}
    Maximize Browser Window
Fill Login Form
    Wait Until Element Is Visible    id=identifier           timeout=5s
    Clear Element Text    id=identifier
    Input Text    id=identifier       ${IDENTIFIER}
    Clear Element Text    id=password
    Input Text    id=password    ${PASSWORD}
Submit Login
    Click Button    xpath=//button[contains(.,'เข้าสู่ระบบ')]
Verify Login Success
    Wait Until Location Contains    ${URL}    timeout=5s
Set Rating
    [Arguments]    ${rating}

    ${rating}=    Convert To Number    ${rating}
    Return From Keyword If    ${rating} == 0

    ${full}=    Evaluate    int(${rating})
    ${half}=    Evaluate    1 if (${rating} - int(${rating}) == 0.5) else 0
    ${star_index}=    Evaluate    ${full} + (${half} if ${half} else 0)

    Wait Until Element Is Visible
    ...    xpath=//div[contains(@class,'text-3xl') and contains(@class,'cursor-pointer')]

    Execute JavaScript
    ...    const stars = document.querySelectorAll("div.text-3xl.cursor-pointer span.relative");
    ...    const el = stars[${star_index} - 1];
    ...    const rect = el.getBoundingClientRect();
    ...    const x = rect.left + (${half} === 1 ? rect.width * 0.25 : rect.width * 0.75);
    ...    const y = rect.top + rect.height / 2;
    ...    const evt = new MouseEvent('click', { clientX: x, clientY: y, bubbles: true });
    ...    el.dispatchEvent(evt);

*** Test Cases ***
TC01_Create Review Successfully
    [Documentation]    Navigate to My Trips, open review modal, set 3.5 stars, add labels, text, image and save.
    Open Browser To Login Page
    Fill Login Form
    Submit Login
    Verify Login Success
    Wait Until Page Contains Element    xpath=//a[contains(.,'การเดินทางของฉัน')]
    Click Element    xpath=//a[contains(.,'การเดินทางของฉัน')] 
    Wait Until Page Contains Element    xpath=//h3[contains(.,'รายการการเดินทาง')]
    Click Button    xpath=//button[contains(.,'ทั้งหมด')]
    Wait Until Page Contains Element    xpath=//button[contains(.,'เขียนรีวิว')]
    Click Element    xpath=//button[contains(.,'เขียนรีวิว')]
    Set Rating    3.5
    # Select labels (tags) by visible text; adjust if your UI uses different elements
    Click Button    xpath=//Button[contains(.,'ขับขี่ปลอดภัย')]
    Click Button    xpath=//Button[contains(.,'รถสะอาดน่านั่ง')]
    Click Button    xpath=//Button[contains(.,'คนขับอัธยาศัยดี')]
    Click Button    xpath=//Button[contains(.,'ชอบเพลงที่เปิด')]

    # Enter review text
    Wait Until Element Is Visible    xpath=//textarea[@placeholder='เขียนรีวิวที่นี่']
    Input Text    xpath=//textarea[@placeholder='เขียนรีวิวที่นี่']    ขับดีมากครับพี่ รถพี่สุดยอด

    # Attach image (ensure ${IMAGE} exists locally)
    Choose File    xpath=//input[@type='file' and @accept='image/*']    ${IMAGE}

    Scroll Element Into View    xpath=//button[contains(.,'ส่งรีวิว')]
    Click Button                xpath=//button[contains(.,'ส่งรีวิว')]

    # Basic verification (adjust to app's success message)
    Wait Until Page Contains    แก้ไข    timeout=15s

    Click Button    xpath=//Button[contains(.,'ลบ')]    
    Wait Until Page Contains    ยืนยันการลบรีวิว
    Wait Until Element Is Visible
    ...    xpath=//div[contains(@class,'modal')]//button[normalize-space()='ลบรีวิว']

    Click Button
    ...    xpath=//div[contains(@class,'modal')]//button[normalize-space()='ลบรีวิว']
    Wait Until Page Contains  เขียนรีวิว
    Close Browser

TC02_Create Review Without Star
    [Documentation]    US2: ไม่เลือกดาว - พยายามส่งรีวิวโดยไม่ให้คะแนนดาว
    Open Browser To Login Page
    Fill Login Form
    Submit Login
    Verify Login Success
    Wait Until Page Contains Element    xpath=//a[contains(.,'การเดินทางของฉัน')]    timeout=10s
    Click Element    xpath=//a[contains(.,'การเดินทางของฉัน')] 
    Wait Until Page Contains Element    xpath=//h3[contains(.,'รายการการเดินทาง')]    timeout=10s    
    Click Button    xpath=//button[contains(.,'ทั้งหมด') or contains(.,'ตกลง')]
    Wait Until Page Contains Element    xpath=//button[contains(.,'เขียนรีวิว')]     timeout=10s
    Click Element    xpath=//button[contains(.,'เขียนรีวิว') or contains(.,'เขียน รีวิว')]
    # Select labels (tags) by visible text; adjust if your UI uses different elements
    Click Button    xpath=//Button[contains(.,'ขับขี่ปลอดภัย')]
    Click Button    xpath=//Button[contains(.,'รถสะอาดน่านั่ง')]
    Click Button    xpath=//Button[contains(.,'คนขับอัธยาศัยดี')]
    Click Button    xpath=//Button[contains(.,'ชอบเพลงที่เปิด')]

    # Enter review text
    Wait Until Element Is Visible    xpath=//textarea[@placeholder='เขียนรีวิวที่นี่']
    Input Text    xpath=//textarea[@placeholder='เขียนรีวิวที่นี่']    ขับดีมากครับพี่ รถพี่สุดยอด

    # Attach image (ensure ${IMAGE} exists locally)
    Choose File    xpath=//input[@type='file' and @accept='image/*']    ${IMAGE}

    Scroll Element Into View    xpath=//button[contains(.,'ส่งรีวิว')]
    Click Button                xpath=//button[contains(.,'ส่งรีวิว')]
    Page Should Contain    คุณยังไม่ได้เลือกดาว

TC03_Create Review Star5 No Label With Text And Image
    [Documentation]    Star=5, Label=null, Text มี, Pic มี -> บันทึกสำเร็จและ redirect
    Open Browser To Login Page
    Fill Login Form
    Submit Login
    Verify Login Success
    Wait Until Page Contains Element    xpath=//a[contains(.,'การเดินทางของฉัน')]    timeout=10s
    Click Element    xpath=//a[contains(.,'การเดินทางของฉัน')] 
    Wait Until Page Contains Element    xpath=//h3[contains(.,'รายการการเดินทาง')]    timeout=10s    
    Click Button    xpath=//button[contains(.,'ทั้งหมด') or contains(.,'ตกลง')]
    Wait Until Page Contains Element    xpath=//button[contains(.,'เขียนรีวิว')]    timeout=10s
    Click Element    xpath=//button[contains(.,'เขียนรีวิว') or contains(.,'เขียน รีวิว')]
    Set Rating    3.5

    # Enter review text
    Wait Until Element Is Visible    xpath=//textarea[@placeholder='เขียนรีวิวที่นี่']
    Input Text    xpath=//textarea[@placeholder='เขียนรีวิวที่นี่']    ขับดีมากครับพี่ รถพี่สุดยอด

    # Attach image (ensure ${IMAGE} exists locally)
    Choose File    xpath=//input[@type='file' and @accept='image/*']    ${IMAGE}

    Scroll Element Into View    xpath=//button[contains(.,'ส่งรีวิว')]
    Click Button                xpath=//button[contains(.,'ส่งรีวิว')]
    Wait Until Page Contains    แก้ไข    timeout=15s

    Click Button    xpath=//Button[contains(.,'ลบ')]    
    Wait Until Page Contains    ยืนยันการลบรีวิว
    Wait Until Element Is Visible
    ...    xpath=//div[contains(@class,'modal')]//button[normalize-space()='ลบรีวิว']

    Click Button
    ...    xpath=//div[contains(@class,'modal')]//button[normalize-space()='ลบรีวิว']
    Wait Until Page Contains  เขียนรีวิว
    Close Browser

TC04_Create Review Without Comment
    [Documentation]   Star=5, Label มี, Text null, Pic มี -> พยายามบันทึกโดยไม่ใส่ข้อความ
    Open Browser To Login Page
    Fill Login Form
    Submit Login
    Verify Login Success
    Wait Until Page Contains Element    xpath=//a[contains(.,'การเดินทางของฉัน')]
    Click Element    xpath=//a[contains(.,'การเดินทางของฉัน')] 
    Wait Until Page Contains Element    xpath=//h3[contains(.,'รายการการเดินทาง')]
    Click Button    xpath=//button[contains(.,'ทั้งหมด') or contains(.,'ตกลง')]
    Wait Until Page Contains Element    xpath=//button[contains(.,'เขียนรีวิว')]
    Click Element    xpath=//button[contains(.,'เขียนรีวิว') or contains(.,'เขียน รีวิว')]
    Set Rating    3.5
    # Select labels (tags) by visible text; adjust if your UI uses different elements
    Click Button    xpath=//Button[contains(.,'ขับขี่ปลอดภัย')]
    Click Button    xpath=//Button[contains(.,'รถสะอาดน่านั่ง')]
    Click Button    xpath=//Button[contains(.,'คนขับอัธยาศัยดี')]
    Click Button    xpath=//Button[contains(.,'ชอบเพลงที่เปิด')]

    # Enter review text
    Wait Until Element Is Visible    xpath=//textarea[@placeholder='เขียนรีวิวที่นี่']

    # Attach image (ensure ${IMAGE} exists locally)
    Choose File    xpath=//input[@type='file' and @accept='image/*']    ${IMAGE}

    Scroll Element Into View    xpath=//button[contains(.,'ส่งรีวิว')]
    Click Button                xpath=//button[contains(.,'ส่งรีวิว')]

    # Basic verification (adjust to app's success message)
    Wait Until Page Contains    แก้ไข    timeout=15s
    Click Button    xpath=//Button[contains(.,'ลบ')]    
    Wait Until Page Contains    ยืนยันการลบรีวิว
    Wait Until Element Is Visible
    ...    xpath=//div[contains(@class,'modal')]//button[normalize-space()='ลบรีวิว']

    Click Button
    ...    xpath=//div[contains(@class,'modal')]//button[normalize-space()='ลบรีวิว']
    Wait Until Page Contains  เขียนรีวิว
    Close Browser

TC05_Create Review Without Image
    [Documentation]   ไม่แนบรูป Star=5, Label มี, Text มี, Pic null -> บันทึกสำเร็จและ redirect
    Open Browser To Login Page
    Fill Login Form
    Submit Login
    Verify Login Success
    Wait Until Page Contains Element    xpath=//a[contains(.,'การเดินทางของฉัน')]
    Click Element    xpath=//a[contains(.,'การเดินทางของฉัน')] 
    Wait Until Page Contains Element    xpath=//h3[contains(.,'รายการการเดินทาง')]
    Click Button    xpath=//button[contains(.,'ทั้งหมด') or contains(.,'ตกลง')]
    Wait Until Page Contains Element    xpath=//button[contains(.,'เขียนรีวิว')]
    Click Element    xpath=//button[contains(.,'เขียนรีวิว') or contains(.,'เขียน รีวิว')]
    Set Rating    3.5
    # Select labels (tags) by visible text; adjust if your UI uses different elements
    Click Button    xpath=//Button[contains(.,'ขับขี่ปลอดภัย')]
    Click Button    xpath=//Button[contains(.,'รถสะอาดน่านั่ง')]
    Click Button    xpath=//Button[contains(.,'คนขับอัธยาศัยดี')]
    Click Button    xpath=//Button[contains(.,'ชอบเพลงที่เปิด')]

    # Enter review text    
    Wait Until Element Is Visible    xpath=//textarea[@placeholder='เขียนรีวิวที่นี่']

    # Attach image (ensure ${IMAGE} exists locally)
    Choose File    xpath=//input[@type='file' and @accept='image/*']    ${IMAGE}

    Scroll Element Into View    xpath=//button[contains(.,'ส่งรีวิว')]
    Click Button                xpath=//button[contains(.,'ส่งรีวิว')]

    # Basic verification (adjust to app's success message)
    Wait Until Page Contains    แก้ไข    timeout=15s
    Click Button    xpath=//Button[contains(.,'ลบ')]    
    Wait Until Page Contains    ยืนยันการลบรีวิว
    Wait Until Element Is Visible
    ...    xpath=//div[contains(@class,'modal')]//button[normalize-space()='ลบรีวิว']

    Click Button
    ...    xpath=//div[contains(@class,'modal')]//button[normalize-space()='ลบรีวิว']
    Wait Until Page Contains  เขียนรีวิว
    Close Browser

TC06_Edit Review
    [Documentation]   ไม่แนบรูป Star=5, Label มี, Text มี, Pic null -> บันทึกสำเร็จและ redirect
    Open Browser To Login Page
    Fill Login Form
    Submit Login
    Verify Login Success
    Wait Until Page Contains Element    xpath=//a[contains(.,'การเดินทางของฉัน')]
    Click Element    xpath=//a[contains(.,'การเดินทางของฉัน')] 
    Wait Until Page Contains Element    xpath=//h3[contains(.,'รายการการเดินทาง')]
    Click Button    xpath=//button[contains(.,'ทั้งหมด') or contains(.,'ตกลง')]
    Wait Until Page Contains Element    xpath=//button[contains(.,'เขียนรีวิว')]
    Click Element    xpath=//button[contains(.,'เขียนรีวิว') or contains(.,'เขียน รีวิว')]
    Set Rating    3.5
    # Select labels (tags) by visible text; adjust if your UI uses different elements
    Click Button    xpath=//Button[contains(.,'ขับขี่ปลอดภัย')]
    Click Button    xpath=//Button[contains(.,'รถสะอาดน่านั่ง')]
    # Enter review text    
    Wait Until Element Is Visible    xpath=//textarea[@placeholder='เขียนรีวิวที่นี่']

    # Attach image (ensure ${IMAGE} exists locally)
    Choose File    xpath=//input[@type='file' and @accept='image/*']    ${IMAGE}

    Scroll Element Into View    xpath=//button[contains(.,'ส่งรีวิว')]
    Click Button                xpath=//button[contains(.,'ส่งรีวิว')]

    # Basic verification (adjust to app's success message)
    Wait Until Page Contains    แก้ไข    timeout=15s
    Click Element    xpath=//button[contains(.,'แก้ไขรีวิว')]
    Set Rating    5
    Click Button    xpath=//Button[contains(.,'ขับขี่ปลอดภัย')]
    Click Button    xpath=//Button[contains(.,'รถสะอาดน่านั่ง')]
    Click Button    xpath=//Button[contains(.,'คนขับอัธยาศัยดี')]
    Click Button    xpath=//Button[contains(.,'ชอบเพลงที่เปิด')]
    Input Text    xpath=//textarea[@placeholder='เขียนรีวิวที่นี่']    ขับดีมากครับพี่ รถพี่สุดยอด เบาะนุ่ม เพลงเริศ
    Choose File    xpath=//input[@type='file' and @accept='image/*']    ${IMAGE}

    Scroll Element Into View    xpath=//button[contains(.,'ส่งรีวิว')]
    Click Button                xpath=//button[contains(.,'ส่งรีวิว')]
    Wait Until Page Contains    แก้ไขรีวิวสำเร็จ    timeout=15s
    Wait Until Page Contains    ลบรีวิว    timeout=15s
    Click Button    xpath=//Button[contains(.,'ลบรีวิว')]    
    Wait Until Page Contains    ยืนยันการลบรีวิว
    Wait Until Element Is Visible
    ...    xpath=//div[contains(@class,'modal')]//button[normalize-space()='ลบรีวิว']

    Click Button
    ...    xpath=//div[contains(@class,'modal')]//button[normalize-space()='ลบรีวิว']
    Wait Until Page Contains  เขียนรีวิว
    Close Browser
