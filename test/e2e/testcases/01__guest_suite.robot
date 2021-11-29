*** Settings ***
Documentation    Tests to verify that user with guest role can not use the bot and gets correct error messages
Library    Selenium2Library
Library    Screenshot
Library    ./resources/HelpFunc.py
Resource    ./resources/common.robot
Resource    ./resources/elements.robot

Suite Setup    common.Open Slack In Browser And Login As Guest
Suite Teardown    common.Close Test Browser

*** Test Cases ***

Can Go To Guest Channel
    Maximize Browser Window
    Wait Until Element Is Visible    ${channel_name}
    Element Should Contain    ${channel_name}    vieraskanava

Use Slash Command In Guest Channel
    Set Global Variable    ${LIST_COMMAND}    /${COMMAND_PREFIX}listaa
    Input Text    ${message_input}    ${LIST_COMMAND} tänään
    Click Element    ${send_message_button}
    Sleep    1s
    Scroll Element Into View    ${latest_message}
    Element Should Contain    ${latest_message}    This command can't be used by guests in this workspace.  

Cannot See App Content
    Go To Home Tab
    Wait Until Element Is Visible    //div[@data-qa='app_home_bk_app_view']
    Element Should Contain    //div[@data-qa='app_home_bk_app_view']/*    Pahoittelut, @Vieras Käyttäjä. Olet vieraskäyttäjä tässä Slack-työtilassa, joten et voi käyttää tätä bottia.
    Element Should Not Contain    //div[@data-qa='app_home_bk_app_view']/*    Tiedot päivitetty
    Page Should Not Contain Element    //div[@data-qa='app_home_bk_app_view']//button

Error Message In Message Tab
    Go To Message Tab
    Sleep    1s
    Element Should Contain    ${latest_message}    Pahoittelut, @Vieras Käyttäjä. Olet vieraskäyttäjä tässä Slack-työtilassa, joten et voi käyttää tätä bottia.
    Input Text    ${message_input}    ${LIST_COMMAND} tänään
    Click Element    ${send_message_button}
    Sleep    1s
    Scroll Element Into View    ${latest_message}
    Element Should Contain    ${latest_message}    This command can't be used by guests in this workspace.  
