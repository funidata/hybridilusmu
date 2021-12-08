*** Settings ***
Documentation    Common keywords used across test suites
Library    SeleniumLibrary    implicit_wait=10s
Library    HelpFunc.py
Resource    variables.robot
Resource    elements.robot

*** Keywords ***
Open Slack In Browser And Login As User
    Open Browser    ${LOGIN URL}    ${BROWSER}
    Wait Until Element Is Visible    ${login_email}
    Input Text    ${login_email}    ${USER_EMAIL}
    Input Password    ${login_password}    ${USER_PASSWORD}
    Click Element    ${login_button}
    Sleep    2s
    cancelPopup
    Go To    ${LOGIN URL}

Open Slack In Browser And Login As Guest
    Open Browser    ${LOGIN URL}    ${BROWSER}
    Wait Until Element Is Visible    ${login_email}
    Input Text    ${login_email}    ${GUEST_EMAIL}
    Input Password    ${login_password}    ${GUEST_PASSWORD}
    Click Element    ${login_button}
    Sleep    2s
    cancelPopup
    Go To    ${LOGIN URL}

Close Test Browser
    Close All Browsers

Wait For Bot action
    Sleep    2s

Go To Home Tab
    Wait Until Element Is Visible    ${app_home}
    Scroll Element Into View    ${app_home}
    Click Element    ${app_home}
    Element Should Contain    ${channel_name}    test-hybridilusmu

Go To Message Tab
    Wait Until Element Is Visible    ${messages_tab}
    Click Element    ${messages_tab}
    Wait Until Element Is Visible    ${message_input}

    
