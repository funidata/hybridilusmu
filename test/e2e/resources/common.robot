*** Settings ***
Library    Selenium2Library
Library    HelpFunc.py
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

Go To Message Tab
    Wait Until Element Is Visible    //button[@data-qa='messages']
    Click Element    //button[@data-qa='messages']
    Wait Until Element Is Visible    //div[@data-qa='message_input']/div

Send List Command With Weekend Date Shortcut
    [Arguments]    ${day}
    Input Text    //div[@data-qa='message_input']/div    ${LIST_COMMAND} ${day}
    Click Element    //button[@data-qa='texty_send_button']
    Sleep    2s
    ${present}=    Run Keyword And Return Status    Element Should Be Visible   //button[@class='c-button-unstyled p-message_pane__unread_banner__msg']
    Run Keyword If    ${present}    Click Element    //button[@class='c-button-unstyled p-message_pane__unread_banner__msg']
    Sleep    1s
    Scroll Element Into View    (//div[@class='c-virtual_list__scroll_container'])[2]/div[@class='c-virtual_list__item'][last()]
    ${date}=    Get Date For Message Tab    ${day}
    Element Should Contain    (//div[@class='c-virtual_list__scroll_container'])[2]/div[@class='c-virtual_list__item'][last()]    Kukaan ei ole toimistolla ${date} 
    
