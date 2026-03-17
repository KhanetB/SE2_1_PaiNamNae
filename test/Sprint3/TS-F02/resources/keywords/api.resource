*** Settings ***
Library         RequestsLibrary
Library         Collections
Resource        ../variables/test_data.robot

*** Keywords ***

# ================= API Authentication =================
Get User Token Via API
    [Documentation]    ล็อกอินผ่าน API และคืนค่า access token
    [Arguments]    ${username}    ${password}
    ${login_data}=    Create Dictionary    username=${username}    password=${password}
    ${response}=    POST On Session    api_session    /api/auth/login    json=${login_data}    expected_status=any
    Should Be Equal As Numbers    ${response.status_code}    200
    ${token}=    Set Variable    ${response.json()}[data][token]
    RETURN    ${token}

# ================= API Reviews =================
Get My Reviews Via API
    [Documentation]    ดึง GET /api/reviews/me เพื่อดึงรีวิวทั้งหมดของ user
    [Arguments]    ${access_token}
    ${headers}=    Create Dictionary    Authorization=Bearer ${access_token}
    ${response}=    GET On Session    api_session    /api/reviews/me    headers=${headers}    expected_status=any
    Should Be Equal As Numbers    ${response.status_code}    200
    ${reviews_list}=    Set Variable    ${response.json()}
    RETURN    ${reviews_list}

Get Review By Booking ID Via API
    [Documentation]    ดึง GET /api/reviews/booking/:bookingId
    [Arguments]    ${access_token}    ${booking_id}
    ${headers}=    Create Dictionary    Authorization=Bearer ${access_token}
    ${response}=    GET On Session    api_session    /api/reviews/booking/${booking_id}    headers=${headers}    expected_status=any
    RETURN    ${response}

Delete Review Via API
    [Documentation]    เรียก DELETE /api/reviews/:reviewId เพื่อลบรีวิว
    [Arguments]    ${access_token}    ${review_id}
    ${headers}=    Create Dictionary    Authorization=Bearer ${access_token}
    ${response}=    DELETE On Session    api_session    /api/reviews/${review_id}    headers=${headers}    expected_status=any
    RETURN    ${response}

# ================= API Setup =================
Setup API Session
    [Documentation]    สร้าง API session
    Create Session    api_session    ${BASE_API_URL}
