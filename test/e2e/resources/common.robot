*** Settings ***
Library    Selenium2Library
Resource    variables.robot

*** Keywords ***
Open Slack In Browser And Login As User
    Open Browser    ${LOGIN URL}    ${BROWSER}
    Wait Until Element Is Visible    //input[@data-qa='login_email']
    Input Text    //input[@data-qa='login_email']    ${USER_EMAIL}
    Input Password    //input[@data-qa='login_password']    ${USER_PASSWORD}
    Click Element    //button[@data-qa='signin_button']
    Sleep    2s
    cancelPopup
    Go To    ${LOGIN URL}

Open Slack In Browser And Login As Guest
    Open Browser    ${LOGIN URL}    ${BROWSER}
    Wait Until Element Is Visible    //input[@data-qa='login_email']
    Input Text    //input[@data-qa='login_email']    ${GUEST_EMAIL}
    Input Password    //input[@data-qa='login_password']    ${GUEST_PASSWORD}
    Click Element    //button[@data-qa='signin_button']
    Sleep    2s
    cancelPopup
    Go To    ${LOGIN URL}

Close Test Browser
    Close All Browsers 

Go To Home Tab
    Wait Until Element Is Visible    //span[@data-qa='channel_sidebar_name_test-hybridilusmu']
    Scroll Element Into View    //span[@data-qa='channel_sidebar_name_test-hybridilusmu']
    Click Element    //span[@data-qa='channel_sidebar_name_test-hybridilusmu']
    Element Should Contain    //div[@data-qa='channel_name']    test-hybridilusmu