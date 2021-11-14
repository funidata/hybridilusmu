*** Settings ***
Library    Selenium2Library
Library    Screenshot
Library    ../resources/HelpFunc.py
Resource    ../resources/common.robot

Suite Setup    common.Open Slack In Browser And Login As User
Suite Teardown    common.Close Test Browser

*** Test Cases ***
Can Open Home Tab
    Maximize Browser Window
    Sleep    1s
    Scroll Element Into View    //span[@data-qa='channel_sidebar_name_test-hybridilusmu']
    Wait Until Element Is Visible    //span[@data-qa='channel_sidebar_name_test-hybridilusmu']
    Click Element    //span[@data-qa='channel_sidebar_name_test-hybridilusmu']
    Element Should Contain    //div[@data-qa='channel_name']    test-hybridilusmu 

Can Go To Message Tab
    Wait Until Element Is Visible    //button[@data-qa='messages']
    Click Element    //button[@data-qa='messages']
    Wait Until Element Is Visible    //div[@data-qa='message_input']/div

List Saturday Command Gives Correct Respond
    ${LIST_COMMAND}=    Get List Command
    Set Global Variable    ${LIST_COMMAND}    ${LIST_COMMAND}
    Input Text    //div[@data-qa='message_input']/div    ${LIST_COMMAND} la
    Click Element    //button[@data-qa='texty_send_button']
    Sleep    2s
    ${present}=    Run Keyword And Return Status    Element Should Be Visible   //button[@class='c-button-unstyled p-message_pane__unread_banner__msg']
    Run Keyword If    ${present}    Click Element    //button[@class='c-button-unstyled p-message_pane__unread_banner__msg']
    Sleep    1s
    Scroll Element Into View    (//div[@class='c-virtual_list__scroll_container'])[2]/div[@class='c-virtual_list__item'][last()]
    ${date}=    Get Date For Message Tab    la
    Element Should Contain    (//div[@class='c-virtual_list__scroll_container'])[2]/div[@class='c-virtual_list__item'][last()]    Kukaan ei ole toimistolla ${date}   

List Sunday Command Gives Correct Respond
    Input Text    //div[@data-qa='message_input']/div    ${LIST_COMMAND} su
    Click Element    //button[@data-qa='texty_send_button']
    Sleep    2s
    ${present}=    Run Keyword And Return Status    Element Should Be Visible   //button[@class='c-button-unstyled p-message_pane__unread_banner__msg']
    Run Keyword If    ${present}    Click Element    //button[@class='c-button-unstyled p-message_pane__unread_banner__msg']
    Sleep    1s
    Scroll Element Into View    (//div[@class='c-virtual_list__scroll_container'])[2]/div[@class='c-virtual_list__item'][last()]
    ${date}=    Get Date For Message Tab    su
    Element Should Contain    (//div[@class='c-virtual_list__scroll_container'])[2]/div[@class='c-virtual_list__item'][last()]    Kukaan ei ole toimistolla ${date}
