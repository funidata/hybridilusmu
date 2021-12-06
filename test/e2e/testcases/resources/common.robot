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

Go To Home Tab
    Wait Until Element Is Visible    ${app_home}
    Scroll Element Into View    ${app_home}
    Click Element    ${app_home}
    Element Should Contain    ${channel_name}    test-hybridilusmu

Go To Message Tab
    Wait Until Element Is Visible    ${messages_tab}
    Click Element    ${messages_tab}
    Wait Until Element Is Visible    ${message_input}

Send List Command With Weekend Date Shortcut
    [Arguments]    ${day}
    Input Text    ${message_input}    ${LIST_COMMAND} ${day}
    Click Element    ${send_message_button}
    Sleep    2s
    ${present}=    Run Keyword And Return Status    Element Should Be Visible   ${new_messages_button}
    Run Keyword If    ${present}    Click Element    ${new_messages_button}
    Sleep    1s
    Scroll Element Into View    ${latest_message}
    ${date}=    Get Date For Message Tab    ${day}
    Element Should Contain    ${latest_message}    Kukaan ei ole toimistolla ${date}

Regular Office Signup
    [Arguments]    ${date}
    Wait Until Element Is Visible    //div[@data-qa='block-kit-renderer']//div[contains(h3, '${date}')]/following-sibling::div[3]//button[@data-qa-action-id='office_click']
    Click Element    //div[@data-qa='block-kit-renderer']//div[contains(h3, '${date}')]/following-sibling::div[3]//button[@data-qa-action-id='office_click']

Regular Remote Signup
    [Arguments]    ${date}
    Wait Until Element Is Visible    //div[@data-qa='block-kit-renderer']//div[contains(h3, '${date}')]/following-sibling::div[3]//button[@data-qa-action-id='remote_click']
    Click Element    //div[@data-qa='block-kit-renderer']//div[contains(h3, '${date}')]/following-sibling::div[3]//button[@data-qa-action-id='remote_click']

Update Home Tab View
    Wait Until Element Is Visible    ${update_button}
    Click Element    ${update_button}
    ${date}=    Get Current Date For Home Tab Update
    Sleep    2s
    Wait Until Element Is Visible    //div[@data-qa='block-kit-renderer']//div[3]
    Element Should Contain    //div[@data-qa='block-kit-renderer']//div[3]    ${date}
    
